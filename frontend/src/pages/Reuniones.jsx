import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '@services/root.service';
import useDeleteReunion from '@hooks/reuniones/useDeleteReunion.jsx';
import useEditReunion from '@hooks/reuniones/useEditReunion.jsx';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import '@styles/reuniones.css';

const Reuniones = () => {

  const [reuniones, setReuniones] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [fechaHoraActual, setFechaHoraActual] = useState(new Date());

  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    lugar: '',
    descripcion: '',
    objetivo: '',
    observaciones: '',
  });

  const [expandedId, setExpandedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const { user } = useAuth();
  const { eliminarReunion, loading: loadingDelete } = useDeleteReunion();
  const { editarReunion, loading: loadingEdit } = useEditReunion();

  const hoy = new Date().toLocaleDateString('fr-CA');
  const futuras = reuniones.filter(r => r.fecha_reunion > hoy);
  const actuales = reuniones.filter(r => r.fecha_reunion.startsWith(hoy));
  const pasadas = reuniones.filter(r => r.fecha_reunion < hoy);

  useEffect(() => {
    fetchReuniones();
    const intervalo = setInterval(() => setFechaHoraActual(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const fetchReuniones = async () => {
    try {
      const { data } = await axios.get("/reunion");
      setReuniones(data.data);
    } catch (error) {
      console.error("Error al cargar reuniones:", error);
    }
  };


  const formatearFechaDDMMYYYY = date => {
    const adj = new Date(date);
    adj.setHours(adj.getHours() - 4);
    return adj.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  const formatearHoraHHMMSS = date =>
    new Date(date).toLocaleTimeString('es-CL', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });


  const formatearFechaSinUTC = iso =>
    iso.split('-').reverse().join('-');

  const handleDateClick = date => {
    const isoDate = date.toLocaleDateString('fr-CA');

    setSelectedDate(date);
    setFormData(f => ({ ...f, fecha: isoDate }));
    setShowForm(true);

    setEditId(null);
    setExpandedId(null);
  };


  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };


  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.hora) {
      alert("Debes seleccionar una hora.");
      return;
    }

    const fechaString = `${formData.fecha}T${formData.hora}:00`;

    if (new Date(fechaString) < new Date()) {
      alert("No puedes agendar en el pasado.");
      return;
    }

    try {
      await axios.post("/reunion", {
        lugar: formData.lugar,
        descripcion: formData.descripcion,
        fecha_reunion: fechaString,
        objetivo: formData.objetivo,
        observaciones: formData.observaciones,
        fechaActualizacion: new Date().toISOString(),
      });

      alert("Reunión creada");

      setShowForm(false);
      setFormData({
        fecha: '',
        hora: '',
        lugar: '',
        descripcion: '',
        objetivo: '',
        observaciones: '',
      });
      fetchReuniones();
    }
    catch (err) {
      console.error(err);
      alert("Error al crear reunión");
    }
  };

  const handleVerDetalle = id => {
    setExpandedId(expandedId === id ? null : id);
    setEditId(null);
  };


  const handleEditar = r => {
    setEditId(r.id_reunion);
    setExpandedId(null);

    const fechaObj = new Date(r.fecha_reunion);
    const isoDate = fechaObj.toISOString().slice(0, 10);
    const hh = String(fechaObj.getHours()).padStart(2, '0');
    const mm = String(fechaObj.getMinutes()).padStart(2, '0');

    setEditFormData({
      fecha: isoDate,
      hora: `${hh}:${mm}`,
      lugar: r.lugar,
      descripcion: r.descripcion,
      objetivo: r.objetivo,
      observaciones: r.observaciones,
    });
  };


  const handleGuardarEdicion = async e => {
    e.preventDefault();

    const { fecha, hora, lugar, descripcion, objetivo, observaciones } = editFormData;

    const fechaReu = `${fecha}T${hora}:00`;

    if (new Date(fechaReu) < new Date()) {
      alert("No puedes agendar en el pasado.");
      return;
    }

    try {
      await editarReunion(editId, {
        fecha_reunion: fechaReu,
        lugar,
        descripcion,
        objetivo,
        observaciones
      });

      setEditId(null);
      fetchReuniones();
    }
    catch {
      alert("Error guardando cambios");
    }
  };


  const renderReunionCard = r => {
    const isExpanded = expandedId === r.id_reunion;
    const isEditing = editId === r.id_reunion;

    return (
      <div key={r.id_reunion} className="reunion-card">

        <div className="reunion-info">
          <p><strong>Lugar:</strong> {r.lugar}</p>
          <p>
            <strong>Fecha:</strong>{" "}
            {formatearFechaDDMMYYYY(r.fecha_reunion)}
            {" a las "}
            {formatearHoraHHMMSS(r.fecha_reunion)} hr
          </p>
          <p><strong>Objetivo:</strong> {r.objetivo}</p>
        </div>

        <div className="reunion-botones">
          <button onClick={() => handleVerDetalle(r.id_reunion)}>
            {isExpanded ? "Ocultar" : "Ver detalle"}
          </button>

          {(user?.rol === "presidenta" || user?.rol === "admin") && (
            <>
              <button onClick={() => handleEditar(r)}>Editar</button>
              <button
                className="btn-delete"
                disabled={loadingDelete}
                onClick={() => eliminarReunion(r.id_reunion, fetchReuniones)}
              >
                {loadingDelete ? "Eliminando..." : "Eliminar"}
              </button>
            </>
          )}
        </div>


        {isExpanded && !isEditing && (
          <div className="detalle-reunion">
            <p><strong>Descripción:</strong> {r.descripcion}</p>
            <p><strong>Observaciones:</strong> {r.observaciones}</p>
          </div>
        )}


        {isEditing && (
          <form className="edit-reunion-form" onSubmit={handleGuardarEdicion}>
            <label>Fecha:</label>
            <input
              type="date"
              name="fecha"
              value={editFormData.fecha}
              onChange={e =>
                setEditFormData({
                  ...editFormData,
                  fecha: e.target.value
                })
              }
              required
            />

            <label>Hora:</label>
            <TimePicker
              onChange={v =>
                setEditFormData({
                  ...editFormData,
                  hora: v
                })
              }
              value={editFormData.hora}
              format="HH:mm"
              disableClock
              style={{ width: '4000px' }}
            />

            <label>Lugar:</label>
            <input
              type="text"
              name="lugar"
              value={editFormData.lugar}
              onChange={e =>
                setEditFormData({
                  ...editFormData,
                  lugar: e.target.value
                })
              }
              required
            />

            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={editFormData.descripcion}
              onChange={e =>
                setEditFormData({
                  ...editFormData,
                  descripcion: e.target.value
                })
              }
              required
            />

            <label>Objetivo:</label>
            <textarea
              name="objetivo"
              value={editFormData.objetivo}
              onChange={e =>
                setEditFormData({
                  ...editFormData,
                  objetivo: e.target.value
                })
              }
              required
            />

            <label>Observaciones:</label>
            <textarea
              name="observaciones"
              value={editFormData.observaciones}
              onChange={e =>
                setEditFormData({
                  ...editFormData,
                  observaciones: e.target.value
                })
              }
              required
            />

            <div className="edit-form-buttons">
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setEditId(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}


      </div>
    );
  };


  return (
    <div className="reuniones-page">
      <div className="fecha-hora-actual">
        <p><strong>Fecha:</strong> {formatearFechaDDMMYYYY(fechaHoraActual)}</p>
        <p><strong>Hora:</strong> {formatearHoraHHMMSS(fechaHoraActual)}</p>
      </div>

      <h1>Reuniones</h1>

      {(user?.rol === "presidenta" || user?.rol === "admin") && (
        <div className="crear-reunion-container">
          <h3>Selecciona una fecha para agendar reunión:</h3>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateClick}
            dateFormat="dd-MM-yyyy"
            inline
          />
        </div>
      )}

      {showForm && (
        <div className="formulario-reunion">
          <h3>Crear nueva reunión</h3>
          <form onSubmit={handleSubmit}>

            <p>
              <strong>Fecha seleccionada:</strong>{" "}
              {formatearFechaSinUTC(formData.fecha)}
            </p>

            <label>Hora:</label>
            <TimePicker
              onChange={v => setFormData(f => ({ ...f, hora: v }))}
              value={formData.hora}
              format="HH:mm"
              disableClock
            />

            <label>Lugar:</label>
            <input
              type="text"
              name="lugar"
              value={formData.lugar}
              onChange={handleInputChange}
              required
            />

            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              required
            />

            <label>Objetivo:</label>
            <textarea
              name="objetivo"
              value={formData.objetivo}
              onChange={handleInputChange}
              required
            />

            <label>Observaciones:</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              required
            />

            <button type="submit" className="btn-submit">
              Crear reunión
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>

          </form>
        </div>
      )}

      <div className="seccion-reuniones">
        <h2>Futuras</h2>
        {futuras.map(renderReunionCard)}
      </div>

      <div className="seccion-reuniones">
        <h2>Actuales</h2>
        {actuales.map(renderReunionCard)}
      </div>

      <div className="seccion-reuniones">
        <h2>Pasadas</h2>
        {pasadas.map(renderReunionCard)}
      </div>
    </div>
  );
};

export default Reuniones;
