import axios from './root.service';

/**
 * Obtiene todas las convocatorias
 * @returns {Promise} Lista de convocatorias
 */
export const getConvocatorias = async () => {
  try {
    const response = await axios.get('/convocatoria');
    console.log('Respuesta del servidor:', response);
    
    // Manejar respuesta 204 (No Content) cuando no hay convocatorias
    if (response.status === 204) {
      console.log('No hay convocatorias (204), retornando array vacío');
      return [];
    }
    
    const { data } = response;
    
    // Manejar diferentes estructuras de respuesta
    if (data?.data) {
      return Array.isArray(data.data) ? data.data : [];
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener convocatorias:', error);
    
    // Si es un 404, no hay convocatorias, retornar array vacío
    if (error.response?.status === 404) {
      console.log('No se encontraron convocatorias (404), retornando array vacío');
      return [];
    }
    
    throw error;
  }
};

/**
 * Obtiene una convocatoria por ID
 * @param {number} id_convocatoria - ID de la convocatoria
 * @returns {Promise} Datos de la convocatoria
 */
export const getConvocatoria = async (id_convocatoria) => {
  try {
    const { data } = await axios.get(`/convocatoria/detail/?id_convocatoria=${id_convocatoria}`);
    console.log('Detalle de convocatoria:', data);
    
    if (data?.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener convocatoria:', error);
    throw error;
  }
};

/**
 * Crea una nueva convocatoria
 * @param {Object} convocatoriaData - Datos de la convocatoria
 * @returns {Promise} Convocatoria creada
 */
export const createConvocatoria = async (convocatoriaData) => {
  try {
    console.log('Enviando datos para crear convocatoria:', convocatoriaData);
    const { data } = await axios.post('/convocatoria', convocatoriaData);
    console.log('Convocatoria creada:', data);
    
    if (data?.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error al crear convocatoria:', error);
    
    // Mejorar el mensaje de error
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * Actualiza una convocatoria
 * @param {number} id_convocatoria - ID de la convocatoria
 * @param {Object} convocatoriaData - Datos actualizados
 * @returns {Promise} Convocatoria actualizada
 */
export const updateConvocatoria = async (id_convocatoria, convocatoriaData) => {
  try {
    const { data } = await axios.patch(`/convocatoria/detail/?id_convocatoria=${id_convocatoria}`, convocatoriaData);
    return data.data;
  } catch (error) {
    console.error('Error al actualizar convocatoria:', error);
    throw error;
  }
};

/**
 * Elimina una convocatoria
 * @param {number} id_convocatoria - ID de la convocatoria
 * @returns {Promise} Respuesta de eliminación
 */
export const deleteConvocatoria = async (id_convocatoria) => {
  try {
    const { data } = await axios.delete(`/convocatoria/detail/?id_convocatoria=${id_convocatoria}`);
    return data.data;
  } catch (error) {
    console.error('Error al eliminar convocatoria:', error);
    throw error;
  }
};

// Servicios para gestión de postulaciones (usuario_convocatoria)

/**
 * Inscribe un usuario en una convocatoria
 * @param {Object} inscripcionData - Datos de inscripción {id, id_convocatoria}
 * @returns {Promise} Inscripción creada
 */
export const inscribirUsuario = async (inscripcionData) => {
  try {
    const { data } = await axios.post('/usuario-convocatoria', inscripcionData);
    return data.data;
  } catch (error) {
    console.error('Error al inscribir usuario:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario está inscrito en una convocatoria
 * @param {number} id - ID del usuario
 * @param {number} id_convocatoria - ID de la convocatoria
 * @returns {Promise} Estado de inscripción
 */
export const getInscripcionUsuario = async (id, id_convocatoria) => {
  try {
    const { data } = await axios.get(`/usuario-convocatoria/detail/?id=${id}&id_convocatoria=${id_convocatoria}`);
    return data.data;
  } catch (error) {
    // Si no existe la inscripción, el error 404 es esperado
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error al verificar inscripción:', error);
    throw error;
  }
};

/**
 * Elimina la inscripción de un usuario
 * @param {number} id - ID del usuario
 * @param {number} id_convocatoria - ID de la convocatoria
 * @returns {Promise} Respuesta de eliminación
 */
export const eliminarInscripcion = async (id, id_convocatoria) => {
  try {
    const { data } = await axios.delete(`/usuario-convocatoria/detail/?id=${id}&id_convocatoria=${id_convocatoria}`);
    return data.data;
  } catch (error) {
    console.error('Error al eliminar inscripción:', error);
    throw error;
  }
};
