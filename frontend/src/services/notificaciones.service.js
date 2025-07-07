import axios from 'axios';

// Obtener todas las notificaciones
export async function getNotificacionesAlertas() {
  try {
    const response = await axios.get('/notificacion');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener las notificaciones:', error);
    return [];
  }
}

// Crear una nueva reunión
export async function createNotificacionAlerta(notificacionData) {
  try {
    const response = await axios.post('/notificacion', notificacionData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Actualizar una notificacion existente
export const updateNotificacionAlerta = async (id_notificacion , payload) => {
  try {
    const response = await axios.patch(`/notificacion/detail/?`,payload, {
     params: { id_notificacion  }
  });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Eliminar una notificacion
export const deleteNotificacionAlerta = async (id_notificacion) => {
  try {
    const response = await axios.delete(`/notificacion/detail/?`, { 
     params: { id_notificacion },
  });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}