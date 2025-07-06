"use strict";
import {
    getUsuariosReunionService,
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

//Obtengo todos los usuarios asociados a una reunión.

export async function getUsuariosReunion(req, res) {
  try {
    const { id_reunion } = req.query;
    if (!id_reunion) {
      return handleErrorClient(res, 400, "Debe especificar id_reunion");
    }

    const [registros, errorUsuarios] = await getUsuariosReunionService({ id_reunion });
    if (errorUsuarios) {
      return handleErrorClient(res, 404, errorUsuarios);
    }

    return handleSuccess(res, 200, "Usuarios de la reunión obtenidos", registros);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

// Obtengo registro de un usuario en una reunión
export async function getUsuarioReunion(req, res) {
    try {
        const { id_usuario, id_reunion } = req.query;

        const { error } = usuarioReunionQueryValidation.validate({ id_usuario, id_reunion });

        if (error) return handleErrorClient(res, 400, error.message);

        const [registro, errorUsuarioReunion] = await getUsuarioReunionService({ id_usuario, id_reunion });

        if (errorUsuarioReunion) return handleErrorClient(res, 404, errorUsuarioReunion);

        handleSuccess(res, 200, "Registro de Usuario en reunion encontrado", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Marca asistencia manualmente (usado por presidenta si es necesario)
export async function marcarAsistenciaManual(req, res) {
    try {
        const { id_usuario, id_reunion } = req.query;

        const [registro, errorAsistenciaManual] = await marcarAsistenciaManualService({ id_usuario, id_reunion });

        if (errorAsistenciaManual) return handleErrorClient(res, 400, errorAsistenciaManual);

        handleSuccess(res, 200, "Asistencia marcada manualmente", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function registrarAsistencia(req, res) {
    try {
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