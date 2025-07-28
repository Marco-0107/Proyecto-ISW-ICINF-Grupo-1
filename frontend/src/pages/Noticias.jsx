import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import PublicacionesList from '@components/PublicacionesList';
import PublicacionForm from '@components/PublicacionForm';
import PublicacionDetail from '@components/PublicacionDetail';
import { 
  getPublicaciones, 
  getPublicacionById,
  createPublicacion, 
  updatePublicacion, 
  deletePublicacion 
} from '@services/publicaciones.service.js';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

export default function Noticias() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState("list");
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);
  const [editingPublicacion, setEditingPublicacion] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar publicaciones al montar el componente
  useEffect(() => {
    fetchPublicaciones();
  }, []);

  // Manejar parámetros de URL para edición
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      handleEditFromUrl(editId);
    }
  }, [searchParams]);

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      const data = await getPublicaciones();
      setPublicaciones(data);
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFromUrl = async (publicacionId) => {
    try {
      const publicacion = await getPublicacionById(publicacionId);
      setEditingPublicacion(publicacion);
      setCurrentView("form");
      // Limpiar el parámetro de la URL
      setSearchParams({});
    } catch (error) {
      console.error('Error al cargar publicación para editar:', error);
    }
  };

  const handleNewPublicacion = () => {
    setEditingPublicacion(null);
    setCurrentView("form");
  };

  const handleEditPublicacion = (publicacion) => {
    setEditingPublicacion(publicacion);
    setCurrentView("form");
  };

  const handleViewDetail = (publicacion) => {
    setSelectedPublicacion(publicacion);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedPublicacion(null);
    setEditingPublicacion(null);
  };

  const handleSavePublicacion = async (formData, publicacionId) => {
    try {
      if (publicacionId) {
        // Actualizar publicación existente
        await updatePublicacion(publicacionId, formData);
      } else {
        // Crear nueva publicación
        await createPublicacion(formData);
      }
      
      // Recargar la lista de publicaciones
      await fetchPublicaciones();
    } catch (error) {
      console.error('Error al guardar publicación:', error);
      throw error;
    }
  };

  const handleDeletePublicacion = async (publicacion) => {
    try {
      const result = await deleteDataAlert();
      if (result.isConfirmed) {
        await deletePublicacion(publicacion.id_publicacion);
        await fetchPublicaciones();
        showSuccessAlert('¡Eliminado!', 'La publicación ha sido eliminada correctamente.');
      }
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      showErrorAlert('Error', 'Ocurrió un error al eliminar la publicación.');
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando publicaciones...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      {currentView === "list" && (
        <PublicacionesList
          publicaciones={publicaciones}
          onNewPublicacion={handleNewPublicacion}
          onEditPublicacion={handleEditPublicacion}
          onViewDetail={handleViewDetail}
          onDeletePublicacion={handleDeletePublicacion}
        />
      )}

      {currentView === "form" && (
        <PublicacionForm
          publicacion={editingPublicacion}
          onBack={handleBackToList}
          onSave={handleSavePublicacion}
        />
      )}

      {currentView === "detail" && selectedPublicacion && (
        <PublicacionDetail
          publicacion={selectedPublicacion}
          onBack={handleBackToList}
          onEdit={() => handleEditPublicacion(selectedPublicacion)}
        />
      )}
    </main>
  );
}