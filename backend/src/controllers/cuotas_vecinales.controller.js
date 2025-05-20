"use strict"

import {
    getcuota_vecinalService,
    getcuotas_vecinalesService,
    updatecuotas_vecinalesService,
    deletecuotas_vecinalesService,
    createcuotas_vecinalesService,
} from "../services/cuotas_vecinales.service.js";

import {
    cuotas_vecinalesBodyValidation,
    cuotas_vecinalesQueryValidation,
} from "../services/cuotas_vecinales.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
// Obtengo Cuotas_vecinales por id o titulo
export async function getCuotaVecinal(req, res) {
    try {
        const { id_cuota } = req.query;

        const { error } = cuotas_vecinalesQueryValidation.validate({ id_cuota });
        if (error) return handleErrorClient(res, 400, error.message);

        const [cuota, errorCuota] = await getcuota_vecinalService({ id_cuota });
        if (errorCuota) return handleErrorClient(res, 404, errorCuota);

        handleSuccess(res, 200, "Cuota vecinal encontrada", cuota);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
 }
// Listo todas las cuotas 
 export async function getCuotasVecinales (req, res) {
    try {
        const [cuotas, errorCuotas] = await getcuotas_vecinalesService();
        if(errorCuotas) return handleErrorClient(res, 404, errorCuotas)

        publicaciones.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Cuotas encontradas", cuotas);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las cuotas
export async function updateCuotaVecinal(req, res) {
    try{
        const { id_cuota } = req.query;
        const { body } = req;

        const { error: queryError } = cuotas_vecinalesQueryValidation.validate({ id_cuota });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = cuotas_vecinalesBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [cuota, errorCuota] = await updatecuotas_vecinalesService({ id_cuota }, body);
        if (errorCuota) return handleErrorClient(res, 400, "Error actualizando la Cuota", errorCuota);

        handleSuccess(res, 200, "Cuota actualizada", cuota);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una Cuota
export async function deleteCuotaVecinal(req, res) {
    try{
        const { id_cuota } = req.query;

        const { error } = cuotas_vecinalesQueryValidation.validate({ id_cuota });
        if (error) return handleErrorClient(res, 400, "Errror en consulta", error.message);

        const [cuota, errorCuota] = await deletecuotas_vecinalesService({ id_cuota });
        if (errorCuota) return handleErrorClient(res, 400, "Error eliminando la Cuota", errorCuota);

        handleSuccess(res, 200, "Cuota eliminada", cuota);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear una uota
export async function createCuotaVecinal(req, res) {
    try{
        const { body } = req;

        const { error } = cuotas_vecinalesBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [cuota, errorCuota] = await createcuotas_vecinalesService(body);
        if (errorCuota) return handleErrorClient(res, 404, "Error creando Cuota", errorCuota);

        handleSuccess(res, 201, "Cuota creada correctamente", cuota);
    } catch {
        handleErrorServer(res, 500, error.message);
    }
}