"use strict"

import {
   getReunionService,
   getReunionesService,
   updateReunionService,
   deleteReunionService,
   createReunionService,
   registrarAsistenciaService,
} from "../services/reunion.service.js";

import {
    reunionBodyValidation,
    reunionQueryValidation,
} from "../services/reunion.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

// Obtengo reunion por id o titulo

export async function getReunion(req, res) {
    try {
        const { id_reunion } = req.query;

        const { error } = reunionQueryValidation.validate({ id_reunion });
        if (error) return handleErrorClient(res, 400, error.message);

        const [reunion, errorReunion] = await getReunionService ({ id_reunion });
        if (errorReunion) return handleErrorClient(res, 404, errorReunion);
        
        handleSuccess(res, 200, "Reunión encontrada", reunion);
        
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Listo todas las reuniones
 export async function getReuniones (req, res) {
    try {
        const [reuniones, errorReuniones] = await getReunionesService();
        if(errorReuniones) return handleErrorClient(res, 404, errorReuniones)

        reuniones.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Reuniones encontradas", reuniones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las reuniones
export async function updateReunion(req, res) {
    try{
        const { id_reunion } = req.query;
        const { body } = req;

        const { error: queryError } = reunionQueryValidation.validate({ id_reunion });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = reunionBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [reunion, errorUpdateReunion] = await updateReunionService({ id_reunion }, body);
        if (errorUpdateReunion) return handleErrorClient(res, 400, "Error actualizando reunión", errorUpdateReunion);

        handleSuccess(res, 200, "Reunión actualizada", reunion);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una reunion
export async function deleteReunion(req, res) {
    try{
        const { id_reunion } = req.query;

        const { error } = reunionQueryValidation.validate({ id_reunion });
        if (error) return handleErrorClient(res, 400, "Error en consulta", error.message);

        const [reunion, errorDeleteReunion] = await deleteReunionService({ id_reunion });
        if (errorDeleteReunion) return handleErrorClient(res, 400, "Error eliminando la reunión", errorDeleteReunion);

        handleSuccess(res, 200, "Reunión eliminada", reunion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear una Reunion
export async function createPublicacion(req, res) {
    try{
        const { body } = req;

        const { error } = reunionBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [reunion, errorCreateReunion] = await createReunionService(body);
        if (errorCreateReunion) return handleErrorClient(res, 404, "Error creando reunión", errorCreateReunion);

        handleSuccess(res, 201, "Reunión creada correctamente", reunion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function registrarAsistencia(req, res) {
    try{
        const { body } = req;

        const { error } = asistenciaBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, error.message);

        const [asistencia, errorAsistencia] = await registrarAsistenciaService(body);
        if (errorAsistencia) return handleErrorClient(res, 400, "Error registrando la asistencia", errorAsistencia);

        handleSuccess(res, 200, "Asistencia registrada correctamente", asistencia);        
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

