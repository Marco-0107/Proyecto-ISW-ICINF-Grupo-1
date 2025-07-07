import { useState } from "react";
import { deleteMovimiento } from "../../services/movimiento.service";

export default function useDeleteMovimiento() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const eliminarMovimiento = async (id, onSuccess) => {
        const confirmado = window.confirm("¿Estás seguro que deseas eliminar este movimiento?");
        if (!confirmado) return;

        try {
            setLoading(true);
            await deleteMovimiento(id);
            setLoading(false);

            alert("Movimiento eliminado correctamente");

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();

                    if (typeof windows != "undefined") {
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Error al eliminar el movimiento:", error);
            setError("Error al eliminar el movimiento");
            setLoading(false);
        }
    };
    return {
        eliminarMovimiento,
        loading,
        error,
    };

}