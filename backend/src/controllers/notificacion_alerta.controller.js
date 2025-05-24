"use strict"

import {
    createNotificacionAlertaService,
    getNotificacionAlertaService,
    getNotificacionesAlertasService,
    updateNotificacionAlertaService,
    deleteNotificacionAlertaService,
} from "../services/notificacion_alerta.service.js";

import {
    notificacion_alertaBodyValidation,
    notificacion_alertaQueryValidation,
} from "../validations/notificacion_alerta.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
// Obtengo Notificacion/Alerta por id o titulo
export async function getNotificacionAlerta(req, res) {
    try {
        const { id } = req.query;

        const { error } = notificacion_alertaQueryValidation.validate({ id });
        if (error) return handleErrorClient(res, 400, error.message);

        const [notificacion, errorNotificacion] = await getNotificacionAlertaService({ id });
        if (errorNotificacion) return handleErrorClient(res, 404, errorNotificacion);

        handleSuccess(res, 200, "Notificación/Alerta encontrada", notificacion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
 }
// Listo todas las Notificaciones/Alertas
 export async function getNotificacionesAlertas (req, res) {
    try {
        const [notificaciones, errorNotificaciones] = await getNotificacionesAlertasService();
        if(errorNotificaciones) return handleErrorClient(res, 404, errorNotificaciones)

        notificaciones.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Notificaciones encontradas", notificaciones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las Notificaciones/Alertas
export async function updateNotificacionAlerta(req, res) {
    try{
        const { id } = req.query;
        const { body } = req;

        const { error: queryError } = notificacion_alertaQueryValidation.validate({ id });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = notificacion_alertaBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [notificacion, errorNotificacion] = await updateNotificacionAlertaService({ id }, body);
        if (errorPub) return handleErrorClient(res, 400, "Error actualizando publicacion", errorPub);

        handleSuccess(res, 200, "Publicacion actualizada", notificacion);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una Notificacion/Alerta
export async function deleteNotificacionAlerta(req, res) {
    try{
        const { id } = req.query;

        const { error } = notificacion_alertaQueryValidation.validate({ id });
        if (error) return handleErrorClient(res, 400, "Errror en consulta", error.message);

        const [notificacion, errorNotificacion] = await deleteNotificacionAlertaService({ id });
        if (errorNotificacion) return handleErrorClient(res, 400, "Error eliminando la Notificacion", errorNotificacion);

        handleSuccess(res, 200, "Notificación/Alerta eliminada", notificacion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear una Notificacion/Alerta
export async function createNotificacionAlerta(req, res) {
    try{
        const { body } = req;

        const { error } = notificacion_alertaBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [notificacion, errorNotificacion] = await createNotifacionAlertaService(body);
        if (errorNotificacion) return handleErrorClient(res, 404, "Error creando Notificación/Alerta", errorNotificacion);

        handleSuccess(res, 201, "Notificación/Alerta creada correctamente", notificacion);
    } catch {
        handleErrorServer(res, 500, error.message);
    }
}