import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@context/AuthContext";
import axios from "@services/root.service";
import { getUsuariosReunion } from "@services/reunion.service";
import useEditReunion from "@hooks/reuniones/useEditReunion.jsx";
import TimePicker from "react-time-picker";
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

    if (!reunion) return <p>Cargando reunión...</p>;

    return (
        <div className="reunion-page">
            <div className="sidebar">
                <h3>Participantes</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {(
                        isVecino
                            ? usuariosReunion.filter(u => u.User?.rut === user.rut)
                            : usuariosReunion
                    ).length > 0 ? (
                        (isVecino
                            ? usuariosReunion.filter(u => u.User?.rut === user.rut)
                            : usuariosReunion
                        ).map(u => (
                            <li
                                key={u.id_usuario}
                                style={{ marginBottom: 15, borderBottom: "1px solid #ccc", paddingBottom: 10 }}
                            >
                                <strong>{u.User?.nombre} {u.User?.apellido}</strong><br />
                                <span>RUT: {u.User?.rut}</span><br />
                                {!isVecino && <span>Rol: {u.User?.rol}</span>}<br />
                                {u.asistio
                                    ? (
                                        <>
                                            <span style={{ color: "green" }}>Presente ✅</span><br />
                                            <span style={{ fontSize: "12px" }}>
                                                Confirmado el {new Date(u.fecha_confirmacion_asistencia).toLocaleString()}
                                            </span>
                                        </>
                                    )
                                    : (
                                        <span style={{ color: "red" }}>No ha confirmado ❌</span>
                                    )
                                }
                                {isPresidenta && !isVecino && (
                                    <button
                                        style={{ marginTop: 8, fontSize: "0.8rem" }}
                                        onClick={async () => {
                                            if (!confirm(`¿Deseas ${u.asistio ? "quitar" : "marcar"} asistencia?`)) return;
                                            await axios.patch(
                                                `/usuario-reunion/detail/?id_usuario=${u.id_usuario}&id_reunion=${id}`
                                            );
                                            cargarDatos();
                                        }}
                                    >
                                        {u.asistio ? "❌ Quitar asistencia" : "✅ Marcar asistencia"}
                                    </button>
                                )}
                            </li>
                        ))
                    ) : (
                        <li>No hay usuarios registrados aún</li>
                    )}
                </ul>
            </div>

            <div className="chat">
                {isPresidenta && !tokenActivo && (
                    <button onClick={generarToken} style={{ marginBottom: "1rem" }}>
                        🎟️ Generar token de asistencia
                    </button>
                )}
                {tokenActivo && (
                    <div style={{ marginBottom: "1rem", padding: "0.5rem", background: "#eef", borderRadius: 5 }}>
                        <strong>🎟️ Token actual:</strong> {tokenActivo.numero_token}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(tokenActivo.numero_token);
                                alert("Token copiado al portapapeles");
                            }}
                            style={{ marginLeft: "1rem", padding: "5px 10px", borderRadius: 4, cursor: "pointer" }}
                        >
                            Copiar token
                        </button>
                        <div style={{ marginTop: 4 }}>
                            <strong>Estado:</strong>{" "}
                            <span style={{ color: tokenActivo.estado === "activo" ? "green" : "red" }}>
                                {tokenActivo.estado === "activo" ? "Activo ✅" : "Cerrado ❌"}
                            </span>
                        </div>
                        {tokenActivo.estado === "activo" && isPresidenta && (
                            <button
                                onClick={async () => {
                                    if (!confirm("¿Estás seguro de cerrar este token?")) return;
                                    try {
                                        await axios.patch(`/token/detail/?id_token=${tokenActivo.id_token}`, { estado: "cerrado" });
                                        alert("✅ Token cerrado correctamente.");
                                        setTokenActivo({ ...tokenActivo, estado: "cerrado" });
                                        cargarDatos();
                                    } catch {
                                        alert("❌ Error al cerrar el token.");
                                    }
                                }}
                                style={{ marginTop: 4, backgroundColor: "#fdd", border: "1px solid #f00", padding: "5px 10px", borderRadius: 4, cursor: "pointer" }}
                            >
                                ❌ Cerrar token de asistencia
                            </button>
                        )}
                    </div>
                )}

                {isVecino && (
                    <div style={{ background: "#eef", padding: "1rem", borderRadius: 8, marginBottom: "1rem" }}>
                        <h3>Confirmar asistencia con token</h3>
                        <input
                            type="text"
                            value={tokenIngresado}
                            onChange={e => setTokenIngresado(e.target.value)}
                            placeholder="Ingresa el token entregado"
                            style={{ marginRight: "0.5rem" }}
                        />
                        <button onClick={marcarAsistencia}>Validar</button>
                        {mensajeAsistencia && (
                            <p style={{ marginTop: "0.5rem", color: mensajeAsistencia.includes("✅") ? "green" : "red" }}>
                                {mensajeAsistencia}
                            </p>
                        )}
                    </div>
                )}

                <h2>Detalle de la Reunión</h2>
                <p><strong>Lugar:</strong> {reunion.lugar}</p>
                <p><strong>Fecha:</strong> {new Date(reunion.fecha_reunion).toLocaleString()}</p>
                <p><strong>Descripción:</strong> {reunion.descripcion}</p>
                <p><strong>Objetivo:</strong> {reunion.objetivo}</p>
                <p><strong>Última actualización:</strong> {reunion.fechaActualizacion ? new Date(reunion.fechaActualizacion).toLocaleString() : "—"}</p>

                <hr />
                <h3>Anotaciones Importantes</h3>
                <div
                    ref={observacionesRef}
                    className="observaciones-box"
                    style={{ background: "#f4f4f4", padding: 10, borderRadius: 5, marginBottom: "1rem", height: 200, overflowY: "auto" }}
                >
                    {reunion.observaciones
                        ? reunion.observaciones.trim().split("\n").filter(l => l.trim()).map((l, i) => (
                            <div key={i} style={{ marginBottom: 4, padding: 4, borderBottom: "1px solid #ddd" }}>
                                {l}
                            </div>
                        ))
                        : <i>No hay observaciones aún.</i>
                    }
                </div>

                {(isSecretario || isPresidenta) && (
                    <>
                        <textarea
                            placeholder="Escribe una observación para todos los vecinos..."
                            value={nuevoMensaje}
                            onChange={(e) => setNuevoMensaje(e.target.value)}
                            rows={3}
                        />
                        <button onClick={enviarObservacion}>Agregar observación</button>
                    </>
                )}

                {isPresidenta && (
                    <>
                        <hr />
                        <h3>Editar datos de la reunión</h3>
                        {!editMode ? (
                            <button onClick={handleEditarClick}>Editar reunión</button>
                        ) : (
                            <form onSubmit={handleGuardarEdicion}>
                                <label>
                                    Fecha:
                                    <input
                                        type="date"
                                        value={editFormData.fecha}
                                        onChange={(e) => setEditFormData({ ...editFormData, fecha: e.target.value })}
                                        required
                                    />
                                </label>
                                <label>
                                    Hora:
                                    <TimePicker
                                        onChange={(value) => setEditFormData({ ...editFormData, hora: value })}
                                        value={editFormData.hora}
                                        disableClock
                                    />
                                </label>
                                <label>
                                    Lugar:
                                    <input
                                        type="text"
                                        value={editFormData.lugar}
                                        onChange={(e) => setEditFormData({ ...editFormData, lugar: e.target.value })}
                                        required
                                    />
                                </label>
                                <label>
                                    Descripción:
                                    <textarea
                                        value={editFormData.descripcion}
                                        onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                                    />
                                </label>
                                <label>
                                    Objetivo:
                                    <textarea
                                        value={editFormData.objetivo}
                                        onChange={(e) => setEditFormData({ ...editFormData, objetivo: e.target.value })}
                                    />
                                </label>
                                <button type="submit">Guardar cambios</button>
                                <button type="button" onClick={() => setEditMode(false)}>Cancelar</button>
                            </form>
                        )}
                    </>
                )}
                <div style={{ marginTop: "2rem" }}>
                    <button onClick={handleFinalizar}>Salir de la Reunión</button>
                </div>
            </div>
        </div>
    );
};

export default DetalleReunion;
