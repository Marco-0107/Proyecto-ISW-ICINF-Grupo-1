import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@context/AuthContext";
import axios from "@services/root.service";
import { getUsuariosReunion } from "@services/reunion.service";
import useEditReunion from "@hooks/reuniones/useEditReunion.jsx";
import TimePicker from "react-time-picker";
import CarruselUsuarios from "@components/CarruselUsuarios";
import ToastNotification from "@components/ToastNotification";
import ConfirmModal from "@components/ConfirmModal";
import "react-time-picker/dist/TimePicker.css";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001");

const DetalleReunion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { editarReunion } = useEditReunion();
    const observacionesRef = useRef(null);

    const [reunion, setReunion] = useState(null);
    const [usuariosReunion, setUsuariosReunion] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [tokenIngresado, setTokenIngresado] = useState("");
    const [mensajeAsistencia, setMensajeAsistencia] = useState("");
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

    const [toast, setToast] = useState({
        message: '',
        type: 'success',
        isVisible: false
    });

    const [confirmModal, setConfirmModal] = useState({
        isVisible: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    });

    // Estados para validaciones del formulario de edición
    const [editErrors, setEditErrors] = useState({});
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);

    const role = user?.rol?.toLowerCase();
    const isVecino = role === "vecino";
    const isSecretario = role === "secretario" || role === "tesorero";
    const isPresidenta = role === "presidenta" || role === "admin";

    const showToast = (message, type = 'success') => {
        setToast({
            message,
            type,
            isVisible: true
        });
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    const showConfirmModal = (title, message, onConfirm, type = 'warning') => {
        setConfirmModal({
            isVisible: true,
            title,
            message,
            onConfirm,
            type
        });
    };

    const hideConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isVisible: false }));
    };

    const handleConfirmAction = () => {
        if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
        }
        hideConfirmModal();
    };

    // Función para verificar si el formulario de edición es válido
    const isEditFormValid = () => {
        // Verificar campos obligatorios
        if (!editFormData.lugar?.trim() || !editFormData.descripcion?.trim()) {
            return false;
        }

        // Verificar fecha y hora
        if (!editFormData.fecha || !editFormData.hora) {
            return false;
        }

        // Verificar si hay errores activos
        if (Object.keys(editErrors).length > 0) {
            return false;
        }

        return true;
    };

    // Función para obtener mensaje de validación para la edición
    const getEditValidationMessage = () => {
        const issues = [];
        
        if (!editFormData.fecha) issues.push('fecha');
        if (!editFormData.hora) issues.push('hora');
        if (!editFormData.lugar?.trim()) issues.push('lugar');
        if (!editFormData.descripcion?.trim()) issues.push('descripción');
        
        // Verificar errores de validación específicos
        const errorKeys = Object.keys(editErrors);
        if (errorKeys.length > 0) {
            const errorMessages = errorKeys.map(key => {
                switch(key) {
                    case 'fecha': return 'fecha válida';
                    case 'hora': return 'hora válida';
                    case 'lugar': return 'lugar válido';
                    case 'descripcion': return 'descripción válida';
                    default: return key;
                }
            });
            return `Corrige: ${errorMessages.join(', ')}`;
        }
        
        if (issues.length > 0) {
            return `Completa: ${issues.join(', ')}`;
        }
        
        return '';
    };

    // Función para validar campos en tiempo real durante la edición
    const validateEditField = (name, value) => {
        const newErrors = { ...editErrors };
        
        switch(name) {
            case 'lugar':
                if (!value.trim()) {
                    newErrors.lugar = 'El lugar es obligatorio';
                } else if (value.trim().length < 3) {
                    newErrors.lugar = 'El lugar debe tener al menos 3 caracteres';
                } else {
                    delete newErrors.lugar;
                }
                break;
            case 'descripcion':
                if (!value.trim()) {
                    newErrors.descripcion = 'La descripción es obligatoria';
                } else if (value.trim().length < 10) {
                    newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
                } else if (value.trim().length > 500) {
                    newErrors.descripcion = 'La descripción no puede superar los 500 caracteres';
                } else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]/.test(value)) {
                    newErrors.descripcion = 'La descripción debe contener al menos una letra o número';
                } else {
                    delete newErrors.descripcion;
                }
                break;
        }
        
        setEditErrors(newErrors);
    };

    useEffect(() => {
        const reunionIdEnCurso = localStorage.getItem("reunion_en_curso");
        if (!reunionIdEnCurso && !isPresidenta && !isSecretario && !isVecino) {
            showConfirmModal(
                "Reunión Inactiva",
                "Esta reunión no está activa. ¿Deseas ver el detalle igual?",
                () => cargarDatos(),
                'info'
            );
            return;
        }

        cargarDatos();
        const intervalo = setInterval(() => cargarDatos(), 10000);

        socket.emit("unirseSala", id);
        socket.on("mensajeObservaciones", (nuevasObservaciones) => {
            setReunion(prev => ({ ...prev, observaciones: nuevasObservaciones }));
            setTimeout(() => {
                observacionesRef.current?.scrollTo({
                    top: observacionesRef.current.scrollHeight,
                    behavior: "smooth",
                });
            }, 100);
        });
        return () => {
            clearInterval(intervalo);
            socket.off("mensajeObservaciones");
            socket.emit("salirSala", id);
        };
    }, [id]);

    const limpiarTexto = (texto) => {
        return texto.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "'").replace(/\\/g, "").trim();
    };

    const cargarDatos = async () => {
        try {
            const { data } = await axios.get(`/reunion/detail/?id_reunion=${id}`);

            setReunion(prev => ({
                ...data.data,
                observaciones: prev?.observaciones && prev.observaciones.length > data.data.observaciones?.length 
                    ? prev.observaciones 
                    : data.data.observaciones
            }));
            

            setTimeout(() => {
                hideToast();
            }, 2000);
            
        } catch (error) {
            showToast("No se pudo cargar la reunión", 'error');
            navigate("/reuniones");
        }
        getUsuariosReunion(id)
            .then(setUsuariosReunion)
            .catch(() => {});
    };

    const handleFinalizar = () => {
        localStorage.removeItem("reunion_en_curso");
        navigate("/reuniones");
    };

    const handleEditarClick = () => {
        const fechaObj = new Date(reunion.fecha_reunion);
        setEditFormData({
            fecha: fechaObj.toISOString().slice(0, 10),
            hora: `${fechaObj.getHours().toString().padStart(2, "0")}:${fechaObj.getMinutes().toString().padStart(2, "0")}`,
            lugar: reunion.lugar,
            descripcion: reunion.descripcion,
            observaciones: reunion.observaciones,
        });
        setEditErrors({});
        setIsEditSubmitting(false);
        setEditMode(true);
    };

    const handleGuardarEdicion = async e => {
        e.preventDefault();
        setIsEditSubmitting(true);

        // Validar el formulario antes de enviar
        if (!isEditFormValid()) {
            setIsEditSubmitting(false);
            const validationMessage = getEditValidationMessage();
            showToast(validationMessage, 'error');
            return;
        }

        if (!editFormData.fecha || !editFormData.hora) {
            showToast("Debes ingresar una fecha y hora válidas.", 'error');
            setIsEditSubmitting(false);
            return;
        }
        try {
            const fechaCompleta = new Date(`${editFormData.fecha}T${editFormData.hora || "00:00"}`);
            await editarReunion(id, {
                fecha_reunion: fechaCompleta.toISOString(),
                lugar: limpiarTexto(editFormData.lugar),
                descripcion: limpiarTexto(editFormData.descripcion),
                observaciones: editFormData.observaciones,
            });
            setEditMode(false);
            setEditErrors({});
            cargarDatos();
            showToast("¡Cambios guardados correctamente!", 'success');
        } catch {
            showToast("Hubo un error al guardar los cambios. Revisa los datos ingresados.", 'error');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const marcarAsistencia = async () => {
        setMensajeAsistencia(""); 
        
        try {
            const numero = parseInt(tokenIngresado);
            if (isNaN(numero)) {
                setMensajeAsistencia("❌ Debes ingresar un número válido.");
                return;
            }

            // Validar token
            const { data: detalleToken } = await axios.get(`/token/detail/?numero_token=${numero}`);
            const token = detalleToken.data;
            
            if (!token || token.id_reunion !== parseInt(id)) {
                setMensajeAsistencia("❌ Este token no corresponde a esta reunión.");
                return;
            }
            
            if (token.estado !== "activo") {
                setMensajeAsistencia("❌ Este token ya fue cerrado y no se puede usar, si aun no ha sido registrado, favor avisar a la presidenta.");
                return;
            }

            // Buscar usuario actual
            const usuarioActual = usuariosReunion.find(u => u.User?.rut === user.rut);
            if (!usuarioActual) {
                setMensajeAsistencia("⚠️ No estás registrado en esta reunión.");
                return;
            }
            
            if (usuarioActual.asistio) {
                setMensajeAsistencia("⚠️ Ya estás marcado como presente en esta reunión.");
                return;
            }

            // Marcar asistencia 
            await axios.post("/usuario-reunion", {
                id_usuario: usuarioActual.id_usuario,
                id_reunion: parseInt(id),
                numero_token: numero,
                id_token: token.id_token,
            });


            setMensajeAsistencia("✅ Asistencia confirmada correctamente");
            setTokenIngresado(""); 
            cargarDatos(); 

        } catch (error) {
            if (error.response && error.response.status >= 400) {
                const mensaje = error.response.data?.message || "Error del servidor";
                setMensajeAsistencia(`❌ ${mensaje}`);
            } else {

                setMensajeAsistencia("✅ Asistencia confirmada correctamente");
                setTokenIngresado("");
                cargarDatos();
            }
        }
    };

    const enviarObservacion = async () => {
        if (!nuevoMensaje.trim()) return;
        if (!isSecretario && !isPresidenta && !isTesorera && !isAdmin) {
            showToast("Solo secretario/tesorera, presidenta o admin pueden enviar observaciones.", 'error');
            return;
        }
        const form = `[${new Date().toLocaleTimeString()}] ${user?.nombre || "Usuario"} (${user?.rol}): ${limpiarTexto(nuevoMensaje)}\n`;
        const nuevas = (reunion?.observaciones || "") + form;
        
        // Actualizar estado local inmediatamente
        setReunion(prev => ({ ...prev, observaciones: nuevas }));
        setNuevoMensaje("");
        
        try {
            await editarReunion(id, {
                fecha_reunion: reunion.fecha_reunion,
                lugar: reunion.lugar,
                descripcion: reunion.descripcion,
                observaciones: nuevas,
            });

            socket.emit("mensajeObservaciones", { sala: id, mensaje: nuevas });
        } catch (error) {
            setReunion(prev => ({ ...prev, observaciones: reunion?.observaciones || "" }));
            showToast("Error al enviar la observación", 'error');
        }
    };

    const handleToggleAsistencia = (usuario) => {
        showConfirmModal(
            "Cambiar Asistencia",
            `¿Deseas ${usuario.asistio ? "quitar" : "marcar"} asistencia de ${usuario.User?.nombre} ${usuario.User?.apellido}?`,
            async () => {
                try {
                    await axios.patch(`/usuario-reunion/detail/?id_usuario=${usuario.id_usuario}&id_reunion=${id}`);
                    cargarDatos();
                    showToast(`¡Asistencia ${usuario.asistio ? 'quitada' : 'marcada'} correctamente!`, 'success');
                } catch (error) {
                    showToast("Error al actualizar la asistencia", 'error');
                }
            },
            'warning'
        );
    };

    if (!reunion) return <p>Cargando reunión...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex flex-col">
            {/* Carrusel de usuarios */}
            <CarruselUsuarios
                usuarios={isVecino ? usuariosReunion.filter(u => u.User?.rut === user.rut) : usuariosReunion}
                isVecino={isVecino}
                isPresidenta={isPresidenta}
                onToggleAsistencia={handleToggleAsistencia}
                idReunion={id}
                id_token={reunion?.id_token}
            />

            {/* Contenedor principal responsive */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-auto">
                {/* Columna izquierda */}
                <div className="flex-1 space-y-4">
                    {/* Detalle de reunión */}
                    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-4 space-y-4 border-2 border-green-200">
                        {/* Información de la reunión */}
                        <div className="bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-xl p-3">
                            <h2 className="text-lg font-bold mb-3 text-green-800">Detalle de la Reunión</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Lugar:</span>
                                    <span className="text-gray-900">{reunion.lugar}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Fecha:</span>
                                    <span className="text-gray-900">{new Date(reunion.fecha_reunion).toLocaleString()}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-semibold text-gray-700">Descripción:</span>
                                    <span className="text-gray-900 flex-1">{reunion.descripcion}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Última actualización:</span>
                                    <span className="text-gray-900">{reunion.fechaActualizacion ? new Date(reunion.fechaActualizacion).toLocaleString() : "—"}</span>
                                </div>
                            </div>
                        </div>
                        {/* Observaciones mejoradas como chat */}
                        <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl p-3">
                            <h3 className="font-bold mb-3 text-green-800 flex items-center text-base">
                                Anotaciones Importantes
                            </h3>
                            <div
                                ref={observacionesRef}
                                className="bg-white border-2 border-gray-200 rounded-lg p-3 text-sm shadow-inner"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 25px, #f9fafb 25px, #f9fafb 26px)',
                                    minHeight: '80px'
                                }}
                            >
                                {reunion.observaciones
                                    ? reunion.observaciones.trim().split("\n").filter(l => l.trim()).map((l, i) => (
                                        <div key={i} className="mb-2 p-2 bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-lg shadow-sm">
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                                                <span className="text-gray-800 leading-relaxed text-sm">{l}</span>
                                            </div>
                                        </div>
                                    ))
                                    : <div className="text-center text-gray-500 italic py-4">
                                        <div className="text-2xl mb-1">📝</div>
                                        <p className="text-sm">No hay observaciones aún</p>
                                        <p className="text-xs">Las anotaciones aparecerán aquí</p>
                                      </div>
                                }
                            </div>

                            {(isSecretario || isPresidenta) && (
                                <div className="mt-3 space-y-2">
                                    <textarea
                                        placeholder="Escribe una observación importante..."
                                        value={nuevoMensaje}
                                        onChange={(e) => setNuevoMensaje(e.target.value)}
                                        rows={2}
                                        className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none"
                                    />
                                    <button
                                        onClick={enviarObservacion}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-1.5 px-3 rounded-lg text-sm shadow-md transform hover:scale-105 transition-all duration-200"
                                    >
                                        Agregar observación
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="lg:w-72 xl:w-80 space-y-4 flex flex-col">
                    {isPresidenta && (
                        <div className={`bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl shadow-lg ${
                            reunion.archivo_acta ? 'p-3' : 'p-4'
                        }`}>
                            <h3 className={`font-bold text-green-800 ${
                                reunion.archivo_acta ? 'text-xs mb-2' : 'text-sm mb-3'
                            }`}>
                                {reunion.archivo_acta ? 'Cambiar Acta' : 'Subir Acta de Reunión'}
                            </h3>
                            {!reunion.archivo_acta && (
                                <p className="text-xs text-gray-600 mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                    Formatos permitidos: PDF
                                </p>
                            )}
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!archivoSeleccionado) {
                                        showToast("Selecciona un archivo", 'error');
                                        return;
                                    }

                                    const formData = new FormData();
                                    formData.append("archivo", archivoSeleccionado);

                                    try {
                                        const res = await axios.post(`/reunion/cargar-acta/${id}`, formData, {
                                            headers: { "Content-Type": "multipart/form-data" },
                                        });

                                        showToast("¡Acta cargada correctamente!", 'success');
                                        setReunion(prev => ({ ...prev, archivo_acta: res.data.data.archivo.id }));
                                        setArchivoSeleccionado(null); 
                                    } catch (err) {
                                        const errorMsg = err.response?.data?.details || "Error al cargar el acta";
                                        showToast(errorMsg, 'error');
                                    }
                                }}
                                className="space-y-3"
                            >
                                {/* Área de selección de archivo mejorada */}
                                <div className="space-y-2">
                                    {!archivoSeleccionado ? (
                                        <label
                                            htmlFor="acta"
                                            className={`block w-full cursor-pointer border-2 border-dashed border-green-300 rounded-lg text-center hover:border-green-400 transition-colors bg-gradient-to-r from-green-50 to-white ${
                                                reunion.archivo_acta ? 'p-3' : 'p-6'
                                            }`}
                                        >
                                            <div className={`mb-1 ${
                                                reunion.archivo_acta ? 'text-2xl' : 'text-4xl mb-2'
                                            }`}>📄</div>
                                            <div className={`font-medium text-gray-700 ${
                                                reunion.archivo_acta ? 'text-xs mb-0.5' : 'text-sm mb-1'
                                            }`}>
                                                {reunion.archivo_acta ? 'Cambiar Acta' : 'Seleccionar Acta'}
                                            </div>
                                            {!reunion.archivo_acta && (
                                                <div className="text-xs text-gray-500">
                                                    PDF
                                                </div>
                                            )}
                                            <input
                                                id="acta"
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt"
                                                onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    ) : (
                                        <div className="space-y-2">
                                            {/* Archivo seleccionado con opciones */}
                                            <div className={`text-green-700 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg text-center font-medium ${
                                                reunion.archivo_acta ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
                                            }`}>
                                                📄 {archivoSeleccionado.name}
                                            </div>
                                            
                                            {/* Botones de acción */}
                                            <div className="flex gap-2">
                                                <label
                                                    htmlFor="acta-replace"
                                                    className={`flex-1 cursor-pointer text-blue-600 bg-blue-50 border-2 border-blue-300 hover:bg-blue-100 rounded-lg font-medium text-center transition-all duration-200 ${
                                                        reunion.archivo_acta ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-xs'
                                                    }`}
                                                >
                                                    Cambiar archivo
                                                    <input
                                                        id="acta-replace"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.txt"
                                                        onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                                                        className="hidden"
                                                    />
                                                </label>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => setArchivoSeleccionado(null)}
                                                    className={`flex-1 text-red-600 bg-red-50 border-2 border-red-300 hover:bg-red-100 rounded-lg font-medium transition-all duration-200 ${
                                                        reunion.archivo_acta ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-xs'
                                                    }`}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Información del archivo */}
                                    {archivoSeleccionado && !reunion.archivo_acta && (
                                        <div className="bg-green-50 border border-green-200 p-2 rounded-lg text-xs text-green-700 text-center">
                                            <span>Tamaño: {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={!archivoSeleccionado}
                                    className={`w-full font-semibold rounded-lg transition-all duration-200 shadow-md transform hover:scale-105 ${
                                        reunion.archivo_acta 
                                            ? 'py-2 px-3 text-xs' 
                                            : 'py-3 px-4 text-sm'
                                    } ${
                                        archivoSeleccionado
                                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                            : "bg-gray-400 text-gray-200 cursor-not-allowed transform-none"
                                    }`}
                                >
                                    {archivoSeleccionado 
                                        ? (reunion.archivo_acta ? "Reemplazar Acta" : "Subir Acta") 
                                        : "Selecciona un archivo primero"
                                    }
                                </button>
                            </form>
                        </div>
                    )}
                    
                    {/* Botón para ingresar token (solo vecinos) */}
                    {isVecino && (
                        <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                            <h3 className="font-bold mb-4 text-green-800">Confirmar Asistencia</h3>
                            <div className="flex flex-col space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={tokenIngresado}
                                        onChange={(e) => setTokenIngresado(e.target.value)}
                                        placeholder="Ingrese el token"
                                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg text-center font-mono focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                    />
                                </div>
                                <button
                                    onClick={marcarAsistencia}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg text-sm shadow-md transform hover:scale-105 transition-all duration-200"
                                >
                                    Confirmar asistencia
                                </button>
                                {mensajeAsistencia && (
                                    <div className={`text-sm text-center p-3 rounded-lg ${
                                        mensajeAsistencia.includes("✅") 
                                            ? "text-green-700 bg-green-50 border border-green-200" 
                                            : "text-red-700 bg-red-50 border border-red-200"
                                    }`}>
                                        {mensajeAsistencia}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bloque de descarga */}
                    {reunion.archivo_acta && (
                        <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                            <h3 className="font-bold text-green-800 text-sm md:text-base mb-4">Acta de la Reunión</h3>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await axios.get(`/reunion/descargar-acta/${id}`, {
                                            responseType: 'blob'
                                        });

                                        const contentDisposition = response.headers['content-disposition'];
                                        let filename = `acta-reunion-${id}.pdf`;
                                        
                                        if (contentDisposition) {
                                            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                                            if (filenameMatch && filenameMatch[1]) {
                                                filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
                                            }
                                        }

                                        const blob = new Blob([response.data]);
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = filename;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);

                                        showToast("¡Acta descargada correctamente!", 'success');
                                    } catch (error) {
                                        const errorMsg = error.response?.data?.details || "Error al descargar el acta";
                                        showToast(errorMsg, 'error');
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-sm text-center shadow-md transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2"
                            >
                                📄 Descargar Acta
                            </button>
                        </div>
                    )}

                    {/* Editar reunión mejorado */}
                    {isPresidenta && (
                        <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                            {!editMode ? (
                                <button
                                    onClick={handleEditarClick}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-lg text-sm shadow-md transform hover:scale-105 transition-all duration-200"
                                >
                                    Editar Reunión
                                </button>
                            ) : (
                                <form onSubmit={handleGuardarEdicion} className="space-y-4">
                                    <h3 className="font-bold text-green-800 mb-4">Editar Detalles</h3>
                                    <input
                                        type="date"
                                        value={editFormData.fecha}
                                        onChange={e => setEditFormData({ ...editFormData, fecha: e.target.value })}
                                        required
                                        className="block border-2 border-gray-300 rounded-lg p-3 w-full text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                    />
                                    <div className="custom-time-picker">
                                        <TimePicker
                                            onChange={value => setEditFormData({ ...editFormData, hora: value })}
                                            value={editFormData.hora}
                                            disableClock
                                            className="block w-full border-2 border-gray-300 rounded-lg focus:border-green-500 transition-all duration-200"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={editFormData.lugar}
                                        onChange={e => {
                                            setEditFormData({ ...editFormData, lugar: e.target.value });
                                            validateEditField('lugar', e.target.value);
                                        }}
                                        required
                                        className={`block border rounded p-2 w-full text-sm ${
                                            editErrors.lugar ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Lugar"
                                    />
                                    {editErrors.lugar && (
                                        <p className="text-xs text-red-600">{editErrors.lugar}</p>
                                    )}
                                    <textarea
                                        value={editFormData.descripcion}
                                        onChange={e => {
                                            setEditFormData({ ...editFormData, descripcion: e.target.value });
                                            validateEditField('descripcion', e.target.value);
                                        }}
                                        className={`block border rounded p-2 w-full text-sm ${
                                            editErrors.descripcion ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Descripción"
                                        rows={2}
                                    />
                                    {editErrors.descripcion && (
                                        <p className="text-xs text-red-600">{editErrors.descripcion}</p>
                                    )}
                                    
                                    {/* Mostrar mensaje de validación si el formulario no es válido */}
                                    {!isEditFormValid() && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                            <p className="text-xs text-yellow-800">
                                                <strong>⚠️ {getEditValidationMessage()}</strong>
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            type="submit" 
                                            disabled={!isEditFormValid() || isEditSubmitting}
                                            className={`flex-1 font-semibold py-2 px-3 rounded text-sm ${
                                                !isEditFormValid() || isEditSubmitting
                                                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                        >
                                            {isEditSubmitting ? 'Guardando...' : 'Guardar'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setEditMode(false);
                                                setEditErrors({});
                                            }} 
                                            disabled={isEditSubmitting}
                                            className={`flex-1 font-semibold py-2 px-3 rounded text-sm ${
                                                isEditSubmitting 
                                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                                            }`}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Botón salir */}
                    <div className="bg-gradient-to-br from-white to-red-50 p-3 rounded-xl border-2 border-red-200 shadow-lg">
                        <button
                            onClick={handleFinalizar}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transform hover:scale-105 transition-all duration-200"
                        >
                            Salir de la Reunión
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Toast Notification */}
            <ToastNotification
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={4000}
            />
            
            {/* Confirm Modal */}
            <ConfirmModal
                isVisible={confirmModal.isVisible}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={handleConfirmAction}
                onCancel={hideConfirmModal}
                type={confirmModal.type}
            />
        </div>
    );
}

export default DetalleReunion;