import UsuarioCuota from "../entity/usuario_cuota.entity.js";
import Cuota from "../entity/cuotas_vecinales.entity.js"
import MovimientoFinanciero from "../entity/movimiento_financiero.entity.js";
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
        const cuotaRepository = AppDataSource.getRepository(Cuota);
        const mfRepository = AppDataSource.getRepository(MovimientoFinanciero);

        const registroFound = await UcRepository.findOneBy({ id, id_cuota });
        if (!registroFound) return [null, "No se encontró el registro de cuota para este usuario"];

        registroFound.estado_pago = estado_pago;
        const actualizado = await UcRepository.save(registroFound);
        
        if (estado_pago = true) { 
        const cuota = await cuotaRepository.findOneBy({id_cuota});
        if (!cuota) return [actualizado, "Estado actualizado, pero no se encontro la cuota para generar el movimiento"];

        const newMovimiento = mfRepository.create ({
            monto: cuota.monto_c,
            descripcion: "pago de cuota",
            fecha_movimiento: new Date(),
            tipo_transaccion: "ingreso",
            fechaActualizacion: new Date(),
            id: registroFound.id,
            id_cuota: cuota.id_cuota
        });
        await mfRepository.save(newMovimiento);
    }
    return [actualizado, null];
    } catch (error) {
        console.error("Error al actualizar el estado del pago", error);
        return [null, "Error interno del servidor"];
    }
} 
