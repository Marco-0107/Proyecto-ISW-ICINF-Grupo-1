"use strict"

import {
    getconvocatoriaService,
    getconvocatoriasService,
    updateconvocatoriaService,
    deleteconvocatoriaService,
    createconvocatoriaService,
} from "../services/convocatoria.service.js";

import {
    convocatoriaBodyValidation,
    convocatoriaQueryValidation,
} from "../services/convocatoria.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
// Obtengo Convocatoria por id o titulo
export async function getConvocatoria(req, res) {
    try {
        const { id_convocatoria } = req.query;

        const { error } = convocatoriaQueryValidation.validate({ id_convocatoria});
        if (error) return handleErrorClient(res, 400, error.message);

        const [convocatoria, errorConvocatoria] = await getconvocatoriaService({ id_convocatoria });
        if (errorConvocatoria) return handleErrorClient(res, 404, errorConvocatoria);

        handleSuccess(res, 200, "Convocatoria encontrada", convocatoria);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
 }
// Listo todas las convocatorias 
 export async function getConvocatorias (req, res) {
    try {
        const [convocatorias, errorConvocatorias] = await getconvocatoriasService();
        if(errorConvocatorias) return handleErrorClient(res, 404, errorConvocatorias)

        convocatorias.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Convocatorias encontradas", convocatorias);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las convocatorias
export async function updateConvocatorias(req, res) {
    try{
        const { id_convocatoria} = req.query;
        const { body } = req;

        const { error: queryError } = convocatoriaQueryValidation.validate({ id_convocatoria });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = convocatoriaBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [convocatoria, errorUpdateConvocatoria] = await updateconvocatoriaService({ id_convocatoria }, body);
        if (errorUpdateConvocatoria) return handleErrorClient(res, 400, "Error actualizando la Convocatoria", errorUpdateConvocatoria);

        handleSuccess(res, 200, "Convocatoria actualizada", convocatoria);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una Cuota
export async function deleteConvocatoria(req, res) {
    try{
        const { id_convocatoria } = req.query;

        const { error } = convocatoriaQueryValidation.validate({ id_convocatoria });
        if (error) return handleErrorClient(res, 400, "Errror en consulta", error.message);

        const [convocatoria, errorDeleteConvocatoria] = await deleteconvocatoriaService({ id_convocatoria });
        if (errorDeleteConvocatoria) return handleErrorClient(res, 400, "Error eliminando la Convocatoria", errorDeleteConvocatoria);

        handleSuccess(res, 200, "Convocatoria eliminada", convocatoria);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear una Convocatoria
export async function createConvocatoria(req, res) {
    try{
        const { body } = req;

        const { error } = convocatoriaBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [convocatoria, errorCreateConvocatoria] = await createconvocatoriaService(body);
        if (errorCreateConvocatoria) return handleErrorClient(res, 404, "Error creando Convocatoria", errorCreateConvocatoria);

        handleSuccess(res, 201, "Convocatoria creada correctamente", convocatoria);
    } catch {
        handleErrorServer(res, 500, error.message);
    }
}