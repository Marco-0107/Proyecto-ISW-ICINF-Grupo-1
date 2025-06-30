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

    useEffect(() => {
        const reunionIdEnCurso = localStorage.getItem("reunion_en_curso");

        if (!reunionIdEnCurso && !["admin", "presidenta", "vecino"].includes(user?.rol?.toLowerCase())) {
            const continuar = confirm("Esta reunión no está activa. ¿Deseas ver el detalle igual?");
            if (!continuar) return navigate("/reuniones");
        }

        cargarDatos();
        const intervalo = setInterval(() => cargarDatos(), 10000);

        socket.emit("unirseSala", id);

        socket.on("mensajeObservaciones", (nuevasObservaciones) => {
            setReunion((prev) => ({
                ...prev,
                observaciones: nuevasObservaciones,
            }));
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

    const handleGuardarEdicion = async (e) => {
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
        } catch (error) {
            console.error("Error al guardar edición:", error);
            alert("Hubo un error al guardar los cambios. Revisa los datos ingresados.");
        }
    };

    const enviarObservacion = async () => {
        if (!nuevoMensaje.trim()) return;
        const rolPermitido = ["presidenta", "admin"].includes(user?.rol?.toLowerCase?.());
        if (!rolPermitido) return alert("Solo presidenta o admin pueden enviar observaciones.");

        const mensajeFormateado = `[${new Date().toLocaleTimeString()}] ${user?.nombre || "Presidenta"} (${user?.rol}): ${limpiarTexto(nuevoMensaje)}\n`;
        const nuevasObservaciones = (reunion?.observaciones || "") + mensajeFormateado;

        try {
            await editarReunion(id, {
                fecha_reunion: reunion.fecha_reunion,
                lugar: reunion.lugar,
                descripcion: reunion.descripcion,
                objetivo: reunion.objetivo,
                observaciones: nuevasObservaciones,
            });
            setReunion((prev) => ({ ...prev, observaciones: nuevasObservaciones }));
            socket.emit("mensajeObservaciones", { sala: id, mensaje: nuevasObservaciones });
            setNuevoMensaje("");
        } catch (error) {
            console.error("Error al actualizar observaciones", error);
        }
    };

    if (!reunion) return <p>Cargando reunión...</p>;

    return (
        <div className="reunion-page">
            <div className="sidebar">
                {!["vecino"].includes(user?.rol?.toLowerCase()) && (
                    <>
                        <h3>Participantes</h3>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {usuariosReunion.length > 0 ? (
                                usuariosReunion.map((u) => (
                                    <li key={u.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                                        <div>
                                            <strong>{u.User?.nombre} {u.User?.apellido}</strong><br />
                                            <span>RUT: {u.User?.rut}</span><br />
                                            <span>Rol: {u.User?.rol}</span><br />
                                            {u.asistio ? (
                                                <>
                                                    <span style={{ color: "green" }}>Presente ✅</span><br />
                                                    <span style={{ fontSize: "12px" }}>
                                                        Confirmado el {new Date(u.fecha_confirmacion_asistencia).toLocaleString()}
                                                    </span>
                                                </>
                                            ) : (
                                                <span style={{ color: "red" }}>No ha confirmado ❌</span>
                                            )}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li>No hay usuarios registrados aún</li>
                            )}
                        </ul>
                    </>
                )}
            </div>

            <div className="chat">
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
                    style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px", marginBottom: "1rem", height: "200px", overflowY: "auto" }}
                >
                    {reunion.observaciones
                        ? reunion.observaciones
                              .trim()
                              .split("\n")
                              .filter((linea) => linea.trim() !== "")
                              .map((linea, i) => (
                                  <div key={i} style={{ marginBottom: "4px", padding: "4px", borderBottom: "1px solid #ddd" }}>
                                      {linea}
                                  </div>
                              ))
                        : <i>No hay observaciones aún.</i>
                    }
                </div>

                {!["vecino"].includes(user?.rol?.toLowerCase()) && (
                    <>
                        <textarea
                            placeholder="Escribe una observación para todos los vecinos..."
                            value={nuevoMensaje}
                            onChange={(e) => setNuevoMensaje(e.target.value)}
                            rows={3}
                        />
                        <button onClick={enviarObservacion}>Agregar observación</button>

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
