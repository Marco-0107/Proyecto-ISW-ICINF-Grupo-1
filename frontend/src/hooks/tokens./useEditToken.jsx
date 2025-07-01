import axios from "@services/root.service";

const useEditToken = (fetchTokens) => {
    const cerrarToken = async (id_token) => {
        try {
            await axios.patch(`/token/detail/?id_token=${id_token}`, {
                estado: "cerrado"
            });
            alert("Token cerrado correctamente");
            fetchTokens(); 
        } catch (error) {
            console.error("Error al cerrar el token:", error);
            alert("No se pudo cerrar el token");
        }
    };

    return { cerrarToken };
};

export default useEditToken;

