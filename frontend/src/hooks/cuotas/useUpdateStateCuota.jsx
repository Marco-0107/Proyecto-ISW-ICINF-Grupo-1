import { useState } from "react";
import { getCuotasUsuarioByRut, updateCuota } from "../../services/cuotas.service";
import useUpdateCuota from "./useEditCuota";

export default function useMarcarCuotaPagada() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { editarCuota } = useUpdateCuota();

    const marcarCuotaPagada = async (rut) => {
        setLoading(true);
        setError(null);

        try {
            console.log("Buscando cuotas para el rut: ", rut);

            const cuotas = await getCuotasUsuarioByRut(rut);
            console.log("Cuotas encontradas: ", cuotas);

            if (!cuotas || cuotas.length === 0) {
                throw new Error("No se encontraron cuotas para este rut");
            }
            const cuotaPendiente = cuotas.find(cuota => !cuota.estado_pago);

            if (!cuotaPendiente) {
                throw new Error("No se encontraron cuotas pendientes para este rut");
            }

            console.log("Cuota pendiente encontrada: ", cuotaPendiente);
            console.log("ID de cuota a actualizar: ", cuotaPendiente.id_cuota);

            const idVecino = cuotaPendiente.id || cuotaPendiente.usuario_id || cuotaPendiente.vecino_id;
            console.log("ID del vecino:", idVecino);

            if (!cuotaPendiente.id_cuota || !idVecino) {
                throw new Error("Faltan datos necesarios");
            }

            await updateCuota(cuotaPendiente.id_cuota, {
                id: idVecino,
                estado_pago: true
            });

            console.log("Estado de pago actualizado.");

            return {
                success: true,
                cuota: cuotaPendiente,
                message: `Cuota ID ${cuotaPendiente.id_cuota} actualizada.`
            };
        } catch (error) {
            console.error("Error en marcarCuotaPagada: ", error);
            setError(error.message || "Error al procesar la cuota");

            return {
                success: false,
                error: error.message || "Error al procesar la cuota"
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        marcarCuotaPagada,
        loading,
        error
    };
}