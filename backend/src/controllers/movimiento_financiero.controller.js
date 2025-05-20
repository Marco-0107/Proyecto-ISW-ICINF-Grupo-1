"use strict"

import {
    getMovimientoFinancieroService,
    getMovimientosFinancierosService,
    updateMovimientoFinancieroService,
    deleteMovimientoFinancieroService,
    createMovimientoFinancieroService,
} from "../services/movimientos_financieros.service.js";

import {
    movimiento_financieroBodyValidation,
    movimiento_financieroQueryValidation,
} from "../services/movimiento_financiero.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
// Obtengo Movimiento Financiero por ID
export async function getMovimientoFinanciero(req, res) {
    try {
        const { id_movimiento } = req.query;

        const { error } = movimiento_financieroQueryValidation.validate({ id_movimiento});
        if (error) return handleErrorClient(res, 400, error.message);

        const [movimiento, errorMov] = await getMovimientoFinancieroService({ id_movimiento });
        if (errorMov) return handleErrorClient(res, 404, errorMov);

        handleSuccess(res, 200, "Movimiento Financiero encontrada", movimiento);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
 }
// Listo todos los movimientos 
 export async function getMovimientosFinancieros (req, res) {
    try {
        const [movimientos, errorMovs] = await getMovimientosFinancierosService();
        if(errorMovs) return handleErrorClient(res, 404, errorMovs)

        movimientos.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Movimientos Financieros encontradas", movimientos);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar los movimientos
export async function updateMovimientoFinanciero(req, res) {
    try{
        const { id_movimiento} = req.query;
        const { body } = req;

        const { error: queryError } = movimiento_financieroQueryValidation.validate({ id_movimiento });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = movimiento_financieroBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [movimiento, errorMov] = await updateMovimientoFinancieroService({ id_movimiento }, body);
        if (errorMov) return handleErrorClient(res, 400, "Error actualizando el Movimiento", errorMov);

        handleSuccess(res, 200, "Movimiento actualizado", movimiento);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar un Movimiento
export async function deleteMovimientoFinanciero(req, res) {
    try{
        const { id_movimiento } = req.query;

        const { error } = movimiento_financieroQueryValidation.validate({ id_movimiento });
        if (error) return handleErrorClient(res, 400, "Errror en consulat", error.message);

        const [movimiento, errorMov] = await deleteMovimientoFinancieroService({ id_movimiento });
        if (errorMov) return handleErrorClient(res, 400, "Error eliminando el Movimiento", errorMov);

        handleSuccess(res, 200, "Movimiento eliminado", movimiento);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear un Movimiento
export async function createMovimientoFinanciero(req, res) {
    try{
        const { body } = req;

        const { error } = movimiento_financieroBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [movimiento, errorMov] = await createMovimientoFinancieroService(body);
        if (errorMov) return handleErrorClient(res, 404, "Error creando Movimiento", errorMov);

        handleSuccess(res, 201, "Movimiento creado correctamente", movimiento);
    } catch {
        handleErrorServer(res, 500, error.message);
    }
}