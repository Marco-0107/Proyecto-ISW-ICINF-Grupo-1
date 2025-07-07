import axios from './root.service.js';

// Obtener todas las publicaciones
export async function getPublicaciones() {
  try {
    const response = await axios.get('/publicacion');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener las publicaciones:', error);
    return [];
  }
}

// Obtener una publicacion
export async function getPublicacionById(id_publicacion) {
  try {
    const { data } = await axios.get('/publicacion/detail/', {
      params: { id_publicacion }
    });
    return data.data;
  } catch (error) {
    console.error('Error al obtener publicacion por id:', error);
    throw error;
  }
}

// Crear una nueva publicación
export async function createPublicacion(publicacionData) {
  try {
    const response = await axios.post('/publicacion', publicacionData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Actualizar una publicación existente
export const updatePublicacion = async (id_publicacion , payload) => {
  try {
    const response = await axios.patch(`/publicacion/detail/?`,payload, {
     params: { id_publicacion  }
  });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Eliminar una reunión
export const deletePublicacion = async (id_publicacion) => {
  try {
    const response = await axios.delete(`/publicacion/detail/?`, { 
     params: { id_publicacion },
  });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}