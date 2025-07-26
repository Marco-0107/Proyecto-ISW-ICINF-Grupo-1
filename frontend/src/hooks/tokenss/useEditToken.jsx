import axios from "@services/root.service";

const useEditToken = () => {
    const cerrarToken = async (id_token) => {
        try {
            await axios.patch(`/token/detail/?id_token=${id_token}`, {
                estado: "cerrado"
            });
            return { success: true, message: "Token cerrado correctamente" };
        } catch (error) {
            return { success: false, message: "No se pudo cerrar el token" };
        }
    };

    return { cerrarToken };
};

export default useEditToken;

