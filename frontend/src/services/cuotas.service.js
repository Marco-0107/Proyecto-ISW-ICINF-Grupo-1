import axios from "./root.service";

export const getCuota = async () => {
    try {
        const response = await axios.get('/cuotas');
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export async function createCuota(cuotaData){
    try{
        const response = await axios.post('/cuotas', cuotaData);
        return response.data;
    } catch(error) {
        console.error("Error al crear la cuota", error);
        throw error;
    }
}
