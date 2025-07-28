import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

const ConvocatoriasList = ({ 
  convocatorias, 
  onNewConvocatoria, 
  onEditConvocatoria, 
  onViewDetail,
  onDeleteConvocatoria,
  userRole 
}) => {
  const { user } = useAuth();
  const [filteredConvocatorias, setFilteredConvocatorias] = useState([]);
  const [filter, setFilter] = useState('todas'); // todas, activas, cerradas

  useEffect(() => {
    filterConvocatorias();
  }, [convocatorias, filter]);

  const filterConvocatorias = () => {
    let filtered = [...convocatorias];
    
    switch (filter) {
      case 'activas':
        filtered = convocatorias.filter(conv => 
          conv.estado === true && new Date(conv.fecha_cierre) >= new Date()
        );
        break;
      case 'cerradas':
        filtered = convocatorias.filter(conv => 
          conv.estado === false || new Date(conv.fecha_cierre) < new Date()
        );
        break;
      default:
        filtered = convocatorias;
    }
    
    setFilteredConvocatorias(filtered);
  };

  const getEstadoColor = (convocatoria) => {
    if (convocatoria.estado === false) return 'bg-red-100 text-red-800';
    if (new Date(convocatoria.fecha_cierre) < new Date()) return 'bg-gray-100 text-gray-800';
    if (convocatoria.estado === true) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getEstadoTexto = (convocatoria) => {
    if (convocatoria.estado === false) return 'Inactiva';
    if (new Date(convocatoria.fecha_cierre) < new Date()) return 'Cerrada';
    if (convocatoria.estado === true) return 'Activa';
    return 'Pendiente';
  };

  const getEstadoIcon = (convocatoria) => {
    if (convocatoria.estado === false) return <XCircle className="w-4 h-4" />;
    if (new Date(convocatoria.fecha_cierre) < new Date()) return <Clock className="w-4 h-4" />;
    if (convocatoria.estado === true) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canManageConvocatorias = ['admin', 'presidenta', 'secretario'].includes(userRole?.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Convocatorias</h1>
          <p className="text-gray-600">
            Gestiona las convocatorias de la comunidad
          </p>
        </div>
        
        {canManageConvocatorias && (
          <button
            onClick={onNewConvocatoria}
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white 
                     rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Convocatoria
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('todas')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filter === 'todas'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({convocatorias.length})
          </button>
          <button
            onClick={() => setFilter('activas')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filter === 'activas'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activas ({convocatorias.filter(c => c.estado === true && new Date(c.fecha_cierre) >= new Date()).length})
          </button>
          <button
            onClick={() => setFilter('cerradas')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filter === 'cerradas'
                ? 'bg-gray-100 text-gray-700 border border-gray-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cerradas ({convocatorias.filter(c => c.estado === false || new Date(c.fecha_cierre) < new Date()).length})
          </button>
        </div>
      </div>

      {/* Lista de convocatorias */}
      <div className="space-y-4">
        {filteredConvocatorias.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay convocatorias
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'todas' 
                ? 'No se han creado convocatorias aún.'
                : `No hay convocatorias ${filter}.`
              }
            </p>
            {canManageConvocatorias && filter === 'todas' && (
              <button
                onClick={onNewConvocatoria}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white 
                         rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear primera convocatoria
              </button>
            )}
          </div>
        ) : (
          filteredConvocatorias.map((convocatoria) => (
            <div
              key={convocatoria.id_convocatoria}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 
                       hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {convocatoria.titulo}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(convocatoria)}`}>
                      {getEstadoIcon(convocatoria)}
                      <span className="ml-1">{getEstadoTexto(convocatoria)}</span>
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {convocatoria.descripcion}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Inicio: {formatFecha(convocatoria.fecha_inicio)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Cierre: {formatFecha(convocatoria.fecha_cierre)}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Actualizada: {formatFecha(convocatoria.fechaActualizacion)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onViewDetail(convocatoria)}
                    className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 
                             rounded-lg transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {canManageConvocatorias && (
                    <>
                      <button
                        onClick={() => onEditConvocatoria(convocatoria)}
                        className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 
                                 rounded-lg transition-colors duration-200"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onDeleteConvocatoria(convocatoria.id_convocatoria)}
                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 
                                 rounded-lg transition-colors duration-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConvocatoriasList;
