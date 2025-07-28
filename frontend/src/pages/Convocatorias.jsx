import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import ConvocatoriasList from '@components/ConvocatoriasList';
import ConvocatoriaForm from '@components/ConvocatoriaForm';
import ConvocatoriaDetail from '@components/ConvocatoriaDetail';
import { 
  getConvocatorias, 
  getConvocatoria,
  createConvocatoria, 
  updateConvocatoria, 
  deleteConvocatoria 
} from '@services/convocatoria.service.js';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

const Convocatorias = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("list"); // list, form, detail
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [editingConvocatoria, setEditingConvocatoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para las convocatorias - inicia vacío para cargar desde el backend
  const [convocatorias, setConvocatorias] = useState([]);

  const userRole = user?.rol || "vecino";

  useEffect(() => {
    loadConvocatorias();
  }, []);

  const loadConvocatorias = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando convocatorias...');
      
      // Conectar con el backend real
      const data = await getConvocatorias();
      console.log('Datos recibidos del servidor:', data);
      setConvocatorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar convocatorias:', error);
      
      // Manejar diferentes tipos de error
      let errorMessage = 'Error al cargar las convocatorias';
      
      if (error.response) {
        // Error de respuesta del servidor
        const status = error.response.status;
        console.log('Status del error:', status);
        
        if (status === 404) {
          console.log('No se encontraron convocatorias (404)');
          // Si es 404, mostrar que no hay convocatorias pero sin error
          setConvocatorias([]);
          setError(null);
          return;
        } else if (status === 401) {
          errorMessage = 'No tienes permisos para ver las convocatorias. Por favor, inicia sesión.';
        } else if (status === 403) {
          errorMessage = 'No tienes permisos para acceder a esta información.';
        } else if (status === 500) {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        } else {
          errorMessage = `Error del servidor (${status}). Contacta al administrador.`;
        }
      } else if (error.request) {
        // Error de red o conexión
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:3000';
        console.log('Error de conexión. Verificar que el backend esté corriendo.');
      } else {
        errorMessage = 'Error inesperado: ' + error.message;
      }
      
      setError(errorMessage);
      setConvocatorias([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleNewConvocatoria = () => {
    setEditingConvocatoria(null);
    setCurrentView("form");
  };

  const handleEditConvocatoria = (convocatoria) => {
    setEditingConvocatoria(convocatoria);
    setCurrentView("form");
  };

  const handleViewConvocatoriaDetail = async (convocatoria) => {
    try {
      // Cargar datos completos de la convocatoria desde el backend
      const fullConvocatoria = await getConvocatoria(convocatoria.id_convocatoria);
      setSelectedConvocatoria(fullConvocatoria);
      setCurrentView("detail");
    } catch (error) {
      console.error('Error al cargar detalles de convocatoria:', error);
      // Si falla la carga, usar los datos que ya tenemos
      setSelectedConvocatoria(convocatoria);
      setCurrentView("detail");
    }
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedConvocatoria(null);
    setEditingConvocatoria(null);
  };

  const handleSaveConvocatoria = async (convocatoriaData) => {
    try {
      console.log('Guardando convocatoria:', convocatoriaData);
      
      if (editingConvocatoria) {
        // Actualizar convocatoria existente
        await updateConvocatoria(editingConvocatoria.id_convocatoria, convocatoriaData);
        console.log('Convocatoria actualizada correctamente');
      } else {
        // Crear nueva convocatoria
        await createConvocatoria(convocatoriaData);
        console.log('Convocatoria creada correctamente');
      }
      
      // Recargar la lista
      await loadConvocatorias();
      handleBackToList();
    } catch (error) {
      console.error('Error al guardar convocatoria:', error);
      
      // Mejorar el mensaje de error para el usuario
      let errorMessage = 'Error al guardar la convocatoria';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes los permisos necesarios';
      } else if (error.response?.status === 400) {
        errorMessage = 'Los datos enviados no son válidos';
      }
      
      // Crear un error personalizado para que el formulario lo pueda manejar
      const customError = new Error(errorMessage);
      customError.response = error.response;
      throw customError;
    }
  };

  const handleDeleteConvocatoria = async (id_convocatoria) => {
    const convocatoria = convocatorias.find(c => c.id_convocatoria === id_convocatoria);
    
    if (!convocatoria) {
      showErrorAlert('Error', 'Convocatoria no encontrada');
      return;
    }

    try {
      const result = await deleteDataAlert();
      if (result.isConfirmed) {
        await deleteConvocatoria(id_convocatoria);
        console.log('Convocatoria eliminada correctamente');
        
        showSuccessAlert('¡Eliminado!', 'La convocatoria ha sido eliminada correctamente.');
        
        // Recargar la lista
        await loadConvocatorias();
        
        // Si estamos viendo el detalle de la convocatoria eliminada, volver a la lista
        if (selectedConvocatoria?.id_convocatoria === id_convocatoria) {
          handleBackToList();
        }
      }
    } catch (error) {
      console.error('Error al eliminar convocatoria:', error);
      showErrorAlert('Error', 'Ocurrió un error al eliminar la convocatoria.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando convocatorias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadConvocatorias}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              Reintentar
            </button>
            <button
              onClick={() => {
                console.log('Estado actual:');
                console.log('- Usuario:', user);
                console.log('- Error:', error);
                console.log('- URL del API:', import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api');
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
            >
              Ver información de debug
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        {currentView === "list" && (
          <ConvocatoriasList
            convocatorias={convocatorias}
            onNewConvocatoria={handleNewConvocatoria}
            onEditConvocatoria={handleEditConvocatoria}
            onViewDetail={handleViewConvocatoriaDetail}
            onDeleteConvocatoria={handleDeleteConvocatoria}
            userRole={userRole}
          />
        )}

        {currentView === "form" && (
          <ConvocatoriaForm
            convocatoria={editingConvocatoria}
            onBack={handleBackToList}
            onSave={handleSaveConvocatoria}
            userRole={userRole}
          />
        )}

        {currentView === "detail" && selectedConvocatoria && (
          <ConvocatoriaDetail
            convocatoria={selectedConvocatoria}
            onBack={handleBackToList}
            onEdit={() => handleEditConvocatoria(selectedConvocatoria)}
            userRole={userRole}
          />
        )}
      </main>
    </div>
  );
};

export default Convocatorias;
