import { useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Utilidad para formatear tiempo transcurrido
const formatTimeAgo = (fecha) => {
  const ahora = new Date();
  const fechaObj = new Date(fecha);
  const diferencia = ahora - fechaObj;
  
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  
  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  
  return fechaObj.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

export default function NotificationsSidebar({ 
  isOpen, 
  onClose, 
  notificaciones = [], 
  onMarkAsRead 
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Verificar permisos para ver todas las notificaciones
  const canViewAllNotifications = ['admin', 'presidenta', 'presidente', 'secretaria', 'secretario'].includes(user?.rol?.toLowerCase());

  // Función para manejar el clic en "Ver todas las notificaciones"
  const handleViewAllNotifications = () => {
    if (canViewAllNotifications) {
      navigate('/notificaciones');
      onClose();
    }
  };
  // Cerrar el sidebar con la tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const getTipoIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'alerta':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'notificacion':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'informacion':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-gray-900/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {!notificaciones || notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No hay notificaciones</h3>
              <p className="text-sm text-gray-500">Todas las notificaciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id_notificacion}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notificacion.estado_visualizacion ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onMarkAsRead(notificacion.id_notificacion)}
                >
                  <div className="flex space-x-3">
                    {/* Icono del tipo */}
                    {getTipoIcon(notificacion.tipo)}
                    
                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium text-gray-900 mb-1 ${
                          !notificacion.estado_visualizacion ? 'font-semibold' : ''
                        }`}>
                          {notificacion.titulo}
                        </h4>
                        {!notificacion.estado_visualizacion && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {notificacion.descripcion}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notificacion.fecha)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {canViewAllNotifications && (
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleViewAllNotifications}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    </>
  );
}
