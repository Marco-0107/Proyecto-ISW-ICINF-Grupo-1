import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Newspaper
} from 'lucide-react';

const PublicacionForm = ({ publicacion, onBack, onSave }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'noticia',
    contenido: '',
    estado: 'pendiente',
    imagen: null
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (publicacion) {
      setFormData({
        titulo: publicacion.titulo || '',
        tipo: publicacion.tipo || 'noticia',
        contenido: publicacion.contenido || '',
        estado: publicacion.estado || 'pendiente',
        imagen: publicacion.imagen || null
      });
    }
  }, [publicacion]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          imagen: 'Solo se permiten archivos de imagen'
        }));
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imagen: 'La imagen no puede ser mayor a 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
      
      setErrors(prev => ({
        ...prev,
        imagen: null
      }));
    }
  };

  const validateForm = () => {
    console.log('Iniciando validación del formulario...');
    const newErrors = {};
    
    const titulo = (formData.titulo || '').toString().trim();
    const contenido = (formData.contenido || '').toString().trim();
    
    console.log('Validando campos:');
    console.log('- titulo:', titulo, '(length:', titulo.length, ')');
    console.log('- contenido:', contenido, '(length:', contenido.length, ')');
    console.log('- tipo:', formData.tipo);
    
    if (!titulo) {
      newErrors.titulo = 'El título es obligatorio';
      console.log('Error: Título vacío');
    } else if (titulo.length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
      console.log('Error: Título muy corto');
    } else if (titulo.length > 250) {
      newErrors.titulo = 'El título no puede tener más de 250 caracteres';
      console.log('Error: Título muy largo');
    } else {
      console.log('Título válido');
    }
    
    if (!contenido) {
      newErrors.contenido = 'El contenido es obligatorio';
      console.log('Error: Contenido vacío');
    } else if (contenido.length < 1) {
      newErrors.contenido = 'El contenido debe tener al menos 1 caracter';
      console.log('Error: Contenido muy corto');
    } else if (contenido.length > 5000) {
      newErrors.contenido = 'El contenido no puede tener más de 5000 caracteres';
      console.log('Error: Contenido muy largo');
    } else {
      console.log('Contenido válido');
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'Selecciona un tipo de publicación';
      console.log('Error: Tipo vacío');
    } else if (!['noticia', 'comunicado', 'alerta'].includes(formData.tipo)) {
      newErrors.tipo = 'Tipo de publicación inválido';
      console.log('Error: Tipo inválido');
    } else {
      console.log('Tipo válido');
    }

    console.log('Errores encontrados:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Formulario válido:', isValid);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Iniciando envío del formulario');
    console.log('Datos del formulario:', formData);
    
    if (!validateForm()) {
      console.log('La Validación Fallo');
      return;
    }

    setLoading(true);
    
    try {
      // Usar la misma lógica que Home.jsx - enviar objeto simple sin FormData
      const submitData = {
        titulo: formData.titulo.trim(),
        tipo: formData.tipo,
        contenido: formData.contenido.trim(),
        estado: formData.estado
      };

      console.log('🚀 Enviando datos como Home.jsx:', submitData);

      // Enviar datos igual que en Home
      await onSave(submitData, publicacion?.id_publicacion);
      console.log('✅ onSave completado exitosamente');
      // No llamar onBack() aquí, será manejado por el componente padre
      
    } catch (error) {
      console.error('Error al guardar:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error al guardar la publicación';
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'comunicado':
        return <FileText className="w-4 h-4" />;
      case 'alerta':
        return <AlertCircle className="w-4 h-4" />;
      case 'noticia':
        return <Newspaper className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

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
              {publicacion ? 'Editar Publicación' : 'Nueva Publicación'}
            </h1>
            <p className="text-gray-600">
              {publicacion ? 'Modifica los datos de la publicación' : 'Crea una nueva publicación para la comunidad'}
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

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Título */}
            <div className="lg:col-span-2">
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
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
                placeholder="Título de la publicación"
                maxLength={250}
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.titulo.length}/250 caracteres
              </p>
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Publicación *
              </label>
              <div className="relative">
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                            focus:border-transparent transition-colors duration-200 appearance-none bg-white ${
                              errors.tipo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                >
                  <option value="noticia"> Noticia</option>
                  <option value="comunicado">Comunicado</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {getTypeIcon(formData.tipo)}
                </div>
              </div>
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         transition-colors duration-200 appearance-none bg-white"
              >
                <option value="pendiente">Pendiente</option>
                <option value="publicada">Publicada</option>
              </select>
            </div>

            {/* Imagen */}
            <div className="lg:col-span-2">
              <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-2">
                Imagen (opcional)
              </label>
              <div className="space-y-4">
                {/* Vista previa de imagen actual o nueva */}
                {formData.imagen && (
                  <div className="relative inline-block">
                    <img
                      src={formData.imagen instanceof File 
                           ? URL.createObjectURL(formData.imagen)
                           : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${formData.imagen}`
                      }
                      alt="Imagen de la publicación"
                      className="h-32 w-auto rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error('Error loading image:', formData.imagen);
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imagen: null }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white 
                               rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Input de archivo */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="imagen"
                    className={`flex flex-col items-center justify-center w-full h-32 
                              border-2 border-dashed rounded-lg cursor-pointer 
                              hover:bg-gray-50 transition-colors duration-200 ${
                                errors.imagen ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.imagen instanceof File ? (
                        <>
                          <ImageIcon className="w-8 h-8 text-green-500 mb-2" />
                          <p className="text-sm text-green-600 font-medium">
                            {formData.imagen.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Click para cambiar imagen
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Click para subir</span> o arrastra una imagen
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="imagen"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {errors.imagen && (
                  <p className="text-sm text-red-600">{errors.imagen}</p>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="lg:col-span-2">
              <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido *
              </label>
              <textarea
                id="contenido"
                name="contenido"
                value={formData.contenido}
                onChange={handleInputChange}
                rows={8}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent transition-colors duration-200 resize-none ${
                            errors.contenido ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                placeholder="Escribe el contenido de la publicación..."
                maxLength={5000}
              />
              {errors.contenido && (
                <p className="mt-1 text-sm text-red-600">{errors.contenido}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.contenido.length}/5000 caracteres
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-gray-700 bg-gray-500 text-white border border-gray-300 
                       rounded-lg hover:bg-gray-600 transition-colors duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white 
                       rounded-lg hover:bg-green-600 transition-colors duration-200
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
                  {publicacion ? 'Actualizar' : 'Crear'} Publicación
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PublicacionForm;
