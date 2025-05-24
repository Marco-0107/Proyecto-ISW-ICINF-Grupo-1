"use strict"

import {
    getUsuarioConvocatoriaService,
    inscribirUsuarioEnConvocatoriaService,
    eliminarInscripcionConvocatoriaService,
} from "../services/usuario_convocatoria.service.js";

import {
    usuarioConvocatoriaQueryValidation,
    usuarioConvocatoriaBodyValidation,
} from "../validations/usuario_convocatoria.validation.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

// Obtiene si un usuario está inscrito en una convocatoria

export async function getUsuarioConvocatoria(req, res) {
    try {
        const { id, id_convocatoria } = req.query;

        const { error } = usuarioConvocatoriaQueryValidation.validate({ id, id_convocatoria });

        if (error) return handleErrorClient(res, 400, error.message);

        const [registro, errorUConv] = await getUsuarioConvocatoriaService({ id, id_convocatoria });

        if (errorUConv) return handleErrorClient(res, 404, errorUConv);

        handleSuccess(res, 200, "Inscripción encontrada", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Inscribe a un usuario en una convocatoria
export async function inscribirUsuarioEnConvocatoria(req, res) {
    try {
        const { error } = usuarioConvocatoriaBodyValidation.validate(req.body);

        if (error) return handleErrorClient(res, 400, error.message);

        const [registro, errorCreateUConv] = await createUsuarioConvocatoriaService(req.body);

        if (errorCreateUConv) return handleErrorClient(res, 400, errorCreateUConv);

        handleSuccess(res, 201, "Usuario inscrito correctamente", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Elimina la inscripción de un usuario en una convocatoria
export async function eliminarInscripcionConvocatoria(req, res) {
    try {
        const { id, id_convocatoria } = req.query; 

        const { error } = usuarioConvocatoriaQueryValidation.validate({ id, id_convocatoria });

        if (error) return handleErrorClient(res, 400, error.message);

        const [eliminado, errorDeleteUConv] = await deleteUsuarioConvocatoriaService({ id, id_convocatoria });
        
        if (errorDeleteUConv) return handleErrorClient(res, 400, errorDeleteUConv);

        handleSuccess(res, 200, "Inscripción eliminada correctamente", eliminado);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}