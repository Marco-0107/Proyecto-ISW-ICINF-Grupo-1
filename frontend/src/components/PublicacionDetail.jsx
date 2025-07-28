import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { 
  ArrowLeft, 
  Edit2, 
  Calendar, 
  User, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  FileText,
  AlertCircle,
  Newspaper,
  Clock,
  Eye
} from 'lucide-react';

const PublicacionDetail = ({ publicacion, onBack, onEdit }) => {
  const { user } = useAuth();
  const isAdmin = ['admin', 'presidenta', 'secretario'].includes(user?.rol?.toLowerCase());
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  if (!publicacion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando publicación...</p>
        </div>
      </div>
    );
  }

  const getTypeIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'comunicado':
        return <FileText className="w-5 h-5" />;
      case 'alerta':
        return <AlertCircle className="w-5 h-5" />;
      case 'noticia':
        return <Newspaper className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'comunicado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'alerta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'noticia':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publicacion.titulo,
          text: publicacion.contenido.substring(0, 200) + '...',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Enlace copiado al portapapeles');
      });
    }
    setShareMenuOpen(false);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Aquí podrías agregar la lógica para guardar/quitar de favoritos
  };

  const getEstadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'publicada':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Publicada
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </span>
        );
      case 'archivada':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Archivada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 
                   hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Botón de compartir */}
          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                       rounded-lg transition-colors duration-200"
              title="Compartir"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            {shareMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg 
                           shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 
                           hover:bg-gray-50 transition-colors duration-200"
                >
                  Compartir publicación
                </button>
              </div>
            )}
          </div>

          {/* Botón de favoritos */}
          <button
            onClick={toggleBookmark}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                     rounded-lg transition-colors duration-200"
            title={isBookmarked ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-blue-600" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>

          {/* Botón de editar */}
          {isAdmin && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white 
                       rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Imagen destacada */}
        {publicacion.imagen && (
          <div className="h-64 lg:h-80 bg-gray-100 overflow-hidden">
            <img
              src={publicacion.imagen}
              alt={publicacion.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 lg:p-8">
          {/* Metadatos */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Tipo */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(publicacion.tipo)}`}>
              {getTypeIcon(publicacion.tipo)}
              <span className="ml-2 capitalize">{publicacion.tipo || 'Sin tipo'}</span>
            </span>

            {/* Estado */}
            {publicacion.estado && getEstadoBadge(publicacion.estado)}

            {/* Fecha de publicación */}
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(publicacion.fecha_publicacion || publicacion.fechaPublicacion)}
            </div>

            {/* Autor */}
            {publicacion.autor && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                {publicacion.autor}
              </div>
            )}

            {/* Vistas (si está disponible) */}
            {publicacion.vistas && (
              <div className="flex items-center text-sm text-gray-600">
                <Eye className="w-4 h-4 mr-2" />
                {publicacion.vistas} vistas
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {publicacion.titulo}
          </h1>

          {/* Contenido */}
          <div className="prose prose-lg max-w-none">
            {publicacion.contenido ? (
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: publicacion.contenido }}
              />
            ) : (
              <p className="text-gray-600 italic">Sin contenido disponible</p>
            )}
          </div>

          {/* Archivos adjuntos */}
          {publicacion.archivos && publicacion.archivos.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Archivos adjuntos
              </h3>
              <div className="space-y-2">
                {publicacion.archivos.map((archivo, index) => (
                  <a
                    key={index}
                    href={archivo.url || `#${archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-gray-50 
                             rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">
                      {archivo.nombre || archivo}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Información adicional */}
          {(publicacion.fecha_creacion || publicacion.fechaCreacion) && 
           (publicacion.fecha_creacion !== publicacion.fecha_publicacion && 
            publicacion.fechaCreacion !== publicacion.fechaPublicacion) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Fecha de creación:</span>{' '}
                {formatDate(publicacion.fecha_creacion || publicacion.fechaCreacion)}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Acciones adicionales (si las hay) */}
      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                   rounded-lg transition-colors duration-200"
        >
          Volver a la lista
        </button>
      </div>
    </div>
  );
};

export default PublicacionDetail;
