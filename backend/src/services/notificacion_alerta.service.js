"use strict";
import Notificacion from "../entity/notificacion_alerta.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Obtengo Notificacion/Alerta por id o titulo
export async function getNotificacionAlertaService(query) {
    try {
        const { id_notificacion } = query;

        const naRepository = AppDataSource.getRepository(Notificacion);

        const notificacionFound = await naRepository.findOne({
        where: [{ id_notificacion: id_notificacion }],
        });

        if (!notificacionFound) return [null, "Notificación/Alerta no encontrada"];

        return [notificacionFound, null];
    } catch (error) {
        console.error("Error al obtener la Notificación/Alerta:", error);
        return [null, "Error interno del servidor"];
    }
}

// Obtengo lista de publicaciones
export async function getNotificacionesAlertasService() {
    try {
        const naRepository = AppDataSource.getRepository(Notificacion);

        const notificaciones = await naRepository.find();

        if (!notificaciones || notificaciones.length === 0) return [null, "No hay notificaciones/alertas"];

        return [notificaciones, null];
    }catch (error) {
    console.error("Error al obtener las notificaciones:", error);
    return [null, "Error interno del servidor"];
    }
}
// Modifico datos de las notificaciones/alertas
export async function updateNotificacionAlertaService(query, body) {
  try {
        const { id_notificacion } = query;

        const naRepository = AppDataSource.getRepository(Notificacion);

        const notificacionFound = await naRepository.findOne({
        where: { id_notificacion }
        });

    if (!notificacionFound) return [null, "Notificación/Alerta no encontrada"];

        const dataUpdate = {
            titulo: body.titulo,
            descripcion: body.descripcion,
            tipo: body.tipo,
            contenido: body.contenido,
            fecha: new Date(),
            estado_visualizacion: body.estado_visualizacion,
            fechaActualizacion: new Date(),
        };
    
    await naRepository.update({ id_notificacion }, dataUpdate);

    const updatedNotificacion = await naRepository.findOne({
        where: { id_notificacion },
    });

    if (!updatedNotificacion)
        return [null, "Notificación/Alerta no econtrada despúes de actualizar"];

    return [updatedNotificacion, null];
    } catch (error){
    console.error("Error al actualizar la Notificación/Alerta:", error);
    return [null, "Error interno del servidor"];
    }
}
// Elimino las Notificaciones/Alertas
export async function deleteNotificacionAlertaService(query) {
  try {
    const { id_notificacion } = query;

    const naRepository = AppDataSource.getRepository(Notificacion);

    const notificacionFound = await naRepository.findOne({
      where: { id_notificacion: id_notificacion }
    });

    if (!notificacionFound) return [null, "Notificación/Alerta no encontrada"];

    const deletedNotificacion = await naRepository.remove(notificacionFound);

    return [deletedNotificacion, null];
    } catch (error) {
    console.error("Error al eliminar la Notificación/Alerta:", error);
    return [null, "Error interno del servidor"];
  }
}
// Creo Notificaciones/Alertas
export async function createNotificacionAlertaService(body) {
    try{
        const naRepository = AppDataSource.getRepository(Notificacion);

        const newNotificacion = naRepository.create ({
            titulo: body.titulo,
            descripcion: body.descripcion,
            tipo: body.tipo,
            contenido: body.contenido,
            fecha: new Date(),
            estado_visualizacion: body.estado_visualizacion,
            fechaActualizacion: new Date(),
        });

        await naRepository.save(newNotificacion);

        return [newNotificacion, null];
    } catch(error) {
        console.error("Error al crear la Notificacion/Alerta:", error);
        return [null, "Error interno del servidor:"];
    }
}