"use strict";
import {
  getUsuarioReunionService,
  marcarAsistenciaManualService,
  registrarAsistenciaService
} from "../services/usuario_reunion.service.js";

import {
  usuarioReunionQueryValidation,
  usuarioReunionBodyValidation,
} from "../validations/usuario_reunion.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

// Obtengo registro de un usuario en una reunión
export async function getUsuarioReunion(req, res) {
    try {
        const { id, id_reunion } = req.query;

        const { error } = usuarioReunionQueryValidation.validate({ id, id_reunion });

        if (error) return handleErrorClient(res, 400, error.message);

        const [registro, errorUsuarioReunion] = await getUsuarioReunionService({ id, id_reunion });

        if (errorUsuarioReunion) return handleErrorClient(res, 404, errorUsuarioReunion);

        handleSuccess(res, 200, "Registro de Usuario en reunion encontrado", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Marca asistencia manualmente (usado por presidenta si es necesario)
export async function marcarAsistenciaManual(req, res) {
    try {
        const { id, id_reunion } = req.query;

        const [registro, errorAsistenciaManual] = await marcarAsistenciaManualService({ id, id_reunion });
        
        if (errorAsistenciaManual) return handleErrorClient(res, 400, error);

        handleSuccess(res, 200, "Asistencia marcada manualmente", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function registrarAsistencia(req, res) {
    try{
        const { body } = req;

        const { error } = usuarioReunionBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, error.message);

        const [asistencia, errorAsistencia] = await registrarAsistenciaService(body);
        if (errorAsistencia) return handleErrorClient(res, 400, "Error registrando la asistencia", errorAsistencia);

        handleSuccess(res, 200, "Asistencia registrada correctamente", asistencia);        
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}