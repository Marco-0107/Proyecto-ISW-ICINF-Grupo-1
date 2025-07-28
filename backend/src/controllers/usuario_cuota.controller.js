"use strict";
import {
  getUsuarioCuotaService,
  actualizarEstadoPagoCuotaService,
  getCuotasUsuarioService,
  getCuotasUsuarioByRutService
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

// Obtener todas las cuotas de un usuario por RUT
export async function getCuotasUsuarioByRut(req, res) {
  try {
    const { rut } = req.query;

    if (!rut) return handleErrorClient(res, 400, "RUT de usuario es requerido");

    const [cuotas, errorCuotas] = await getCuotasUsuarioByRutService({ rut });

    if (errorCuotas) return handleErrorClient(res, 404, errorCuotas);

    handleSuccess(res, 200, "Cuotas del usuario obtenidas correctamente", cuotas);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Obtener todas las cuotas de un usuario
export async function getCuotasUsuario(req, res) {
  try {
    const { id } = req.query;

    if (!id) return handleErrorClient(res, 400, "ID de usuario es requerido");

    const [cuotas, errorCuotas] = await getCuotasUsuarioService({ id });

    if (errorCuotas) return handleErrorClient(res, 404, errorCuotas);

    handleSuccess(res, 200, "Cuotas del usuario obtenidas correctamente", cuotas);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

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
export async function UpdateEstadoPagoCuota(req, res) {
    try {
        
    const { id, id_cuota, estado_pago } = req.body;

    const { error: queryError } = usuarioCuotaQueryValidation.validate({ id, id_cuota, estado_pago });

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

export async function updateCuotaByRut(req, res) {
  try {
    const { id_cuota } = req.params;
    const { id, estado_pago } = req.body;

    if (!rut) return res.status(400).json({ message: "RUT es obligatorio" });

    const vecino = await vecino.findOne({ where: { rut } });
    if (!vecino) return res.status(400).json({ message: "Vecino no encontrado" });

    const cuota = await cuota.findOne({ where: { id_cuota, id: vecino.id } });

    cuota.pagado = pagado;
    await cuota.save();
    return res.json({ message: "Cuota actualizada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}