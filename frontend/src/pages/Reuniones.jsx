import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '@services/root.service';
import useDeleteReunion from '@hooks/reuniones/useDeleteReunion.jsx';
import useEditReunion from '@hooks/reuniones/useEditReunion.jsx';
import ToastNotification from '@components/ToastNotification';
import ConfirmModal from '@components/ConfirmModal';

const Reuniones = () => {
  const navigate = useNavigate();
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

  // Función para verificar si el formulario es válido
  const isFormValid = () => {
    // Verificar campos obligatorios
    if (!formData.lugar?.trim() || !formData.descripcion?.trim()) {
      return false;
    }

    // Si seleccionó "Otro", verificar el campo personalizado
    if (formData.lugar === 'Otro (especificar)' && !formData.lugarPersonalizado?.trim()) {
      return false;
    }

    // Verificar fecha y hora
    if (!selectedDate || !formData.hora) {
      return false;
    }

    // Verificar si hay errores activos
    if (Object.keys(errors).length > 0) {
      return false;
    }

    return true;
  };

  // Función para obtener mensaje de qué falta o está mal
  const getValidationMessage = () => {
    const issues = [];

    if (!selectedDate) issues.push('fecha');
    if (!formData.hora) issues.push('hora');
    if (!formData.lugar?.trim()) issues.push('lugar');
    if (formData.lugar === 'Otro (especificar)' && !formData.lugarPersonalizado?.trim()) {
      issues.push('lugar personalizado');
    }
    if (!formData.descripcion?.trim()) issues.push('descripción');

    // Verificar errores de validación específicos
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const errorMessages = errorKeys.map(key => {
        switch (key) {
          case 'fecha': return 'fecha válida';
          case 'hora': return 'hora válida';
          case 'lugar': return 'lugar válido';
          case 'lugarPersonalizado': return 'lugar personalizado válido';
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
        if (value !== 'Otro (especificar)') {
          delete newErrors.lugarPersonalizado;
        }
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
    } else {

      delete newErrors.lugarPersonalizado;
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
    const isActual = ahora >= fecha && ahora <= fin;
    const isFutura = fecha > ahora;

    return (
      <div key={r.id_reunion} className={`border-2 p-4 rounded-xl shadow-lg mb-4 bg-white w-full max-w-2xl reunion-card transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${isActual ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' :
          isFutura ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50' :
            'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50'
        }`}>

        <div className="flex justify-between items-start mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${isActual ? 'bg-green-100 text-green-800 border border-green-200' :
              isFutura ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
            {isActual ? 'En Curso' : isFutura ? 'Próxima' : 'Finalizada'}
          </span>
          {isActual && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
        </div>

        <div className="mb-3 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Lugar:</span>
            <span className="text-gray-900">{r.lugar}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Fecha:</span>
            <span className="text-gray-900">{formatearFechaDDMMYYYY(r.fecha_reunion)} a las {formatearHoraHHMMSS(r.fecha_reunion)} hrs</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold text-gray-700">Descripción:</span>
            <span className="text-gray-900">{r.descripcion}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {user && ["presidenta", "admin", "vecino", "tesorera", "secretario"].includes(user.rol?.toLowerCase()) && puedeAcceder && (
            <button onClick={() => {
              if (["presidenta", "admin"].includes(user.rol?.toLowerCase())) {
                localStorage.setItem("reunion_en_curso", r.id_reunion);
              }
              navigate(`/detalle-reunion/${r.id_reunion}`);
            }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 text-sm rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 min-w-[120px]">
              {user.rol?.toLowerCase() === "presidenta" || user.rol?.toLowerCase() === "admin" ? "Ingresar" : "Ver"}
            </button>
          )}
          {user && ["presidenta", "admin"].includes(user.rol?.toLowerCase()) && (
            <>
              <button
                onClick={() => handleEditar(r)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-6 text-sm rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 min-w-[120px]">
                Editar
              </button>
              <button
                onClick={() => handleEliminarReunion(r.id_reunion)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 text-sm rounded-lg shadow-md transform hover:scale-105 transition-all duration-200">
                {loadingDelete ? "Eliminando..." : "Eliminar"}
              </button>
            </>
          )}
        </div>

        {/* Indicador de acceso para reuniones futuras */}
        {isFutura && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${puedeAcceder ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
              {puedeAcceder ? 'Acceso disponible' : 'Disponible 24h antes'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 reunion-content">
        <div className="bg-gradient-to-r from-white to-green-50 px-6 py-4 rounded-lg shadow-md border-2 border-green-200 text-gray-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-xl">📅</span>
              <span className="text-base font-bold">Fecha: {formatearFechaDDMMYYYY(fechaHoraActual)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-xl">⏰</span>
              <span className="text-base font-bold">Hora: {formatearHoraHHMMSS(fechaHoraActual)}</span>
            </div>
          </div>
        </div>
        {(user?.rol === "presidenta" || user?.rol === "admin") && (
          <button
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
            onClick={() => {
              setShowForm(!showForm);
              setIsEditing(false);
              setFormData({ fecha: '', hora: '', lugar: '', descripcion: '', lugarPersonalizado: '' });
              setErrors({});
              setIsSubmitting(false);
            }}>
            Nueva reunión
          </button>
        )}
      </div>

      {showForm && (
        <div className="max-w-4xl reunion-content">
          <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-lg mb-6 reunion-form border-2 border-green-200">
            <h2 className="text-xl font-bold mb-4 text-green-800 flex items-center">
              <span className="mr-2">{isEditing ? 'Editar' : 'Crear'}</span>
              {isEditing ? 'reunión' : 'nueva reunión'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">Fecha y hora:</span>
                </label>
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
                  className={`w-full border-2 rounded-lg shadow-sm p-3 text-sm transition-all duration-200 ${errors.fecha || errors.hora ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                />
                {(errors.fecha || errors.hora) && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.fecha || errors.hora}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">Lugar:</span>
                </label>
                <select
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  className={`w-full border-2 rounded-lg shadow-sm p-3 transition-all duration-200 ${errors.lugar ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
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
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.lugar}
                  </p>
                )}

                {/* Campo adicional para lugar personalizado */}
                {formData.lugar === 'Otro (especificar)' && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Especifica el lugar:</label>
                    <input
                      type="text"
                      name="lugarPersonalizado"
                      value={formData.lugarPersonalizado}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-lg shadow-sm p-3 transition-all duration-200 ${errors.lugarPersonalizado ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        }`}
                      placeholder="Ej: Sala de juntas edificio B, Casa particular..."
                    />
                    {errors.lugarPersonalizado && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.lugarPersonalizado}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">Descripción:</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full border-2 rounded-lg shadow-sm p-3 transition-all duration-200 resize-none ${errors.descripcion ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                  placeholder="Describe brevemente el contenido de la reunión..."
                />
                {errors.descripcion && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.descripcion}
                  </p>
                )}
              </div>
              {errors.general && (
                <div className="md:col-span-2 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">🚨</span>
                    <p className="text-sm text-red-600 font-medium">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Mostrar mensaje de validación si el formulario no es válido */}
              {!isFormValid() && (
                <div className="col-span-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">⚠️</span>
                    <p className="text-sm text-yellow-800 font-medium">
                      {getValidationMessage()}
                    </p>
                  </div>
                </div>
              )}

              <div className="col-span-2 flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${!isFormValid() || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transform hover:scale-105'
                    }`}
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
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg text-white transition-all duration-200 ${isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gray-500 hover:bg-gray-600 shadow-lg transform hover:scale-105'
                    }`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <h2 className="text-xl font-bold mb-3 reunion-content text-blue-800 flex items-center">
          <span className="mr-2">Próximas Reuniones</span>
          <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded-full">
            {futuras.length}
          </span>
        </h2>
        <div className="reunion-list">
          {futuras.length > 0 ? (
            futuras.map(renderReunionCard)
          ) : (
            <div className="text-center py-4 text-gray-500">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-base font-medium">No hay reuniones programadas</p>
              <p className="text-sm">Las próximas reuniones aparecerán aquí</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 reunion-content text-green-800 flex items-center">
          <span className="mr-3">Reuniones en Curso</span>
          <span className="ml-3 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
            {actuales.length}
          </span>
        </h2>
        <div className="reunion-list">
          {actuales.length > 0 ? (
            actuales.map(renderReunionCard)
          ) : (
            <div className="text-center py-4 text-gray-500">
              <div className="text-2xl mb-2">⏰</div>
              <p className="text-base font-medium">No hay reuniones en curso</p>
              <p className="text-sm">Las reuniones activas se mostrarán aquí</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold reunion-content text-purple-800 flex items-center">
            <span className="mr-2">Reuniones Pasadas</span>
            <span className="ml-2 bg-purple-100 text-purple-800 text-sm font-semibold px-2 py-1 rounded-full">
              {pasadas.length}
            </span>
          </h2>
          <button
            onClick={() => setMostrarPasadas(!mostrarPasadas)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2 px-4 text-sm rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 reunion-content"
          >
            {mostrarPasadas ? "Ocultar" : `Ver (${pasadas.length})`}
          </button>
        </div>

        {mostrarPasadas && (
          <div className="reunion-list">
            <div className="mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                <span className="mr-2">Filtrar Reuniones Pasadas</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha exacta:</label>
                  <input
                    type="date"
                    value={filtroFechaPasadas}
                    onChange={(e) => setFiltroFechaPasadas(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mes (MM):</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="Ej: 07"
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Año (AAAA):</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Ej: 2025"
                    value={filtroAnio}
                    onChange={(e) => setFiltroAnio(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="reunion-list">
              {pasadasFiltradas.length > 0 ? (
                pasadasFiltradas.map(renderReunionCard)
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="text-base font-medium">No se encontraron reuniones</p>
                  <p className="text-sm">Prueba ajustando los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        )}
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
};

export default Reuniones;