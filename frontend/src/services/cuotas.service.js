import { get } from "lodash";
import axios from "./root.service";

export const getCuota = async () => {
    try {
        const response = await axios.get('/cuotas');
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getCuotasUsuarioByRut = async (rut) => {
    try {
        const response = await axios.get(`/usuario-cuota/by-rut?rut=${rut}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getCuotasUsuario = async (userID) => {
    try {
        const response = await axios.get(`/usuario-cuota?id=${userID}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export async function createCuota(cuotaData) {
    try {
        const response = await axios.post('/cuotas', cuotaData);
        return response.data;
    } catch (error) {
        console.error("Error al crear la cuota", error);
        throw error;
    }
}

export const deleteCuota = async (id_cuota) => {
    try {
        const response = await axios.delete(`/cuotas/detail/?`, {
            params: { id_cuota },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error al eliminar la cuota", error);
        throw error.response?.data || error;
    }
};

export const updateCuota = async (id, updateData) => {
    console.log("updateCuota service llamado con:", { id, updateData });

    if (!id) {
        throw new Error("ID de cuota es requerido");
    }

    try {
        const response = await axios.patch(`/cuotas/`, updateData, {
            params: {id_cuota: id }
        });
        console.log("Respuesta del servidor:", response.data);
        return response.data.data;
    } catch (error) {
        console.error("Error en updateCuota service:", error);
        throw error.response?.data || error;
    }
}
