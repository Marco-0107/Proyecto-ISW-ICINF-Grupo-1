import { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  Send
} from 'lucide-react';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { crearPostulacion } from '@services/postulacion.service';

const PostulacionForm = ({ convocatoria, usuario, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [comentarios, setComentarios] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    // Limpiar el input
    e.target.value = '';
  };

  const processFiles = (files) => {
    const validFiles = files.filter(file => {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        showErrorAlert('Archivo inválido', `El archivo "${file.name}" no es un PDF válido`);
        return false;
      }
      
      // Validar tamaño (máximo 5MB por archivo)
      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert('Archivo demasiado grande', `El archivo "${file.name}" es demasiado grande. Máximo 5MB`);
        return false;
      }
      
      return true;
    });

    // Añadir archivos válidos sin duplicados
    setArchivos(prev => {
      const existingNames = prev.map(f => f.name);
      const newFiles = validFiles.filter(f => !existingNames.includes(f.name));
      return [...prev, ...newFiles];
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeFile = (index) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (archivos.length === 0) {
      setError('Debes subir al menos un archivo PDF');
      return;
    }

    // Validar que tenemos los IDs necesarios
    console.log('Usuario:', usuario);
    console.log('Convocatoria:', convocatoria);
    
    if (!usuario?.id || !convocatoria?.id_convocatoria) {
      console.error('Faltan datos:', { 
        usuario_id: usuario?.id, 
        convocatoria_id: convocatoria?.id_convocatoria 
      });
      showErrorAlert('Error', 'Faltan datos del usuario o convocatoria');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Añadir datos de la postulación - asegurar que sean números
      formData.append('id_usuario', String(usuario.id));
      formData.append('id_convocatoria', String(convocatoria.id_convocatoria));
      formData.append('comentarios', comentarios.trim());
      
      // Añadir archivos
      archivos.forEach((archivo, index) => {
        formData.append(`archivos`, archivo);
      });

      console.log('Enviando postulación:', {
        id_usuario: usuario.id,
        id_convocatoria: convocatoria.id_convocatoria,
        comentarios: comentarios.trim(),
        archivos: archivos.length
      });

      await crearPostulacion(formData);
      
      console.log('Postulación enviada correctamente');
      showSuccessAlert('¡Éxito!', 'Tu postulación ha sido enviada correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error al enviar postulación:', error);
      
      let errorMessage = 'Error al enviar la postulación';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorAlert('Error', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Postular a Convocatoria
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {convocatoria.titulo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                     rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del usuario */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">
              Información del Postulante
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <p className="font-medium">{usuario.nombreCompleto}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{usuario.email}</p>
              </div>
            </div>
          </div>

          {/* Comentarios adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios adicionales (opcional)
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       resize-none"
              placeholder="Añade cualquier información adicional que consideres relevante para tu postulación..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {comentarios.length}/500 caracteres
            </p>
          </div>

          {/* Subida de archivos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos requeridos (PDF)
              <span className="text-red-500 ml-1">*</span>
            </label>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
                        hover:border-gray-400 transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Arrastra archivos PDF aquí o 
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer ml-1">
                    selecciona archivos
                    <input
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  Solo archivos PDF • Máximo 5MB por archivo
                </p>
              </div>
            </div>
          </div>

          {/* Lista de archivos */}
          {archivos.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Archivos seleccionados ({archivos.length})
              </h4>
              <div className="space-y-2">
                {archivos.map((archivo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 
                             rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {archivo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(archivo.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-600 
                               hover:bg-red-50 rounded transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 
                       rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || archivos.length === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white 
                       rounded-lg hover:bg-blue-700 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Postulación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostulacionForm;
