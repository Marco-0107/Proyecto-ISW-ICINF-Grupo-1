import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPublicacionById } from '@services/publicaciones.service.js';
import PublicacionDetail from '@components/PublicacionDetail';
import '@styles/reuniones.css';

export default function PublicacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publicacion, setPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicacion();
  }, [id]);

  const fetchPublicacion = async () => {
    try {
      setLoading(true);
      const data = await getPublicacionById(id);
      setPublicacion(data);
    } catch (error) {
      console.error('Error al cargar publicación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/noticias');
  };

  const handleEdit = () => {
    // Redireccionar a la página de noticias con parámetros para editar
    navigate(`/noticias?edit=${id}`);
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando publicación...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <PublicacionDetail
        publicacion={publicacion}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </main>
  );
}
