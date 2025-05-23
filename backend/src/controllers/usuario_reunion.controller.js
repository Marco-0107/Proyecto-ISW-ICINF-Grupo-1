"use strict";
import {
  getUsuarioReunionService,
  asignarUsuarioAReunionService,
  marcarAsistenciaManualService,
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

// Asigna un usuario a una reunión de manera manual
export async function asignarUsuarioAReunion(req, res) {
    try {
        const { error } = usuarioReunionBodyValidation.validate(req.body);

        if (error) return handleErrorClient(res, 400, error.message);

        const [registro, errorAsignar] = await asignarUsuarioAReunionService(req.body);

        if (errorAsignar) return handleErrorClient(res, 400, errorAsignar);

        handleSuccess(res, 201, "Usuario asignado correctamente", registro);
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