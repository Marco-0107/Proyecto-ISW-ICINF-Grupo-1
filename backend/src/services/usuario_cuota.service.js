import UsuarioCuota from "../entity/usuario_cuota.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Obtengo registro de cuota asignada a un usuario
export async function getUsuarioCuotaService({ id, id_cuota }) {
    try {
        const UcRepository = AppDataSource.getRepository(UsuarioCuota);

        const registroFound = await UcRepository.findOneBy({ id, id_cuota });

        if (!registroFound) return [null, "El usuario no tiene esta cuota asignada"];

        return [registroFound, null];

    } catch (error) {
        console.error("Error al obtener las cuotas del usuario", error);
        return [null, "Error interno del servidor"];
    }
}
// Actualiza el estado de pago de una cuota asignada
export async function actualizarEstadoPagoCuotaService({ id, id_cuota, estado_pago }) {
    try {
        const UcRepository = AppDataSource.getRepository(UsuarioCuota);

        const registroFound = await UcRepository.findOneBy({ id, id_cuota });

        if (!registroFound) return [null, "No se encontró el registro de cuota para este usuario"];

        registroFound.estado_pago = estado_pago;

        const actualizado = await UcRepository.save(registroFound);

        return [actualizado, null];

    } catch (error) {
        console.error("Error al actualizar el estado del pago", error);
        return [null, "Error interno del servidor"];
    }
}