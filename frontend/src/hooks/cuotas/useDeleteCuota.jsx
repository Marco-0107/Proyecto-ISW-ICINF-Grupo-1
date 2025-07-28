import { useState } from "react";
import { deleteCuota } from "../../services/cuotas.service";
import { deleteDataAlert, showErrorAlert } from "../../helpers/sweetAlert";

export default function useDeleteCuota(fetchCuotas, setCuotas) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const eliminarCuota = async (idCuota, onSucces) => {
        try {
            const result = await deleteDataAlert();
            if (result.isConfirmed) {
                setLoading(true);
                await deleteCuota(idCuota);
                setLoading(false);
                if (onSucces) {
                    setTimeout(() => {
                        onSucces();

                        if (typeof window != "undefined") {
                            setTimeout(() => {
                                window.location.reload();
                            }, 100);
                        }
                    }, 100);
                }
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

