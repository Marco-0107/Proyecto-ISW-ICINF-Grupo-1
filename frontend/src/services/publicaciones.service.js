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
    console.log('📤 Servicio: Enviando datos para crear publicación:', publicacionData);
    
    // Usar la misma lógica que en Home.jsx - enviar directamente el objeto
    const response = await axios.post('/publicacion', publicacionData);
    console.log('Publicación creada exitosamente:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error detallado al crear publicación:', error.response?.data);
    throw error.response?.data || error;
  }
}

// Actualizar una publicación existente
export const updatePublicacion = async (id_publicacion , payload) => {
  try {
    console.log('Servicio: Actualizando publicación:', id_publicacion, payload);
    
    // Verificar que es FormData
    if (!(payload instanceof FormData)) {
      console.error('Los datos no son FormData:', payload);
      throw new Error('Los datos deben ser FormData');
    }
    
    // Debug: Mostrar el contenido del FormData
    console.log('📋 Contenido del FormData para actualización:');
    for (let [key, value] of payload.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }
    
    // NO establecer Content-Type manualmente para FormData
    const config = {
      params: { id_publicacion }
    };
    
    const response = await axios.patch(`/publicacion/detail/?`, payload, config);
    console.log('✅ Publicación actualizada exitosamente:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error detallado al actualizar publicación:', error.response?.data);
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