import { useAuth } from '@context/AuthContext';

// Utilidad para formatear fecha de forma corta
const formatDateShort = (fecha) => {
  const fechaObj = new Date(fecha);
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  };
  return fechaObj.toLocaleDateString('es-ES', options);
};

export default function NotificacionesList({ 
  notificaciones = [], 
  onNewNotificacion, 
  onEditNotificacion, 
  onViewDetail, 
  onDelete 
}) {
  const { user } = useAuth();
  const isAdmin = ['admin', 'presidenta', 'presidente', 'secretaria', 'secretario'].includes(user?.rol?.toLowerCase());

  // Debug logging
  console.log('NotificacionesList - Props recibidas:', {
    notificacionesLength: notificaciones?.length,
    isArray: Array.isArray(notificaciones),
    userRole: user?.rol,
    isAdmin,
    notificaciones: notificaciones
  });

  const getTipoStyle = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'alerta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'notificacion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'informacion':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones y Alertas</h1>
        {isAdmin && (
          <button
            onClick={onNewNotificacion}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Notificación</span>
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      {!notificaciones || notificaciones.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
          <p className="text-gray-500 mb-2">Cuando se creen notificaciones, aparecerán aquí.</p>
          <div className="text-xs text-gray-400 mt-4 p-2 bg-gray-50 rounded">
            Debug: Array={Array.isArray(notificaciones) ? 'Sí' : 'No'}, Length={notificaciones?.length || 0}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notificaciones.map((notificacion) => (
            <div
              key={notificacion.id_notificacion}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Tipo de notificación */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoStyle(notificacion.tipo)}`}
                >
                  {notificacion.tipo?.toUpperCase() || 'SIN_TIPO'}
                </span>
                {!notificacion.estado_visualizacion && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>

              {/* Título */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {notificacion.titulo}
              </h3>

              {/* Descripción truncada */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {notificacion.descripcion}
              </p>

              {/* Fecha */}
              <p className="text-xs text-gray-500 mb-4">
                {formatDateShort(notificacion.fecha)}
              </p>

              {/* Acciones */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onViewDetail(notificacion)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium"
                >
                  Ver Detalle
                </button>
                
                {isAdmin && (
                  <>
                    <button
                      onClick={() => onEditNotificacion(notificacion)}
                      className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 rounded text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(notificacion.id_notificacion)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
