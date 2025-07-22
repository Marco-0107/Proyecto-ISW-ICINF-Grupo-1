import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '@services/root.service';
import useDeleteReunion from '@hooks/reuniones/useDeleteReunion.jsx';
import useEditReunion from '@hooks/reuniones/useEditReunion.jsx';

const Reuniones = () => {
  const [reuniones, setReuniones] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fechaHoraActual, setFechaHoraActual] = useState(new Date());
  const [mensaje, setMensaje] = useState(null);

  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    lugar: '',
    descripcion: '',
    objetivo: '',
    observaciones: '',
  });

  const [mostrarPasadas, setMostrarPasadas] = useState(false);
  const [filtroFechaPasadas, setFiltroFechaPasadas] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");

  const { user } = useAuth();
  const { eliminarReunion, loading: loadingDelete } = useDeleteReunion();
  const { editarReunion } = useEditReunion();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditar = (r) => {
    setIsEditing(true);
    setEditId(r.id_reunion);
    setShowForm(true);

    const fechaObj = new Date(r.fecha_reunion);
    const fechaStr = fechaObj.toISOString().slice(0, 10);
    const horaStr = fechaObj.toTimeString().slice(0, 5);

    setSelectedDate(fechaObj);

    setFormData({
      fecha: fechaStr,
      hora: horaStr,
      lugar: r.lugar,
      descripcion: r.descripcion,
      objetivo: r.objetivo,
      observaciones: r.observaciones,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fechaCompleta = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(formData.hora.split(':')[0]),
      parseInt(formData.hora.split(':')[1])
    );

    const payload = {
      fecha_reunion: fechaCompleta.toISOString(),
      lugar: formData.lugar,
      descripcion: formData.descripcion,
      objetivo: formData.objetivo,
      observaciones: formData.observaciones,
      fechaActualizacion: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await editarReunion(editId, payload, fetchReuniones);
        setMensaje("Reunión editada correctamente.");
      } else {
        await axios.post("/reunion", payload);
        setMensaje("Reunión creada correctamente.");
      }

      fetchReuniones();
      resetForm();
    } catch (error) {
      console.error("Error al guardar reunión:", error);
      alert("Error al guardar la reunión.");
    }
  };

  const resetForm = () => {
    setFormData({ fecha: '', hora: '', lugar: '', descripcion: '', objetivo: '', observaciones: '' });
    setSelectedDate(new Date());
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setTimeout(() => setMensaje(null), 3000);
  };

  const formatearFechaDDMMYYYY = (date) =>
    new Date(date).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Santiago',
    });

  const formatearHoraHHMMSS = (date) =>
    new Date(date).toLocaleTimeString('es-CL', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Santiago',
    });


  const ahora = new Date();
  const futuras = reuniones.filter(r => new Date(r.fecha_reunion) > ahora);
  const actuales = reuniones.filter(r => {
    const fecha = new Date(r.fecha_reunion);
    const fin = new Date(fecha);
    fin.setHours(fin.getHours() + 3);
    return ahora >= fecha && ahora <= fin;
  });
  const pasadas = reuniones
    .filter(r => new Date(r.fecha_reunion) < ahora && !actuales.includes(r))
    .sort((a, b) => new Date(b.fecha_reunion) - new Date(a.fecha_reunion));

  const pasadasFiltradas = pasadas.filter((r) => {
    const fecha = r.fecha_reunion;
    const cumpleFecha = filtroFechaPasadas ? fecha.startsWith(filtroFechaPasadas) : true;
    const cumpleMes = filtroMes ? fecha.slice(5, 7) === filtroMes : true;
    const cumpleAnio = filtroAnio ? fecha.slice(0, 4) === filtroAnio : true;
    return cumpleFecha && cumpleMes && cumpleAnio;
  });

  const renderReunionCard = r => {
    const fecha = new Date(r.fecha_reunion);
    const fin = new Date(fecha);
    fin.setHours(fin.getHours() + 3);
    const esActualOPasada = ahora >= fecha;

    return (
      <div key={r.id_reunion} className="border p-4 rounded-md shadow-sm mb-4 bg-white w-full max-w-2xl">
        <div className="mb-2">
          <p><strong>Lugar:</strong> {r.lugar}</p>
          <p><strong>Fecha:</strong> {formatearFechaDDMMYYYY(r.fecha_reunion)} a las {formatearHoraHHMMSS(r.fecha_reunion)} hrs</p>
          <p><strong>Objetivo:</strong> {r.objetivo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user && ["presidenta", "admin", "vecino", "tesorera", "secretario"].includes(user.rol?.toLowerCase()) && esActualOPasada && (
            <button onClick={() => {
              if (["presidenta", "admin"].includes(user.rol?.toLowerCase())) {
                localStorage.setItem("reunion_en_curso", r.id_reunion);
              }
              window.location.href = `/detalle-reunion/${r.id_reunion}`;
            }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded">
              {user.rol?.toLowerCase() === "presidenta" || user.rol?.toLowerCase() === "admin" ? "Ingresar a Reunión" : "Ver Reunión"}
            </button>
          )}
          {user && ["presidenta", "admin"].includes(user.rol?.toLowerCase()) && (
            <>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditId(r.id_reunion);
                  setShowForm(true);
                  setSelectedDate(new Date(r.fecha_reunion));
                  setFormData({
                    hora: formatearHoraHHMMSS(r.fecha_reunion),
                    lugar: r.lugar,
                    descripcion: r.descripcion,
                    objetivo: r.objetivo,
                    observaciones: r.observaciones,
                    fecha: r.fecha_reunion.split('T')[0],
                  });
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded">Editar</button>
              <button
                onClick={() => eliminarReunion(r.id_reunion, fetchReuniones)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded">
                {loadingDelete ? "Eliminando..." : "Eliminar"}</button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="bg-white px-4 py-2 rounded-md shadow-md border text-gray-800">
          <p className="text-sm font-medium">📅 Fecha actual: {formatearFechaDDMMYYYY(fechaHoraActual)}</p>
          <p className="text-sm font-medium">⏰ Hora actual: {formatearHoraHHMMSS(fechaHoraActual)}</p>
        </div>
        {(user?.rol === "presidenta" || user?.rol === "admin") && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            onClick={() => {
              setShowForm(!showForm);
              setIsEditing(false);
              setFormData({ fecha: '', hora: '', lugar: '', descripcion: '', objetivo: '', observaciones: '' });
            }}>
            + Nueva reunión
          </button>
        )}
      </div>

      {mensaje && <div className="mb-4 text-green-700 font-semibold">{mensaje}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-md shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Editar reunión' : 'Crear nueva reunión'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Fecha y hora:</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setFormData((prev) => ({
                    ...prev,
                    hora: date.toTimeString().slice(0, 5),
                  }));
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy HH:mm"
                placeholderText="Selecciona fecha y hora"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Lugar:</label>
              <input type="text" name="lugar" value={formData.lugar} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción:</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Objetivo:</label>
              <textarea name="objetivo" value={formData.objetivo} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Observaciones:</label>
              <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">{isEditing ? 'Guardar cambios' : 'Crear reunión'}</button>
              <button type="button" onClick={resetForm} className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-xl font-bold mb-2">Futuras</h2>
      {futuras.map(renderReunionCard)}

      <h2 className="text-xl font-bold mt-6 mb-2">Actuales</h2>
      {actuales.map(renderReunionCard)}

      <h2 className="text-xl font-bold mt-6 mb-2">Pasadas</h2>
      <button onClick={() => setMostrarPasadas(!mostrarPasadas)} className="mb-2 text-sm font-semibold text-blue-600 hover:underline">
        {mostrarPasadas ? "Ocultar reuniones pasadas" : `Ver reuniones pasadas (${pasadas.length})`}
      </button>

      {mostrarPasadas && (
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha exacta:</label>
            <input
              type="date"
              value={filtroFechaPasadas}
              onChange={(e) => setFiltroFechaPasadas(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-[160px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes (MM):</label>
            <input
              type="text"
              maxLength={2}
              placeholder="Ej: 07"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año (AAAA):</label>
            <input
              type="text"
              maxLength={4}
              placeholder="Ej: 2025"
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-[100px]"
            />
          </div>
        </div>

      )}

      {mostrarPasadas && pasadasFiltradas.map(renderReunionCard)}
    </div>
  );
};

export default Reuniones;