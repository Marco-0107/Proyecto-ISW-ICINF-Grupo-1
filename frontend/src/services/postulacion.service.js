import axios from './root.service';

/**
 * Crea una nueva postulación con archivos
 * @param {FormData} formData - Datos de la postulación (incluye archivos)
 * @returns {Promise} Postulación creada
 */
export const crearPostulacion = async (formData) => {
  try {
    console.log('Enviando postulación con FormData:', formData);
    
    // Debug: Imprimir contenido del FormData
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    const { data } = await axios.post('/usuario-convocatoria/postular', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Postulación creada:', data);
    
    if (data?.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error al crear postulación:', error);
    console.error('Response data:', error.response?.data);
    console.error('Status:', error.response?.status);
    
    // Mejorar el mensaje de error
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.response?.data?.details) {
      throw new Error(error.response.data.details);
    }
    
    throw error;
  }
};

/**
 * Obtiene las postulaciones de un usuario
 * @param {number} id_usuario - ID del usuario
 * @returns {Promise} Lista de postulaciones
 */
export const getPostulacionesUsuario = async (id_usuario) => {
  try {
    const { data } = await axios.get(`/usuario-convocatoria/usuario/${id_usuario}`);
    
    if (data?.data) {
      return Array.isArray(data.data) ? data.data : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    
    if (error.response?.status === 404) {
      return [];
    }
    
    throw error;
  }
};

/**
 * Obtiene las postulaciones de una convocatoria
 * @param {number} id_convocatoria - ID de la convocatoria
 * @returns {Promise} Lista de postulaciones
 */
export const getPostulacionesConvocatoria = async (id_convocatoria) => {
  try {
    const { data } = await axios.get(`/usuario-convocatoria/convocatoria/${id_convocatoria}`);
    
    if (data?.data) {
      return Array.isArray(data.data) ? data.data : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener postulaciones de convocatoria:', error);
    
    if (error.response?.status === 404) {
      return [];
    }
    
    throw error;
  }
};

/**
 * Descarga un archivo de postulación
 * @param {number} id_archivo - ID del archivo
 * @returns {Promise} Blob del archivo
 */
export const descargarArchivoPostulacion = async (id_archivo) => {
  try {
    const response = await axios.get(`/archivo/download/${id_archivo}`, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw error;
  }
};
