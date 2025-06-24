import axios from './root.service.js';

// Obtener todas las reuniones
export async function getReuniones() {
  try {
    const response = await axios.get('/reunion');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener reuniones:', error);
    return [];
  }
}

// Crear una nueva reunión
export async function createReunion(reunionData) {
  try {
    const response = await axios.post('/reunion', reunionData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Actualizar una reunión existente
export async function updateReunion(id, reunionData) {
  try {
    const response = await axios.put(`/reunion/${id}`, reunionData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Eliminar una reunión
export const deleteReunion = async (id_reunion) => {
  try {
    const response = await axios.delete(`/reunion/detail/`, { 
     params: { id_reunion },
  });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}
