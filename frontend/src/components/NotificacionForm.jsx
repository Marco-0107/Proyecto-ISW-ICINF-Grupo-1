import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

// Utilidad para formatear fecha
const formatDate = (fecha) => {
  const fechaObj = new Date(fecha);
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  return fechaObj.toLocaleDateString('es-ES', options).replace(',', ' -');
};

export default function NotificacionForm({ notificacion, onBack, onSave }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'ALERTA',
  });

  useEffect(() => {
    if (notificacion) {
      setFormData({
        titulo: notificacion.titulo || '',
        descripcion: notificacion.descripcion || '',
        tipo: notificacion.tipo || 'ALERTA',
      });
    }
  }, [notificacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      showErrorAlert('Error de validación', 'El título es obligatorio');
      return;
    }

    if (formData.descripcion.trim().length < 10) {
      showErrorAlert('Error de validación', 'La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData, notificacion?.id_notificacion);
      showSuccessAlert(
        '¡Éxito!', 
        notificacion ? 'Notificación actualizada correctamente' : 'Notificación creada correctamente'
      );
      onBack();
    } catch (error) {
      console.error('Error al guardar notificación:', error);
      showErrorAlert('Error', 'Error al guardar la notificación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {notificacion ? 'Editar Notificación' : 'Nueva Notificación'}
        </h1>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título de la notificación"
            />
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Notificación *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALERTA">Alerta</option>
              <option value="NOTIFICACION">Notificación</option>
              <option value="INFORMACION">Información</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción detallada de la notificación (mínimo 10 caracteres)"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.descripcion.length}/1000 caracteres
            </p>
          </div>

          {/* Información del usuario */}
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-600">
              <strong>Creado por:</strong> {user?.nombre} {user?.apellido} ({user?.rol})
            </p>
            {notificacion && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Fecha de creación:</strong> {formatDate(notificacion.fecha)}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (notificacion ? 'Actualizar' : 'Crear')} Notificación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
