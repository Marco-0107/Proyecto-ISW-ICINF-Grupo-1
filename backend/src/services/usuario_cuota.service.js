import UsuarioCuota from "../entity/usuario_cuota.entity.js";
import Cuota from "../entity/cuotas_vecinales.entity.js"
import MovimientoFinanciero from "../entity/movimiento_financiero.entity.js";
import Usuario from "../entity/user.entity.js"
import { AppDataSource } from "../config/configDb.js";
import { CustomRepositoryDoesNotHaveEntityError } from "typeorm";

// Obtener todas las cuotas asignadas a un usuario especifico por RUT
export async function getCuotasUsuarioByRutService({ rut }) {
    try {
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const UcRepository = AppDataSource.getRepository(UsuarioCuota);

        //Primero se busca el usuario por RUT para obtener su ID
        const usuario = await usuarioRepository.findOne({
            where: { rut: rut }
        });

        if (!usuario) {
            return [null, "Usuario no encontrado."];
        }

        //Ahora buscar las cuotas del usuario usando su ID
        const cuotasUsuario = await UcRepository.find({
            where: { id: usuario.id },
            relations: ["cuota"],
        });

        if (!cuotasUsuario || cuotasUsuario.length === 0) {
            return [[], "El usuario no tiene cuotas asignadas"];
        }

        // Formatear los datos para que incluyan la información de la cuota
        const cuotasFormateadas = cuotasUsuario.map(usuarioCuota => ({
            id_cuota: usuarioCuota.cuota.id_cuota,
            fecha_emision: usuarioCuota.cuota.fecha_emision,
            fechaActualizacion: usuarioCuota.cuota.fechaActualizacion,
            monto_c: usuarioCuota.cuota.monto_c,
            estado_pago: usuarioCuota.estado_pago,
            estado: usuarioCuota.estado_pago === "true" ? "Pagada" : "Pendiente"
        }));

        return [cuotasFormateadas, null];

    } catch (error) {
        console.error("Error al obtener las cuotas del usuario por RUT", error);
        return [null, "Error interno del servidor"];
    }
}

// Obtener todas las cuotas asignadas a un usuario especifico
export async function getCuotasUsuarioService({ id }) {
    try {
        const UcRepository = AppDataSource.getRepository(UsuarioCuota);
        const cuotasUsuario = await UcRepository.find({
            where: { id },
            relations: ["cuota"]
        });

        if (!cuotasUsuario || cuotasUsuario.length === 0) {
            return [[], "El usuario no tiene cuotas asignadas"];
        }

        //Formatear los datos para que incluyan informacion de la cuota
        const cuotasFormateadas = cuotasUsuario.map(usuarioCuota => ({
            id_cuota: usuarioCuota.cuota.id_cuota,
            fecha_emision: usuarioCuota.cuota.fecha_emision,
            fechaActualizacion: usuarioCuota.cuota.fechaActualizacion,
            monto_c: usuarioCuota.cuota.monto_c,
            estado_pago: usuarioCuota.estado_pago,
            estado: usuarioCuota.estado_pago === "true" ? "Pagada" : "Pendiente"
        }));

        return [cuotasFormateadas, null];
    } catch (error) {
        console.error("Error al obtener las cuotas del usuario por RUT", error);
        return [null, "Error interno del servidor"];
    }
}

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
            const cuota = await cuotaRepository.findOneBy({ id_cuota });
            if (!cuota) return [actualizado, "Estado actualizado, pero no se encontro la cuota para generar el movimiento"];

            const newMovimiento = mfRepository.create({
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

//Actualizar estado de la cuota mediante el RUT del vecino.
export async function actualizarEstadoPagoCuotaByRutService({ rut, id_cuota, estado_pago }) {
    try {
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const UcRepository = AppDataSource.getRepository(UsuarioCuota);

        //Buscar el usuario por RUT para obtener su ID
        const usuario = await usuarioRepository.findOne({
            where: { rut: rut }
        });

        if (!usuario) {
            return [null, "Usuario no encontrado."];
        }

        //Encontrar la cuota del usuario usando su RUT e id de la cuota
        const cuotaUsuario = await UcRepository.find({
            where: { id: usuario.id },
            relations: ["cuota"],
        });
        const mfRepository = AppDataSource.getRepository(MovimientoFinanciero);

        const registroFound = await UcRepository.findOneBy({ id, id_cuota });
        if (!registroFound) return [null, "No se encontró el registro de cuota para este usuario"];

        registroFound.estado_pago = estado_pago;
        const actualizado = await UcRepository.save(registroFound);

        if (estado_pago = true) {
            const cuota = await cuotaRepository.findOneBy({ id_cuota });
            if (!cuota) return [actualizado, "Estado actualizado, pero no se encontro la cuota para generar el movimiento"];

            const newMovimiento = mfRepository.create({
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
