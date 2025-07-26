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
    const [archivosOcultos, setArchivosOcultos] = useState(() => {
        const ocultos = localStorage.getItem('archivos_ocultos');
        return ocultos ? JSON.parse(ocultos) : [];
    });

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

    const role = user?.rol?.toLowerCase();
    const isVecino = role === "vecino";
    const isSecretario = role === "secretario" || role === "tesorero";
    const isPresidenta = role === "presidenta" || role === "admin";

    // Función para ocultar archivo
    const ocultarArchivo = (archivoUrl) => {
        const nuevosOcultos = [...archivosOcultos, archivoUrl];
        setArchivosOcultos(nuevosOcultos);
        localStorage.setItem('archivos_ocultos', JSON.stringify(nuevosOcultos));
    };

    // Función para mostrar archivo (cuando se sube uno nuevo)
    const mostrarArchivo = (archivoUrl) => {
        const nuevosOcultos = archivosOcultos.filter(url => url !== archivoUrl);
        setArchivosOcultos(nuevosOcultos);
        localStorage.setItem('archivos_ocultos', JSON.stringify(nuevosOcultos));
    };

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
        setEditMode(true);
    };

    const handleGuardarEdicion = async e => {
        e.preventDefault();
        if (!editFormData.fecha || !editFormData.hora) {
            showToast("Debes ingresar una fecha y hora válidas.", 'error');
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
            cargarDatos();
            showToast("¡Cambios guardados correctamente!", 'success');
        } catch {
            showToast("Hubo un error al guardar los cambios. Revisa los datos ingresados.", 'error');
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
                <div className="flex-1 space-y-6">
                    {/* Detalle de reunión */}
                    <div className="bg-white shadow rounded-lg p-4 md:p-6 space-y-6 border border-black">
                        {/* Información de la reunión */}
                        <div>
                            <h2 className="text-xl font-bold mb-4">Detalle de la Reunión</h2>
                            <div className="space-y-2 text-sm md:text-base">
                                <p><strong>Lugar:</strong> {reunion.lugar}</p>
                                <p><strong>Fecha:</strong> {new Date(reunion.fecha_reunion).toLocaleString()}</p>
                                <p><strong>Descripción:</strong> {reunion.descripcion}</p>
                                <p><strong>Última actualización:</strong> {reunion.fechaActualizacion ? new Date(reunion.fechaActualizacion).toLocaleString() : "—"}</p>
                            </div>
                        </div>
                        {/* Observaciones */}
                        <div>
                            <h3 className="font-semibold mb-2">Anotaciones Importantes</h3>
                            <div
                                ref={observacionesRef}
                                className="bg-gray-100 p-3 rounded h-40 md:h-52 overflow-y-auto text-sm"
                            >
                                {reunion.observaciones
                                    ? reunion.observaciones.trim().split("\n").filter(l => l.trim()).map((l, i) => (
                                        <div key={i} className="mb-1 pb-1 border-b border-gray-300">{l}</div>
                                    ))
                                    : <i>No hay observaciones aún.</i>
                                }
                            </div>

                            {(isSecretario || isPresidenta) && (
                                <>
                                    <textarea
                                        placeholder="Escribe una observación..."
                                        value={nuevoMensaje}
                                        onChange={(e) => setNuevoMensaje(e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded p-2 mt-2 text-sm"
                                    />
                                    <button
                                        onClick={enviarObservacion}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded mt-1 text-sm"
                                    >
                                        Agregar observación
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="lg:w-80 xl:w-96 space-y-4 flex flex-col">
                    {isPresidenta && (
                        <div className="bg-white p-4 rounded border">
                            <h3 className="font-semibold mb-2 text-sm md:text-base">Para subir el acta, recuerde que el archivo debe ser .pdf</h3>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!archivoSeleccionado) {
                                        showToast("Selecciona un archivo", 'error');
                                        return;
                                    }

                                    const formData = new FormData();
                                    formData.append("archivo", archivoSeleccionado);
                                    formData.append("tipo", "actas");
                                    formData.append("id", id);
                                    formData.append("nombre", `Acta Reunion ${id}`);

                                    try {
                                        const res = await axios.post("/archivo", formData, {
                                            headers: { "Content-Type": "multipart/form-data" },
                                        });

                                        const actaURL = res.data?.data?.archivo;

                                        await axios.patch(`/reunion/archivo-acta/${id}`, {
                                            archivo_acta: actaURL,
                                        });

                                        showToast("¡Acta subida y asociada a la reunión correctamente!", 'success');
                                        setReunion(prev => ({ ...prev, archivo_acta: actaURL }));
                                        setArchivoSeleccionado(null); 
                                        mostrarArchivo(actaURL); 
                                    } catch (err) {
                                        showToast("Error al subir o guardar el acta", 'error');
                                    }
                                }}
                                className="space-y-3"
                            >
                                {/* Área de selección de archivo */}
                                <div className="space-y-2">
                                    {!archivoSeleccionado ? (
                                        <label
                                            htmlFor="acta"
                                            className="block w-full cursor-pointer px-4 py-2 rounded shadow-sm transition text-center text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Seleccionar Acta 📎
                                            <input
                                                id="acta"
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    ) : (
                                        <div className="space-y-2">
                                            {/* Archivo seleccionado con opciones */}
                                            <div className="text-green-700 bg-green-50 border-2 border-green-300 rounded px-4 py-2 text-center text-sm font-medium">
                                                📄 {archivoSeleccionado.name}
                                            </div>
                                            
                                            {/* Botones de acción */}
                                            <div className="flex gap-2">
                                                <label
                                                    htmlFor="acta-replace"
                                                    className="flex-1 cursor-pointer text-blue-600 bg-blue-50 border border-blue-300 hover:bg-blue-100 px-3 py-1 rounded text-xs font-medium text-center transition"
                                                >
                                                    🔄 Cambiar archivo
                                                    <input
                                                        id="acta-replace"
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                                                        className="hidden"
                                                    />
                                                </label>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => setArchivoSeleccionado(null)}
                                                    className="flex-1 text-red-600 bg-red-50 border border-red-300 hover:bg-red-100 px-3 py-1 rounded text-xs font-medium transition"
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Información del archivo */}
                                    {archivoSeleccionado && (
                                        <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 text-center">
                                            <span>Tamaño: {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={!archivoSeleccionado}
                                    className={`w-full font-semibold py-2 px-4 rounded transition text-sm ${
                                        archivoSeleccionado
                                            ? "bg-green-600 hover:bg-green-700 text-white"
                                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    }`}
                                >
                                    {archivoSeleccionado ? "Subir Acta" : "Selecciona un archivo primero"}
                                </button>
                            </form>
                        </div>
                    )}
                    
                    {/* Botón para ingresar token (solo vecinos) */}
                    {isVecino && (
                        <div className="bg-white p-4 rounded border">
                            <div className="flex flex-col space-y-3">
                                <input
                                    type="text"
                                    value={tokenIngresado}
                                    onChange={(e) => setTokenIngresado(e.target.value)}
                                    placeholder="Ingrese el token"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-lg text-center font-semibold"
                                />
                                <button
                                    onClick={marcarAsistencia}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm"
                                >
                                    Confirmar asistencia
                                </button>
                                {mensajeAsistencia && (
                                    <p className={`text-sm text-center ${mensajeAsistencia.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                                        {mensajeAsistencia}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bloque de descarga (visible para todos si hay acta y no está oculta) */}
                    {reunion.archivo_acta && !archivosOcultos.includes(reunion.archivo_acta) && (
                        <div className="bg-white p-4 rounded border">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-sm md:text-base">Acta de la Reunión</h3>
                                <button
                                    onClick={() => ocultarArchivo(reunion.archivo_acta)}
                                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs font-medium transition-colors"
                                    title="Ocultar acta de la vista"
                                >
                                    ✕
                                </button>
                            </div>
                            <a
                                href={reunion.archivo_acta}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-sm hover:text-blue-800 inline-flex items-center gap-1"
                            >
                                📄 Descargar Acta
                            </a>
                        </div>
                    )}

                    {/* Editar reunión */}
                    {isPresidenta && (
                        <div className="bg-white p-4 rounded border">
                            {!editMode ? (
                                <button
                                    onClick={handleEditarClick}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm"
                                >
                                    Editar reunión
                                </button>
                            ) : (
                                <form onSubmit={handleGuardarEdicion} className="space-y-3">
                                    <input
                                        type="date"
                                        value={editFormData.fecha}
                                        onChange={e => setEditFormData({ ...editFormData, fecha: e.target.value })}
                                        required
                                        className="block border border-gray-300 rounded p-2 w-full text-sm"
                                    />
                                    <TimePicker
                                        onChange={value => setEditFormData({ ...editFormData, hora: value })}
                                        value={editFormData.hora}
                                        disableClock
                                        className="block w-full"
                                    />
                                    <input
                                        type="text"
                                        value={editFormData.lugar}
                                        onChange={e => setEditFormData({ ...editFormData, lugar: e.target.value })}
                                        required
                                        className="block border border-gray-300 rounded p-2 w-full text-sm"
                                        placeholder="Lugar"
                                    />
                                    <textarea
                                        value={editFormData.descripcion}
                                        onChange={e => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                                        className="block border border-gray-300 rounded p-2 w-full text-sm"
                                        placeholder="Descripción"
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded text-sm">
                                            Guardar
                                        </button>
                                        <button type="button" onClick={() => setEditMode(false)} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded text-sm">
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Botón salir */}
                    <div className="bg-white p-4 rounded border">
                        <button
                            onClick={handleFinalizar}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-sm"
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