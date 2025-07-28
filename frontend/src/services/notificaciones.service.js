import axios from './root.service.js';

// Obtener todas las notificaciones
export async function getNotificaciones() {
  try {
    console.log('🔍 Iniciando petición para obtener notificaciones...');
    const response = await axios.get('/notificacion');
    console.log('✅ Respuesta del servidor:', response);
    console.log('📄 Data recibida:', response.data);
    
    if (response.data && response.data.data) {
      console.log('📋 Notificaciones encontradas:', response.data.data.length);
      return response.data.data;
    } else {
      console.log('⚠️ No se encontró data en la respuesta');
      return [];
    }
  } catch (error) {
    console.error('❌ Error al obtener las notificaciones:', error);
    console.error('📊 Status:', error.response?.status);
    console.error('📝 Mensaje:', error.response?.data);
    console.error('🔗 URL:', error.config?.url);
    return [];
  }
}

// Obtener una notificación por ID
export async function getNotificacionById(id_notificacion) {
  try {
    const response = await axios.get(`/notificacion/detail/?id_notificacion=${id_notificacion}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener la notificación:', error);
    throw error.response?.data || error;
  }
}

// Crear una nueva notificación
export async function createNotificacion(notificacionData) {
  try {
    const response = await axios.post('/notificacion', notificacionData);
    return response.data.data;
  } catch (error) {
    console.error('Error al crear la notificación:', error);
    throw error.response?.data || error;
  }
}

// Actualizar una notificación existente
export const updateNotificacion = async (id_notificacion, payload) => {
  try {
    const response = await axios.patch(`/notificacion/detail/?id_notificacion=${id_notificacion}`, payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Eliminar una notificación
export const deleteNotificacion = async (id_notificacion) => {
  try {
    const response = await axios.delete(`/notificacion/detail/?id_notificacion=${id_notificacion}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Marcar una notificación como leída
export const markNotificacionAsRead = async (id_notificacion) => {
  try {
    const response = await axios.patch(`/notificacion/detail/?id_notificacion=${id_notificacion}`, {
      estado_visualizacion: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error.response?.data || error;
  }
}