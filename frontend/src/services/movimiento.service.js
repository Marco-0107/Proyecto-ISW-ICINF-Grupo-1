import axios from './root.service.js';

export async function getMovimientos() {
    try {
        const response = await axios.get('/movimiento', {
            headers: {
                'Cache-control': 'no-cache',
            },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener movimientos:", error);
        throw error;
    }
}

export async function createMovimiento(movimientoData) {
    try {
        const response = await axios.post('/movimiento', movimientoData);
        return response.data;
    } catch (error) {
        console.error("Error al crear movimiento", error);
        throw error;
    }
}

export const updateMovimiento = async (id_movimiento, payload) => {
    try {
        const response = await axios.patch(`/movimiento/detail/?`, payload, {
            params: { id_movimiento }
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteMovimiento = async (id_movimiento) => {
    try {
        const response = await axios.delete(`/movimiento/detail/?`, {
            params: { id_movimiento },
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}
