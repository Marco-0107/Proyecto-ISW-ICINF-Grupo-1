import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationsSidebar from '@components/NotificationsSidebar';
import { getNotificaciones, markNotificacionAsRead } from '@services/notificaciones.service.js';

export default function Header() {
  const [showNotificationsSidebar, setShowNotificationsSidebar] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotificaciones();
  }, []);

  // Calcular notificaciones no leídas
  useEffect(() => {
    const unread = notificaciones.filter(n => !n.estado_visualizacion).length;
    setUnreadCount(unread);
  }, [notificaciones]);

  const fetchNotificaciones = async () => {
    try {
      const data = await getNotificaciones();
      setNotificaciones(data || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setNotificaciones([]);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await markNotificacionAsRead(id);
      // Actualizar localmente
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id_notificacion === id 
            ? { ...notif, estado_visualizacion: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  return (
    <>
      {/* Header fijo */}
      <header className="fixed top-0 right-0 z-30 p-4">
        <div className="flex justify-end">
          <div className="relative">
            <button 
              onClick={() => setShowNotificationsSidebar(true)} 
              className="relative p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors duration-200"
              title="Ver notificaciones"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Sidebar */}
      <NotificationsSidebar
        isOpen={showNotificationsSidebar}
        onClose={() => setShowNotificationsSidebar(false)}
        notificaciones={notificaciones}
        onMarkAsRead={markNotificationAsRead}
      />
    </>
  );
}
