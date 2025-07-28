import { useState } from 'react';
import { 
  createPublicacion as createPublicacionService,
  updatePublicacion as updatePublicacionService,
  deletePublicacion as deletePublicacionService 
} from '@services/publicaciones.service.js';

const usePublicacionActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPublicacion = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convertir FormData a objeto si es necesario
      const submitData = formData instanceof FormData ? 
        Object.fromEntries(formData.entries()) : formData;
      
      const result = await createPublicacionService(submitData);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Error al crear la publicación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePublicacion = async (id, formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convertir FormData a objeto si es necesario
      const submitData = formData instanceof FormData ? 
        Object.fromEntries(formData.entries()) : formData;
      
      const result = await updatePublicacionService(id, submitData);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Error al actualizar la publicación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePublicacion = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await deletePublicacionService(id);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Error al eliminar la publicación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createPublicacion,
    updatePublicacion,
    deletePublicacion,
    loading,
    error,
    clearError
  };
};

export default usePublicacionActions;
