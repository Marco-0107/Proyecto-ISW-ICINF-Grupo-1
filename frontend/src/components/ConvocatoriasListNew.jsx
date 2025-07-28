import { useState } from 'react';
import { 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  Filter,
  Search
} from 'lucide-react';

const ConvocatoriasList = ({ 
  convocatorias, 
  onNewConvocatoria, 
  onEditConvocatoria, 
  onViewDetail, 
  onDeleteConvocatoria,
  userRole 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');

  // Permisos basados en roles
  const canCreate = ['admin', 'presidenta', 'secretario'].includes(userRole);
  const canEdit = ['admin', 'presidenta', 'secretario'].includes(userRole);
  const canDelete = ['admin'].includes(userRole);

  // Filtrar convocatorias
  const filteredConvocatorias = convocatorias.filter(convocatoria => {
    const matchesSearch = convocatoria.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          convocatoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todas' || convocatoria.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Función para obtener el color del estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'borrador':
        return 'bg-gray-100 text-gray-800';
      case 'pendiente_aprobacion':
        return 'bg-yellow-100 text-yellow-800';
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'cerrada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (estado) => {
    switch (estado) {
      case 'borrador':
        return 'Borrador';
      case 'pendiente_aprobacion':
        return 'Pendiente Aprobación';
      case 'activa':
        return 'Activa';
      case 'cerrada':
        return 'Cerrada';
      default:
        return estado;
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para calcular días restantes
  const getDaysRemaining = (fechaCierre) => {
    const today = new Date();
    const closeDate = new Date(fechaCierre);
    const diffTime = closeDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Convocatorias</h1>
          <p className="mt-2 text-gray-600">
            Gestiona las convocatorias y oportunidades para la comunidad
          </p>
        </div>
        
        {canCreate && (
          <button
            onClick={onNewConvocatoria}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Convocatoria
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar convocatorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="borrador">Borrador</option>
                <option value="pendiente_aprobacion">Pendiente</option>
                <option value="activa">Activas</option>
                <option value="cerrada">Cerradas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de convocatorias */}
      {filteredConvocatorias.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || statusFilter !== 'todas' ? 'No se encontraron convocatorias' : 'No hay convocatorias'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'todas' 
              ? 'Intenta cambiar los filtros de búsqueda' 
              : 'Comienza creando una nueva convocatoria'}
          </p>
          {canCreate && !searchTerm && statusFilter === 'todas' && (
            <div className="mt-6">
              <button
                onClick={onNewConvocatoria}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Convocatoria
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredConvocatorias.map((convocatoria) => {
            const daysRemaining = getDaysRemaining(convocatoria.fecha_cierre);
            
            return (
              <div
                key={convocatoria.id_convocatoria}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {convocatoria.titulo}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(convocatoria.estado)}`}>
                        {getStatusText(convocatoria.estado)}
                      </span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {convocatoria.descripcion}
                  </p>

                  {/* Fechas */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Inicio: {formatDate(convocatoria.fecha_inicio)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Cierre: {formatDate(convocatoria.fecha_cierre)}</span>
                    </div>
                    {convocatoria.estado === 'activa' && (
                      <div className="flex items-center text-sm">
                        <span className={`font-medium ${daysRemaining > 7 ? 'text-green-600' : daysRemaining > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Convocatoria cerrada'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <button
                      onClick={() => onViewDetail(convocatoria)}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver detalle
                    </button>

                    <div className="flex items-center space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => onEditConvocatoria(convocatoria)}
                          className="inline-flex items-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => onDeleteConvocatoria(convocatoria.id_convocatoria)}
                          className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Estadísticas */}
      {filteredConvocatorias.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {convocatorias.filter(c => c.estado === 'activa').length}
              </div>
              <div className="text-sm text-gray-600">Activas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {convocatorias.filter(c => c.estado === 'pendiente_aprobacion').length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {convocatorias.filter(c => c.estado === 'borrador').length}
              </div>
              <div className="text-sm text-gray-600">Borradores</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {convocatorias.filter(c => c.estado === 'cerrada').length}
              </div>
              <div className="text-sm text-gray-600">Cerradas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConvocatoriasList;
