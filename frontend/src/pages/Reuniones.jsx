import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '@services/root.service';
import useDeleteReunion from '@hooks/reuniones/useDeleteReunion.jsx';
import useEditReunion from '@hooks/reuniones/useEditReunion.jsx';
import ToastNotification from '@components/ToastNotification';
import ConfirmModal from '@components/ConfirmModal';

const Reuniones = () => {
  const [reuniones, setReuniones] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fechaHoraActual, setFechaHoraActual] = useState(new Date());
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

  const lugaresPredefinidos = [
    "Sede Junta de Vecinos",
    "Salón Multiuso",
    "Gimnasio Municipal",
    "Municipalidad",
    "Otro (especificar)",
  ];

  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    lugar: '',
    descripcion: '',
    lugarPersonalizado: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mostrarPasadas, setMostrarPasadas] = useState(false);
  const [filtroFechaPasadas, setFiltroFechaPasadas] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");

  const { user } = useAuth();
  const { eliminarReunion, loading: loadingDelete } = useDeleteReunion();
  const { editarReunion } = useEditReunion();

  const showToast = (message, type = 'success') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
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

  const getErrorMessage = (validationErrors) => {
    const camposConError = Object.keys(validationErrors);
    const nombresCampos = {
      fecha: 'fecha',
      hora: 'hora',
      lugar: 'lugar',
      descripcion: 'descripción',
      lugarPersonalizado: 'lugar personalizado'
    };

    if (camposConError.length === 1) {
      return validationErrors[camposConError[0]];
    }

    const mensajesObligatorios = Object.values(validationErrors).filter(msg =>
      msg.includes('es obligatorio') || msg.includes('Debes seleccionar')
    );

    if (mensajesObligatorios.length > 0) {
      const camposObligatorios = camposConError.filter(campo => {
        const mensaje = validationErrors[campo];
        return mensaje.includes('es obligatorio') || mensaje.includes('Debes seleccionar');
      });

      if (camposObligatorios.length === camposConError.length) {
        const camposNombres = camposObligatorios.map(campo => nombresCampos[campo]);
        return `Faltan campos obligatorios: ${camposNombres.join(', ')}`;
      }
    }

    const camposNombres = camposConError.map(campo => nombresCampos[campo]).filter(Boolean);

    if (camposNombres.length <= 2) {
      return `Por favor revisa: ${camposNombres.join(' y ')}`;
    } else {
      return `Por favor revisa los siguientes campos: ${camposNombres.join(', ')}`;
    }
  };

  const handleEliminarReunion = (idReunion) => {
    showConfirmModal(
      "Eliminar Reunión",
      "¿Estás seguro de eliminar esta reunión? Esta acción no se puede deshacer.",
      async () => {
        try {
          await eliminarReunion(idReunion, () => {
            fetchReuniones();
            showToast("¡Reunión eliminada correctamente!", 'success');
          });
        } catch (error) {
          showToast("Error al eliminar la reunión", 'error');
        }
      },
      'danger'
    );
  };

  useEffect(() => {
    fetchReuniones();
    const intervalo = setInterval(() => setFechaHoraActual(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const fetchReuniones = async () => {
    try {
      const { data } = await axios.get("/reunion");
      setReuniones(data.data);
      setTimeout(() => {
        hideToast();
      }, 2000);

    } catch (error) {
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const newErrors = { ...errors };

    if (name === 'lugar') {
      if (!value) {
        newErrors.lugar = 'Debes seleccionar un lugar';
      } else {
        delete newErrors.lugar;
      }
    }

    if (name === 'lugarPersonalizado') {
      if (!value.trim()) {
        newErrors.lugarPersonalizado = 'Especifica el lugar personalizado';
      } else if (value.trim().length < 3) {
        newErrors.lugarPersonalizado = 'El lugar debe tener al menos 3 caracteres';
      } else if (value.trim().length > 100) {
        newErrors.lugarPersonalizado = 'El lugar no puede superar los 100 caracteres';
      } else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]/.test(value)) {
        newErrors.lugarPersonalizado = 'El lugar debe contener al menos una letra o número';
      } else {
        delete newErrors.lugarPersonalizado;
      }
    }

    if (name === 'descripcion') {
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
    }

    setErrors(newErrors);
  }; const handleDateTimeChange = (date) => {
    setSelectedDate(date);

    if (date) {
      const hora = date.toTimeString().slice(0, 5);
      setFormData((prev) => ({
        ...prev,
        hora: hora,
      }));

      const newErrors = { ...errors };
      const fechaSeleccionada = new Date(date);
      const hoy = new Date();
      const en24Horas = new Date();
      en24Horas.setHours(en24Horas.getHours() + 24);
      const enUnAno = new Date();
      enUnAno.setFullYear(enUnAno.getFullYear() + 1);

      if (!isEditing) {
        if (fechaSeleccionada < hoy) {
          newErrors.fecha = 'No se pueden agendar reuniones en fechas pasadas';
        } else if (fechaSeleccionada < en24Horas) {
          newErrors.fecha = 'Debe agendar con al menos 24 horas de antelación';
        } else if (fechaSeleccionada > enUnAno) {
          newErrors.fecha = 'No se pueden agendar reuniones con más de 1 año de anticipación';
        } else {
          delete newErrors.fecha;
        }
      } else {

        if (fechaSeleccionada > enUnAno) {
          newErrors.fecha = 'No se pueden agendar reuniones con más de 1 año de anticipación';
        } else {
          delete newErrors.fecha;
        }
      }

      const horaNum = date.getHours();
      if (horaNum < 10 || horaNum >= 19) {
        newErrors.hora = 'Las reuniones solo pueden agendarse entre las 10:00 y las 19:00 horas';
      } else {
        delete newErrors.hora;
      }

      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const camposObligatorios = [
      { campo: 'lugar', valor: formData.lugar?.trim(), nombre: 'lugar' },
      { campo: 'descripcion', valor: formData.descripcion?.trim(), nombre: 'descripción' }
    ];

    if (formData.lugar === 'Otro (especificar)') {
      camposObligatorios.push({
        campo: 'lugarPersonalizado',
        valor: formData.lugarPersonalizado?.trim(),
        nombre: 'lugar personalizado'
      });
    }

    const camposVacios = camposObligatorios.filter(item => !item.valor);
    if (camposVacios.length > 0) {
      camposVacios.forEach(item => {
        newErrors[item.campo] = `${item.nombre.charAt(0).toUpperCase() + item.nombre.slice(1)} es obligatorio`;
      });
    }

    if (!selectedDate) {
      newErrors.fecha = 'Debes seleccionar una fecha y hora para la reunión';
    }

    if (!formData.hora) {
      newErrors.hora = 'Debes seleccionar una hora para la reunión';
    }

    if (Object.keys(newErrors).length > 0 && (camposVacios.length > 0 || !selectedDate || !formData.hora)) {
      setErrors(newErrors);
      return newErrors;
    }

    if (!selectedDate) {
      newErrors.fecha = 'La fecha es obligatoria';
    } else {
      const fechaSeleccionada = new Date(selectedDate);
      const hoy = new Date();
      const en24Horas = new Date();
      en24Horas.setHours(en24Horas.getHours() + 24);
      const enUnAno = new Date();
      enUnAno.setFullYear(enUnAno.getFullYear() + 1);

      if (!isEditing) {
        // No puede ser fecha pasada
        if (fechaSeleccionada < hoy) {
          newErrors.fecha = 'No se pueden agendar reuniones en fechas pasadas';
        }
        // Debe tener al menos 24 horas de antelación
        else if (fechaSeleccionada < en24Horas) {
          newErrors.fecha = 'Debe agendar con al menos 24 horas de antelación';
        }
        // No más de 1 año en el futuro
        else if (fechaSeleccionada > enUnAno) {
          newErrors.fecha = 'No se pueden agendar reuniones con más de 1 año de anticipación';
        }
      } else {
        if (fechaSeleccionada > enUnAno) {
          newErrors.fecha = 'No se pueden agendar reuniones con más de 1 año de anticipación';
        }
      }
    }

    // Validar hora (entre las 10:00 y 19:00)
    if (!formData.hora) {
      newErrors.hora = 'La hora es obligatoria';
    } else {
      const horaMatch = formData.hora.match(/^(\d{2}):(\d{2})$/);
      if (!horaMatch) {
        newErrors.hora = 'Formato de hora inválido (HH:MM)';
      } else {
        const [, horas, minutos] = horaMatch;
        const horaNum = parseInt(horas);

        if (horaNum > 23 || parseInt(minutos) > 59) {
          newErrors.hora = 'Hora inválida';
        } else if (horaNum < 10 || horaNum >= 19) {
          newErrors.hora = 'Las reuniones solo pueden agendarse entre las 10:00 y las 19:00 horas';
        }
      }
    }

    // Validar lugar
    if (!formData.lugar) {
      newErrors.lugar = 'Debes seleccionar un lugar';
    } else if (formData.lugar === 'Otro (especificar)') {
      // Si seleccionó "Otro", validar el campo personalizado
      if (!formData.lugarPersonalizado?.trim()) {
        newErrors.lugarPersonalizado = 'Especifica el lugar personalizado';
      } else if (formData.lugarPersonalizado.trim().length < 3) {
        newErrors.lugarPersonalizado = 'El lugar debe tener al menos 3 caracteres';
      } else if (formData.lugarPersonalizado.trim().length > 100) {
        newErrors.lugarPersonalizado = 'El lugar no puede superar los 100 caracteres';
      } else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]/.test(formData.lugarPersonalizado)) {
        newErrors.lugarPersonalizado = 'El lugar debe contener al menos una letra o número';
      }
    }

    // Validar descripción 
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.descripcion.trim().length > 500) {
      newErrors.descripcion = 'La descripción no puede superar los 500 caracteres';
    } else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]/.test(formData.descripcion)) {
      newErrors.descripcion = 'La descripción debe contener al menos una letra o número';
    }

    setErrors(newErrors);
    return newErrors;
  }; const handleEditar = (r) => {
    setIsEditing(true);
    setEditId(r.id_reunion);
    setShowForm(true);
    setErrors({});
    setIsSubmitting(false);

    const fechaObj = new Date(r.fecha_reunion);
    const fechaStr = fechaObj.toISOString().slice(0, 10);
    const horaStr = fechaObj.toTimeString().slice(0, 5);

    setSelectedDate(fechaObj);

    // Verificar si el lugar está en la lista predefinida
    const esPredefinido = lugaresPredefinidos.includes(r.lugar);

    setFormData({
      fecha: fechaStr,
      hora: horaStr,
      lugar: esPredefinido ? r.lugar : 'Otro (especificar)',
      descripcion: r.descripcion,
      lugarPersonalizado: esPredefinido ? '' : r.lugar,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el formulario antes de enviar
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);

      const errorMessage = getErrorMessage(validationErrors);
      showToast(errorMessage, 'error');

      return;
    }

    // Si está editando, mostrar confirmación
    if (isEditing) {
      showConfirmModal(
        "Guardar Cambios",
        "¿Estás seguro de guardar los cambios en esta reunión?",
        () => submitForm(),
        'warning'
      );
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setErrors({});

    const fechaCompleta = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(formData.hora.split(':')[0]),
      parseInt(formData.hora.split(':')[1])
    );

    // Determinar el lugar final
    const lugarFinal = formData.lugar === 'Otro (especificar)'
      ? formData.lugarPersonalizado
      : formData.lugar;

    const payload = {
      fecha_reunion: fechaCompleta.toISOString(),
      lugar: lugarFinal,
      descripcion: formData.descripcion,
      fechaActualizacion: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await editarReunion(editId, payload, fetchReuniones);
        showToast("¡Sus ajustes se han guardado!", 'success');
      } else {
        await axios.post("/reunion", payload);
        showToast("¡Reunión creada correctamente!", 'success');
      }

      fetchReuniones();
      resetForm();
    } catch (error) {
      setErrors({ general: "Error al guardar la reunión. Intente nuevamente." });
      showToast("Error al guardar la reunión", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: '',
      hora: '',
      lugar: '',
      descripcion: '',
      lugarPersonalizado: ''
    });
    setSelectedDate(new Date());
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setErrors({});
    setIsSubmitting(false);
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

    const diferenciaHoras = (fecha.getTime() - ahora.getTime()) / (60 * 60 * 1000);
    const puedeAcceder = diferenciaHoras <= 24;

    return (
      <div key={r.id_reunion} className="border p-4 rounded-md shadow-sm mb-4 bg-white w-full max-w-2xl">
        <div className="mb-2">
          <p><strong>Lugar:</strong> {r.lugar}</p>
          <p><strong>Fecha:</strong> {formatearFechaDDMMYYYY(r.fecha_reunion)} a las {formatearHoraHHMMSS(r.fecha_reunion)} hrs</p>
          <p><strong>Descripción:</strong> {r.descripcion}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user && ["presidenta", "admin", "vecino", "tesorera", "secretario"].includes(user.rol?.toLowerCase()) && puedeAcceder && (
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
                onClick={() => handleEditar(r)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded">Editar</button>
              <button
                onClick={() => handleEliminarReunion(r.id_reunion)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded">
                {loadingDelete ? "Eliminando..." : "Eliminar"}
              </button>
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
              setFormData({ fecha: '', hora: '', lugar: '', descripcion: '', lugarPersonalizado: '' });
              setErrors({});
              setIsSubmitting(false);
            }}>
            + Nueva reunión
          </button>
        )}
      </div>

      {showForm && (
        <div className="max-w-4xl">
          <div className="bg-white p-6 rounded-md shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Editar reunión' : 'Crear nueva reunión'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Fecha y hora:</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateTimeChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd-MM-yyyy HH:mm"
                  placeholderText="Selecciona fecha y hora"
                  minDate={new Date()} // Desde hoy
                  maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} 
                  className={`mt-1 block w-full border rounded-md shadow-sm p-2 text-sm ${errors.fecha || errors.hora ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                />
                {(errors.fecha || errors.hora) && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fecha || errors.hora}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Lugar:</label>
                <select
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${errors.lugar ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                >
                  <option value="">Selecciona un lugar</option>
                  {lugaresPredefinidos.map((lugar, index) => (
                    <option key={index} value={lugar}>
                      {lugar}
                    </option>
                  ))}
                </select>
                {errors.lugar && (
                  <p className="mt-1 text-sm text-red-600">{errors.lugar}</p>
                )}

                {/* Campo adicional para lugar personalizado */}
                {formData.lugar === 'Otro (especificar)' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">Especifica el lugar:</label>
                    <input
                      type="text"
                      name="lugarPersonalizado"
                      value={formData.lugarPersonalizado}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${errors.lugarPersonalizado ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      placeholder="Ej: Sala de juntas edificio B, Casa particular..."
                    />
                    {errors.lugarPersonalizado && (
                      <p className="mt-1 text-sm text-red-600">{errors.lugarPersonalizado}</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${errors.descripcion ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Describe brevemente el contenido de la reunión..."
                />
                {errors.descripcion && (
                  <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
                )}
              </div>
              {errors.general && (
                <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`font-semibold py-2 px-4 rounded ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                >
                  {isSubmitting
                    ? 'Guardando...'
                    : (isEditing ? 'Guardar cambios' : 'Crear reunión')
                  }
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className={`font-semibold py-2 px-4 rounded text-white ${isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
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
};

export default Reuniones;