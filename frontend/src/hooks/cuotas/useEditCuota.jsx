import { useState } from "react";
import { updateCuota } from "../../services/cuotas.service";
import { result } from "lodash";

export default function useUpdateCuota() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const editarCuota = async (idCuota, data, onSuccess) => {
        console.log("editCuota llamado con: ", { idCuota, data, onSuccess });

        if (!idCuota) {
            console.error("ID de cuota no válido: ", idCuota);
            throw new Error("ID de cuota no válido.");
        }

        const esPagoAutomatico = onSuccess === null;

        if (!esPagoAutomatico) {
            const confirmado = window.confirm("¿Estás seguro de guardar los cambios?");
            if (!confirmado) return;

        }

        try {
            setLoading(true);

            console.log("Llamando a updateCuota con ID:", idCuota, "y datos:", data);

            const resultado = await updateCuota(idCuota, data);
            console.log("Resultado de updateCuota:", resultado);

            setLoading(false);

            const mensaje = esPagoAutomatico ? "Cuota marcada como pagada" : "Cuota actualizada";
            alert(mensaje);

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                    if (typeof window != "undefined") {
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    }
                }, 100);
            }
            return resultado;
        } catch (error) {
            console.error("Error al editar cuota; ", error);
            setError("Error al editar la cuota");
            setLoading(false);
            throw error;
        }
    };

    return {
        editarCuota,
        loading,
        error,
    };
}