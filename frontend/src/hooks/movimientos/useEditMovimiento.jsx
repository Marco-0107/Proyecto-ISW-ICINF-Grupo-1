import { useState } from "react";
import { updateMovimiento } from "../../services/movimiento.service";

export default function useUpdateMovimiento() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const editarMovimiento = async (id_movimiento, data, onSucces) => {
        const confirmado = window.confirm("¿Estás seguro de guardar los cambios?");
        if (!confirmado) return;

        try {
            setLoading(true);
            await updateMovimiento(id_movimiento, data);
            setLoading(false);

            alert("Movimiento actualizado correctamente");

            if (onSucces) {
                setTimeout(() => {
                    onSucces();
                    if (typeof window !== "undefined") {
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Error al editar reunión:", error);
            setError("Error al editar la reunión");
            setLoading(false);
        }
    };

    return {
        editarMovimiento,
        loading,
        error,
    };
}