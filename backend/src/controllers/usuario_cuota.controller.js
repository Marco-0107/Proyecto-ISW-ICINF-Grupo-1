"use strict";
import {
  getUsuarioCuotaService,
  actualizarEstadoPagoCuotaService,
} from "../services/usuario_cuota.service.js";

import {
  usuarioCuotaQueryValidation,
  usuarioCuotaBodyValidation,
} from "../validations/usuario_cuota.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

// Obtengo registro de un usuario y sus cuotas
export async function getUsuarioCuota(req, res) {
    try {
        const { id, id_cuota } = req.query;

        const { error } = usuarioCuotaQueryValidation.validate({ id, id_cuota });

        if (error) return handleErrorClient(res, 400, error.message);

        const [registro, errorUC] = await getUsuarioCuotaService({ id, id_cuota });

        if (errorUC) return handleErrorClient(res, 404, errorUC);

        handleSuccess(res, 200, "Registro de cuotas encontrado", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Actualiza el estado de pago de una cuota para un usuario
export async function actualizarEstadoPagoCuota(req, res) {
    try {
        const { estado_pago } = req.body;

        const { error: queryError } = usuarioCuotaQueryValidation.validate({ id, id_cuota });

        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = usuarioCuotaBodyValidation.validate({ estado_pago });

        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);

        const [registro, errorUpdateUC] = await actualizarEstadoPagoCuotaService({ id, id_cuota, estado_pago });

        if (errorUpdateUC) return handleErrorClient(res, 400, "Error actualizando Estado de pago", errorUpdateUC);

        handleSuccess(res, 200, "Estado de pago actualizado correctamente", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}