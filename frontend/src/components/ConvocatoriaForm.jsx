import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  FileText, 
  AlertCircle,
  Clock
} from 'lucide-react';

const ConvocatoriaForm = ({ convocatoria, onBack, onSave }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    fecha_inicio: '',
    fecha_cierre: '',
    estado: true
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (convocatoria) {
      setFormData({
        titulo: convocatoria.titulo || '',
        descripcion: convocatoria.descripcion || '',
        requisitos: convocatoria.requisitos || '',
        fecha_inicio: convocatoria.fecha_inicio ? convocatoria.fecha_inicio.split('T')[0] : '',
        fecha_cierre: convocatoria.fecha_cierre ? convocatoria.fecha_cierre.split('T')[0] : '',
        estado: convocatoria.estado !== undefined ? convocatoria.estado : true
      });
    }
  }, [convocatoria]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar título
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.trim().length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    } else if (formData.titulo.trim().length > 250) {
      newErrors.titulo = 'El título no puede tener más de 250 caracteres';
    }
    
    // Validar descripción
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.descripcion.trim().length > 1000) {
      newErrors.descripcion = 'La descripción no puede tener más de 1000 caracteres';
    }
    
    // Validar requisitos
    if (!formData.requisitos.trim()) {
      newErrors.requisitos = 'Los requisitos son obligatorios';
    } else if (formData.requisitos.trim().length < 10) {
      newErrors.requisitos = 'Los requisitos deben tener al menos 10 caracteres';
    } else if (formData.requisitos.trim().length > 1000) {
      newErrors.requisitos = 'Los requisitos no pueden tener más de 1000 caracteres';
    }
    
    // Validar fechas
    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    }
    
    if (!formData.fecha_cierre) {
      newErrors.fecha_cierre = 'La fecha de cierre es obligatoria';
    }
    
    if (formData.fecha_inicio && formData.fecha_cierre) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaCierre = new Date(formData.fecha_cierre);
      
      if (fechaCierre <= fechaInicio) {
        newErrors.fecha_cierre = 'La fecha de cierre debe ser posterior a la fecha de inicio';
      }
      
      // Validar que la fecha de inicio no sea en el pasado (solo para nuevas convocatorias)
      if (!convocatoria && fechaInicio < new Date().setHours(0, 0, 0, 0)) {
        newErrors.fecha_inicio = 'La fecha de inicio no puede ser en el pasado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        requisitos: formData.requisitos.trim(),
        fecha_inicio: formData.fecha_inicio,
        fecha_cierre: formData.fecha_cierre,
        estado: formData.estado
      };

      console.log('📤 Enviando datos de convocatoria:', submitData);

      if (onSave) {
        await onSave(submitData, convocatoria?.id_convocatoria);
      }
      
      onBack();
    } catch (error) {
      console.error('Error al guardar convocatoria:', error);
      
      let errorMessage = 'Error al guardar la convocatoria';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        submit: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                     rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {convocatoria ? 'Editar Convocatoria' : 'Nueva Convocatoria'}
            </h1>
            <p className="text-gray-600">
              {convocatoria ? 'Modifica los datos de la convocatoria' : 'Crea una nueva convocatoria para la comunidad'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Error general */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{errors.submit}</span>
              </div>
            </div>
          )}

          <div className="grid gap-6">
            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Convocatoria *
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent transition-colors duration-200 ${
                            errors.titulo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                placeholder="Ej: Subsidio Habitacional 2024"
                maxLength={250}
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.titulo.length}/250 caracteres
              </p>
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
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent transition-colors duration-200 resize-none ${
                            errors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                placeholder="Describe detalladamente la convocatoria, sus objetivos y beneficios..."
                maxLength={1000}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.descripcion.length}/1000 caracteres
              </p>
            </div>

            {/* Requisitos */}
            <div>
              <label htmlFor="requisitos" className="block text-sm font-medium text-gray-700 mb-2">
                Requisitos *
              </label>
              <textarea
                id="requisitos"
                name="requisitos"
                value={formData.requisitos}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent transition-colors duration-200 resize-none ${
                            errors.requisitos ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                placeholder="Lista los requisitos necesarios para postular, separados por punto y coma..."
                maxLength={1000}
              />
              {errors.requisitos && (
                <p className="mt-1 text-sm text-red-600">{errors.requisitos}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.requisitos.length}/1000 caracteres
              </p>
            </div>

            {/* Fechas */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Fecha de inicio */}
              <div>
                <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    min={convocatoria ? undefined : today}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                              focus:border-transparent transition-colors duration-200 ${
                                errors.fecha_inicio ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {errors.fecha_inicio && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio}</p>
                )}
              </div>

              {/* Fecha de cierre */}
              <div>
                <label htmlFor="fecha_cierre" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Cierre *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="fecha_cierre"
                    name="fecha_cierre"
                    value={formData.fecha_cierre}
                    onChange={handleInputChange}
                    min={formData.fecha_inicio || today}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                              focus:border-transparent transition-colors duration-200 ${
                                errors.fecha_cierre ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {errors.fecha_cierre && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_cierre}</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                           focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Convocatoria activa
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Si está marcado, la convocatoria estará visible y disponible para postulaciones
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 
                       rounded-lg hover:bg-gray-50 transition-colors duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white 
                       rounded-lg hover:bg-blue-700 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {convocatoria ? 'Actualizar' : 'Crear'} Convocatoria
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ConvocatoriaForm;
