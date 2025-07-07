import axios from './root.service';

// Obtener todos los tokens
export const getTokens = async () => {
    const response = await axios.get('/token');
    return response.data.data;
};

// Cambiar estado del token a cerrado
export const cerrarToken = async (id_token) => {
    const response = await axios.patch(`/token/detail/${id_token}`);
    return response.data.data;
};

// Crear Token
export const createToken = async (id, id_reunion) => {
    const response = await axios.post('/token', { id, id_reunion });
    return response.data.data; 
};


