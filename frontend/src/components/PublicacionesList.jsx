import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Eye, 
  Edit2, 
  Trash2,
  FileText,
  AlertCircle,
  Newspaper
} from 'lucide-react';

const PublicacionesList = ({ 
  publicaciones, 
  onNewPublicacion, 
  onEditPublicacion, 
  onViewDetail,
  onDeletePublicacion 
}) => {
  const { user } = useAuth();
  const isAdmin = ['admin', 'presidenta', 'secretario'].includes(user?.rol?.toLowerCase());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('fecha_desc');

  // Función para obtener el icono según el tipo
  const getTypeIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
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

  // Función para obtener el color según el tipo
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

  // Filtrar y ordenar publicaciones
  const filteredPublicaciones = publicaciones
    .filter(pub => {
      const matchesSearch = pub.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.contenido?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || pub.tipo === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'fecha_desc':
          return new Date(b.fecha_publicacion || b.fechaPublicacion) - new Date(a.fecha_publicacion || a.fechaPublicacion);
        case 'fecha_asc':
          return new Date(a.fecha_publicacion || a.fechaPublicacion) - new Date(b.fecha_publicacion || b.fechaPublicacion);
        case 'titulo':
          return a.titulo.localeCompare(b.titulo);
        default:
          return 0;
      }
    });

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Noticias y Publicaciones</h1>
          <p className="text-gray-600 mt-1">
            Mantente informado sobre las últimas noticias de la comunidad
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={onNewPublicacion}
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white 
                     rounded-lg hover:bg-green-600 transition-colors duration-200
                     shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Publicación
          </button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar publicaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-white appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">Todos los tipos</option>
              <option value="noticia">Noticias</option>
              <option value="comunicado">Comunicados</option>
              <option value="alerta">Alertas</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-white appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="fecha_desc">Más recientes</option>
              <option value="fecha_asc">Más antiguos</option>
              <option value="titulo">Por título</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de publicaciones */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPublicaciones.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron publicaciones
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay publicaciones disponibles'
              }
            </p>
          </div>
        ) : (
          filteredPublicaciones.map((publicacion) => (
            <div
              key={publicacion.id_publicacion || publicacion.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 
                       hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Imagen si existe */}
              {publicacion.imagen && (
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={publicacion.imagen}
                    alt={publicacion.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Error cargando imagen:', publicacion.imagen);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Imagen cargada correctamente:', publicacion.imagen);
                    }}
                  />
                </div>
              )}

              <div className="p-4">
                {/* Tipo y fecha */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(publicacion.tipo)}`}>
                    {getTypeIcon(publicacion.tipo)}
                    <span className="ml-1 capitalize">{publicacion.tipo || 'Sin tipo'}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(publicacion.fecha_publicacion || publicacion.fechaPublicacion)}
                  </span>
                </div>

                {/* Título */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {publicacion.titulo}
                </h3>

                {/* Contenido */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {truncateContent(publicacion.contenido)}
                </p>

                {/* Autor */}
                {publicacion.autor && (
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <User className="w-3 h-3 mr-1" />
                    {publicacion.autor}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onViewDetail(publicacion)}
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 
                             text-sm font-medium transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver detalle
                  </button>

                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditPublicacion(publicacion)}
                        className="p-1 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {onDeletePublicacion && (
                        <button
                          onClick={() => onDeletePublicacion(publicacion)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estadísticas */}
      {filteredPublicaciones.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {filteredPublicaciones.length} de {publicaciones.length} publicaciones
        </div>
      )}
    </div>
  );
};

export default PublicacionesList;
