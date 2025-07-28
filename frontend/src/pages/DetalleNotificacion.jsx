import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { getNotificacionById } from '@services/notificaciones.service.js';
import NotificacionDetail from '@components/NotificacionDetail';

export default function DetalleNotificacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificacion, setNotificacion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar permisos de acceso al detalle
  const canViewDetail = ['admin', 'presidenta', 'presidente', 'secretaria', 'secretario'].includes(user?.rol?.toLowerCase());

  useEffect(() => {
    // Si no tiene permisos, redirigir al home
    if (!canViewDetail) {
      navigate('/');
      return;
    }
    fetchNotificacion();
  }, [id, canViewDetail]);

  const fetchNotificacion = async () => {
    try {
      setLoading(true);
      const data = await getNotificacionById(id);
      setNotificacion(data);
    } catch (error) {
      console.error('Error al cargar notificación:', error);
      alert('Error al cargar la notificación');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleEdit = () => {
    // Solo permitir editar si tiene permisos
    if (canViewDetail) {
      navigate(`/notificaciones?edit=${id}`);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando notificación...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <NotificacionDetail
        notificacion={notificacion}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </main>
  );
}
