import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '@services/root.service';
import useDeleteReunion from '@hooks/reuniones/useDeleteReunion.jsx';
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

  const { user } = useAuth();
  const { eliminarReunion, loading } = useDeleteReunion();

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
      const response = await axios.get("/reunion");
      setReuniones(response.data.data);
    } catch (error) {
      console.error("Error al cargar reuniones:", error);
    }
  };

  const formatearFechaDDMMYYYY = (date) => {
    // Ajusta la fecha antes de renderizar
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() - 4); // Ajuste de 4 horas
    return adjustedDate.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHoraHHMMSS = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours());
    return adjustedDate.toLocaleTimeString('es-CL', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatearFechaSinUTC = (fechaISO) => {
    return fechaISO.split('-').reverse().join('-');
  };

  const handleDateClick = (date) => {
    const isoDate = date.toLocaleDateString('fr-CA'); // YYYY-MM-DD
    setSelectedDate(date);
    setFormData({ ...formData, fecha: isoDate });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hora) {
      alert("Debes seleccionar una hora para la reunión.");
      return;
    }

    const fechaString = `${formData.fecha}T${formData.hora}:00`;
    const ahora = new Date();

    if (new Date(fechaString) < ahora) {
      alert("No puedes agendar una reunión en el pasado.");
      return;
    }

    console.log("Fecha enviada al backend:", fechaString);

    const payload = {
      lugar: formData.lugar,
      descripcion: formData.descripcion,
      fecha_reunion: fechaString,
      objetivo: formData.objetivo,
      observaciones: formData.observaciones,
      fechaActualizacion: new Date().toISOString(),
    };

    try {
      const response = await axios.post("/reunion", payload);
      console.log("Respuesta backend:", response);
      alert("Reunión creada correctamente");
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
    } catch (error) {
      console.error("Error al crear reunión:", error);
      alert("Error al crear reunión. Revisa la consola.");
    }
  };

  const renderReunionCard = (reunion) => (
    <div key={reunion.id_reunion} className="reunion-card">
      <div className="reunion-info">
        <p><strong>Lugar:</strong> {reunion.lugar}</p>
        <p>
          <strong>Fecha:</strong> {formatearFechaDDMMYYYY(new Date(reunion.fecha_reunion))} a las {formatearHoraHHMMSS(new Date(reunion.fecha_reunion)) || "00:00"} hrs
        </p>
        <p><strong>Objetivo:</strong> {reunion.objetivo}</p>
      </div>
      <div className="reunion-botones">
        <button>Ver detalle</button>
        {(user?.rol === 'presidenta' || user?.rol === 'admin') && (
          <>
            <button>Editar</button>
            <button
              className="btn-delete"
              disabled={loading}
              onClick={() => eliminarReunion(reunion.id_reunion, fetchReuniones)}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="reuniones-page">
      <div className="fecha-hora-actual">
        <p><strong>Fecha:</strong> {formatearFechaDDMMYYYY(fechaHoraActual)}</p>
        <p><strong>Hora:</strong> {formatearHoraHHMMSS(fechaHoraActual)}</p>
      </div>

      <h1>Reuniones</h1>

      {(user?.rol === 'presidenta' || user?.rol === 'admin') && (
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
            <p><strong>Fecha seleccionada:</strong> {formatearFechaSinUTC(formData.fecha)}</p>

            <label>Hora (24 hrs):</label>
            <TimePicker
              onChange={(value) => setFormData(prev => ({ ...prev, hora: value }))}
              value={formData.hora}
              format="HH:mm"
              disableClock={true}
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

            <button type="submit" className="btn-submit">Crear reunión</button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
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
