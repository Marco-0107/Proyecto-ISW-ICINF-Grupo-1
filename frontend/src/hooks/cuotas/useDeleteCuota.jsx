import { useState } from "react";
import { deleteCuota } from "../../services/cuotas.service";

export default function useDeleteCuota() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const eliminarCuota = async(idCuota, onSucces) => {
        const confirmado = window.confirm("¿Estás seguro de que deseas eliminar esta cuota?");
        if(!confirmado) return;

        try{
            setLoading(true);
            await deleteCuota(idCuota);
            setLoading(false);

            alert("Cuota eliminada correctamente");

            if(onSucces){
                setTimeout(() => {
                    onSucces();

                    if(typeof window != "undefined") {
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Error al eliminar la cuota: ", error);
            setError("Error al eliminar el movimiento");
            setLoading(false);
        }
    };
    return {
        eliminarCuota,
        loading,
        error,
    }
}

