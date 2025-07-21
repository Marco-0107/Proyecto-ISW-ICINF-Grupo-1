import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@context/AuthContext";
import axios from "@services/root.service";
import { getUsuariosReunion } from "@services/reunion.service";
import useEditReunion from "@hooks/reuniones/useEditReunion.jsx";
import TimePicker from "react-time-picker";
import CarruselUsuarios from "@components/CarruselUsuarios";
import "@styles/reunion.css";
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
    const [tokenActivo, setTokenActivo] = useState(null);

    const role = user?.rol?.toLowerCase();
    const isVecino = role === "vecino";
    const isSecretario = role === "secretario" || role === "tesorero";
    const isPresidenta = role === "presidenta" || role === "admin";

    useEffect(() => {
        const reunionIdEnCurso = localStorage.getItem("reunion_en_curso");
        if (!reunionIdEnCurso && !isPresidenta && !isSecretario && !isVecino) {
            const continuar = confirm("Esta reunión no está activa. ¿Deseas ver el detalle igual?");
            if (!continuar) return navigate("/reuniones");
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
            setReunion(data.data);
        } catch (error) {
            alert("No se pudo cargar la reunión");
            navigate("/reuniones");
        }
        getUsuariosReunion(id)
            .then(setUsuariosReunion)
            .catch(console.error);
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
            objetivo: reunion.objetivo,
            observaciones: reunion.observaciones,
        });
        setEditMode(true);
    };

    const handleGuardarEdicion = async e => {
        e.preventDefault();
        if (!editFormData.fecha || !editFormData.hora) {
            alert("Debes ingresar una fecha y hora válidas.");
            return;
        }
        try {
            const fechaCompleta = new Date(`${editFormData.fecha}T${editFormData.hora || "00:00"}`);
            await editarReunion(id, {
                fecha_reunion: fechaCompleta.toISOString(),
                lugar: limpiarTexto(editFormData.lugar),
                descripcion: limpiarTexto(editFormData.descripcion),
                objetivo: limpiarTexto(editFormData.objetivo),
                observaciones: editFormData.observaciones,
            });
            setEditMode(false);
            cargarDatos();
        } catch {
            alert("Hubo un error al guardar los cambios. Revisa los datos ingresados.");
        }
    };

    const marcarAsistencia = async () => {
        try {
            const numero = parseInt(tokenIngresado);
            if (isNaN(numero)) {
                setMensajeAsistencia("❌ Debes ingresar un número válido.");
                return;
            }
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
            const usuarioActual = usuariosReunion.find(u => u.User?.rut === user.rut);
            if (!usuarioActual) {
                setMensajeAsistencia("⚠️ No estás registrado en esta reunión.");
                return;
            }
            if (usuarioActual.asistio) {
                setMensajeAsistencia("⚠️ Ya estás marcado como presente en esta reunión.");
                return;
            }
            await axios.post("/usuario-reunion", {
                id_usuario: usuarioActual.id_usuario,
                id_reunion: parseInt(id),
                numero_token: numero,
                id_token: token.id_token,
            });
            setMensajeAsistencia("✅ Asistencia registrada correctamente");
            cargarDatos();
        } catch (error) {
            setMensajeAsistencia(error.response?.data?.message || "❌ Error al validar asistencia");
        }
    };

    const generarToken = async () => {
        try {
            const tokensUsados = usuariosReunion
                .filter(u => u.id_token && u.id_reunion === parseInt(id))
                .map(u => u.id_token);
            const tokensUnicos = [...new Set(tokensUsados)];
            for (const idToken of tokensUnicos) {
                const { data } = await axios.get(`/token/detail/?id_token=${idToken}`);
                const token = data.data;
                if (token.id_reunion === parseInt(id)) {
                    if (token.estado === "activo") {
                        alert("⚠️ Ya existe un token activo para esta reunión.");
                        setTokenActivo(token);
                        return;
                    }
                    if (token.estado === "cerrado") {
                        alert("❌ Ya existe un token cerrado para esta reunión. Si un vecino no se registró, debes marcar su asistencia manualmente.");
                        setTokenActivo(token);
                        return;
                    }
                }
            }
            const res = await axios.post("/token", { id_reunion: parseInt(id) });
            const nuevo = res.data.data;
            setTokenActivo(nuevo);
            alert(`✅ Token generado: ${nuevo.numero_token}`);
        } catch {
            alert("❌ Error al generar el token");
        }
    };

    const enviarObservacion = async () => {
        if (!nuevoMensaje.trim()) return;
        if (!isSecretario && !isPresidenta) return alert("Solo secretario/tesorero, presidenta o admin pueden enviar observaciones.");
        const form = `[${new Date().toLocaleTimeString()}] ${user?.nombre || "Usuario"} (${user?.rol}): ${limpiarTexto(nuevoMensaje)}\n`;
        const nuevas = (reunion?.observaciones || "") + form;
        try {
            await editarReunion(id, {
                fecha_reunion: reunion.fecha_reunion,
                lugar: reunion.lugar,
                descripcion: reunion.descripcion,
                objetivo: reunion.objetivo,
                observaciones: nuevas,
            });
            setReunion(prev => ({ ...prev, observaciones: nuevas }));
            socket.emit("mensajeObservaciones", { sala: id, mensaje: nuevas });
            setNuevoMensaje("");
        } catch {
            console.error("Error al actualizar observaciones");
        }
    };

    const handleToggleAsistencia = async (usuario) => {
        if (!confirm(`¿Deseas ${usuario.asistio ? "quitar" : "marcar"} asistencia de ${usuario.User?.nombre} ${usuario.User?.apellido}?`)) {
            return;
        }

        try {
            await axios.patch(`/usuario-reunion/detail/?id_usuario=${usuario.id_usuario}&id_reunion=${id}`);
            cargarDatos();
        } catch (error) {
            alert("Error al actualizar la asistencia");
            console.error(error);
        }
    };

    if (!reunion) return <p>Cargando reunión...</p>;

    return (
        <div className="min-h-screen w-full bg-gray-50 px-6 py-6 flex flex-col gap-6">
            {/* Carrusel de usuarios */}
            <CarruselUsuarios
                usuarios={isVecino ? usuariosReunion.filter(u => u.User?.rut === user.rut) : usuariosReunion}
                isVecino={isVecino}
                isPresidenta={isPresidenta}
                onToggleAsistencia={handleToggleAsistencia}
            />

            {/* Detalle de reunión */}
            <div className="w-full max-w-4xl bg-white shadow rounded p-6 space-y-6">
                {/* Botón token */}
                {isPresidenta && !tokenActivo && (
                    <button onClick={generarToken} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
                        🎟️ Generar token de asistencia
                    </button>
                )}

                {tokenActivo && (
                    <div className="p-3 bg-blue-100 rounded space-y-2">
                        <strong>🎟️ Token actual:</strong> {tokenActivo.numero_token}
                        <div className="flex gap-2 items-center">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded"
                                onClick={() => {
                                    navigator.clipboard.writeText(tokenActivo.numero_token);
                                    alert("Token copiado al portapapeles");
                                }}
                            >
                                Copiar token
                            </button>
                            <span className={tokenActivo.estado === "activo" ? "text-green-600" : "text-red-600"}>
                                {tokenActivo.estado === "activo" ? "Activo ✅" : "Cerrado ❌"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Confirmación por vecino */}
                {isVecino && (
                    <div className="bg-blue-100 p-4 rounded">
                        <h3 className="font-semibold mb-2">Confirmar asistencia con token</h3>
                        <input
                            type="text"
                            value={tokenIngresado}
                            onChange={e => setTokenIngresado(e.target.value)}
                            placeholder="Ingresa el token entregado"
                            className="border border-gray-300 rounded p-2 mr-2"
                        />
                        <button onClick={marcarAsistencia} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded">
                            Validar
                        </button>
                        {mensajeAsistencia && (
                            <p className={`mt-2 ${mensajeAsistencia.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                                {mensajeAsistencia}
                            </p>
                        )}
                    </div>
                )}

                {/* Información de la reunión */}
                <div>
                    <h2 className="text-xl font-bold">Detalle de la Reunión</h2>
                    <p><strong>Lugar:</strong> {reunion.lugar}</p>
                    <p><strong>Fecha:</strong> {new Date(reunion.fecha_reunion).toLocaleString()}</p>
                    <p><strong>Descripción:</strong> {reunion.descripcion}</p>
                    <p><strong>Objetivo:</strong> {reunion.objetivo}</p>
                    <p><strong>Última actualización:</strong> {reunion.fechaActualizacion ? new Date(reunion.fechaActualizacion).toLocaleString() : "—"}</p>
                </div>

                {/* Observaciones */}
                <div>
                    <h3 className="font-semibold mb-2">Anotaciones Importantes</h3>
                    <div
                        ref={observacionesRef}
                        className="bg-gray-100 p-3 rounded h-52 overflow-y-auto"
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
                                className="w-full border border-gray-300 rounded p-2 mt-2"
                            />
                            <button
                                onClick={enviarObservacion}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded mt-1"
                            >
                                Agregar observación
                            </button>
                        </>
                    )}
                </div>

                {/* Editar reunión */}
                {isPresidenta && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Editar datos de la reunión</h3>
                        {!editMode ? (
                            <button
                                onClick={handleEditarClick}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded"
                            >
                                Editar reunión
                            </button>
                        ) : (
                            <form onSubmit={handleGuardarEdicion} className="space-y-2">
                                <input
                                    type="date"
                                    value={editFormData.fecha}
                                    onChange={e => setEditFormData({ ...editFormData, fecha: e.target.value })}
                                    required
                                    className="block border border-gray-300 rounded p-2"
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
                                    className="block border border-gray-300 rounded p-2 w-full"
                                />
                                <textarea
                                    value={editFormData.descripcion}
                                    onChange={e => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                                    className="block border border-gray-300 rounded p-2 w-full"
                                />
                                <textarea
                                    value={editFormData.objetivo}
                                    onChange={e => setEditFormData({ ...editFormData, objetivo: e.target.value })}
                                    className="block border border-gray-300 rounded p-2 w-full"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded">
                                        Guardar cambios
                                    </button>
                                    <button type="button" onClick={() => setEditMode(false)} className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Botón salir */}
                <div className="mt-4">
                    <button
                        onClick={handleFinalizar}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                    >
                        Salir de la Reunión
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DetalleReunion;