"use strict";
import MovimientoFinanciero from "../entity/movimiento_financiero.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Obtengo movimiento por id o titulo
export async function getMovimientoFinancieroService(query) {
    try {
        const { id_movimiento } = query;

        const mfRepository = AppDataSource.getRepository(MovimientoFinanciero);

        const movFound = await mfRepository.findOne({
        where: [{ id_movimiento: id_movimiento }],
        });

        if (!movFound) return [null, "Movimiento no encontrado"];

        return [movFound, null];
    } catch (error) {U
        console.error("Error al obtener el movimiento:", error);
        return [null, "Error interno del servidor"];
    }
}
// Obtengo lista de movimientos
export async function getMovimientosFinancierosService() {
    try {
        const mfRepository = AppDataSource.getRepository(MovimientoFinanciero);

        const movimientos = await mfRepository.find();

        if (!movimientos || movimientos.length === 0) return [null, "No hay movimientos"];

        return [movimientos, null];
    }catch (error) {
    console.error("Error al obtener los movimientos:", error);
    return [null, "Error interno del servidor"];
    }
}
// Modifico datos de los movimientos
export async function updateMovimientoFinancieroService(query, body) {
  try {
        const { id_movimiento } = query;

        const mfRepository = AppDataSource.getRepository(MovimientoFinanciero);

        const movimiento = await mfRepository.findOne({
        where: { id_movimiento }
        });

    if (!movimiento) return [null, "Movimiento no encontrado"];

        const dataUpdate = {
            monto: body.monto,
            descripcion: body.descripcion,
            fecha_movimiento: body.fecha_movimiento,
            tipo_transaccion: body.tipo_transaccion,
            fechaActualizacion: new Date(),
        };
    
    await mfRepository.update({ id_movimiento }, dataUpdate);

    const updatedMovimiento = await mfRepository.findOne({
        where: { id_movimiento },
    });

    if (!updatedMovimiento)
        return [null, "Movimiento no econtrado despúes de actualizar"];

    return [updatedMovimiento, null];
    } catch (error){
    console.error("Error al actualizar el movimiento:", error);
    return [null, "Error interno del servidor"];
    }
}
// Elimino Movimientos
export async function deleteMovimientoFinancieroService(query) {
  try {
    const { id_movimiento } = query;

    const mfRepository = AppDataSource.getRepository(MovimientoFinanciero);

    const movFound = await mfRepository.findOne({
      where: { id_movimiento: id_movimiento }
    });

    if (!movFound) return [null, "Movimiento no encontrado"];

    const deletedMov = await mfRepository.remove(movFound);

    return [deletedMov, null];
    } catch (error) {
    console.error("Error al eliminar el Movimiento:", error);
    return [null, "Error interno del servidor"];
  }
}
// Creo Movimiento
export async function createMovimientoFinancieroService(body) {
    try{
        const mfRepository = AppDataSource.getRepository(MovimientoFinanciero);

        const newMovimiento = mfRepository.create ({
            monto: body.monto,
            descripcion: body.descripcion,
            fecha_movimiento: body.fecha_movimiento,
            tipo_transaccion: body.tipo_transaccion,
            fechaActualizacion: new Date(),
        });

        await mfRepository.save(newMovimiento);

        return [newMovimiento, null];
    } catch(error) {
        console.error("Error al crear el Movimiento:", error);
        return [null, "Error interno del servidor:"];
    }
}

