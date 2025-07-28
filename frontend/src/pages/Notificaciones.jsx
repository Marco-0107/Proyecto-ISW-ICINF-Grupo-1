import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import NotificacionesList from '@components/NotificacionesList';
import NotificacionForm from '@components/NotificacionForm';
import NotificacionDetail from '@components/NotificacionDetail';
import { 
  getNotificaciones, 
  getNotificacionById,
  createNotificacion, 
  updateNotificacion, 
  deleteNotificacion 
} from '@services/notificaciones.service.js';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

export default function Notificaciones() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState("list");
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const [editingNotificacion, setEditingNotificacion] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verificar permisos de acceso
  const canManageNotifications = ['admin', 'presidenta', 'presidente', 'secretaria', 'secretario'].includes(user?.rol?.toLowerCase());

  // Si no tiene permisos, mostrar mensaje de acceso denegado
  if (!canManageNotifications) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para gestionar las notificaciones.</p>
          <p className="text-sm text-gray-500">Solo administradores, presidentes y secretarios pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotificaciones();
  }, []);

  // Manejar parámetros de URL para edición
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      handleEditFromUrl(editId);
    }
  }, [searchParams]);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await getNotificaciones();
      setNotificaciones(data || []); // Asegurar que siempre sea un array
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setNotificaciones([]); // En caso de error, inicializar como array vacío
    } finally {
      setLoading(false);
    }
  };

  const handleEditFromUrl = async (notificacionId) => {
    try {
      const notificacion = await getNotificacionById(notificacionId);
      setEditingNotificacion(notificacion);
      setCurrentView("form");
      // Limpiar el parámetro de la URL
      setSearchParams({});
    } catch (error) {
      console.error('Error al cargar notificación para editar:', error);
    }
  };

  const handleNewNotificacion = () => {
    setEditingNotificacion(null);
    setCurrentView("form");
  };

  const handleEditNotificacion = (notificacion) => {
    setEditingNotificacion(notificacion);
    setCurrentView("form");
  };

  const handleViewDetail = (notificacion) => {
    setSelectedNotificacion(notificacion);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedNotificacion(null);
    setEditingNotificacion(null);
  };

  const handleSaveNotificacion = async (formData, notificacionId) => {
    try {
      if (notificacionId) {
        // Actualizar notificación existente
        await updateNotificacion(notificacionId, formData);
      } else {
        // Crear nueva notificación
        await createNotificacion(formData);
      }
      
      // Recargar la lista de notificaciones
      await fetchNotificaciones();
    } catch (error) {
      console.error('Error al guardar notificación:', error);
      throw error;
    }
  };

  const handleDeleteNotificacion = async (id_notificacion) => {
    try {
      const result = await deleteDataAlert();
      if (result.isConfirmed) {
        await deleteNotificacion(id_notificacion);
        await fetchNotificaciones();
        showSuccessAlert('¡Eliminado!', 'La notificación ha sido eliminada correctamente.');
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      showErrorAlert('Error', 'Ocurrió un error al eliminar la notificación.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6">
        {currentView === "list" && (
          <NotificacionesList
            notificaciones={notificaciones || []}
            onNewNotificacion={handleNewNotificacion}
            onEditNotificacion={handleEditNotificacion}
            onViewDetail={handleViewDetail}
            onDelete={handleDeleteNotificacion}
          />
        )}

        {currentView === "form" && (
          <NotificacionForm
            notificacion={editingNotificacion}
            onBack={handleBackToList}
            onSave={handleSaveNotificacion}
          />
        )}

        {currentView === "detail" && selectedNotificacion && (
          <NotificacionDetail
            notificacion={selectedNotificacion}
            onBack={handleBackToList}
            onEdit={() => handleEditNotificacion(selectedNotificacion)}
          />
        )}
      </main>
    </div>
  );
}
