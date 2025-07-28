"use strict";
import Notificacion from "../entity/notificacion_alerta.entity.js";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { sendEmail } from "./email.service.js";

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
// Función auxiliar para obtener todos los emails de usuarios
async function getAllUsersEmails() {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            select: ["email"]
        });
        
        return users.map(user => user.email).filter(email => email); // Filtrar emails válidos
    } catch (error) {
        console.error("Error al obtener emails de usuarios:", error);
        return [];
    }
}

// Función auxiliar para crear el contenido HTML del email
function createNotificationEmailHTML(titulo, descripcion, tipo) {
    const tipoColors = {
        'ALERTA': '#ef4444',
        'NOTIFICACION': '#3b82f6',
        'INFORMACION': '#10b981'
    };
    
    const tipoNames = {
        'ALERTA': 'Alerta',
        'NOTIFICACION': 'Notificación',
        'INFORMACION': 'Información'
    };

    const color = tipoColors[tipo] || '#6b7280';
    const tipoName = tipoNames[tipo] || tipo;

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nueva ${tipoName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 5px solid ${color};">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: ${color}; margin: 0; font-size: 28px;">Junta de Vecinos</h1>
                    <p style="color: #6b7280; margin: 5px 0 0 0;">Nueva ${tipoName}</p>
                </div>
                
                <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 20px;">
                        <span style="background-color: ${color}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                            ${tipoName}
                        </span>
                    </div>
                    
                    <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">${titulo}</h2>
                    
                    <div style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                        ${descripcion.replace(/\n/g, '<br>')}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        Este correo fue enviado automáticamente por el sistema de la Junta de Vecinos
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                        Fecha: ${new Date().toLocaleString('es-CL', { 
                            timeZone: 'America/Santiago',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Creo Notificaciones/Alertas
export async function createNotificacionAlertaService(body) {
    try{
        const naRepository = AppDataSource.getRepository(Notificacion);

        // Crear fecha en zona horaria de Chile
        const now = new Date();
        const chileTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Santiago"}));

        const newNotificacion = naRepository.create ({
            titulo: body.titulo,
            descripcion: body.descripcion,
            tipo: body.tipo,
            fecha: chileTime,
            estado_visualizacion: 'NO_VISTA',
            fechaActualizacion: chileTime,
        });

        await naRepository.save(newNotificacion);

        // Enviar correos a todos los usuarios (versión asíncrona que no bloquea)
        setTimeout(async () => {
            try {
                const userEmails = await getAllUsersEmails();
                
                if (userEmails.length > 0) {
                    const emailSubject = `Nueva ${body.tipo.toLowerCase()}: ${body.titulo}`;
                    const emailHTML = createNotificationEmailHTML(body.titulo, body.descripcion, body.tipo);
                    const emailText = `Nueva ${body.tipo.toLowerCase()}: ${body.titulo}\n\n${body.descripcion}`;

                    // Enviar email a cada usuario
                    for (const email of userEmails) {
                        try {
                            await sendEmail(email, emailSubject, emailText, emailHTML);
                        } catch (error) {
                            console.error(`Error enviando email a ${email}:`, error);
                        }
                    }
                    console.log(`Emails enviados para la notificación: ${body.titulo}`);
                }
            } catch (emailError) {
                console.error("Error enviando emails de notificación:", emailError);
            }
        }, 100); // Enviar emails después de 100ms

        return [newNotificacion, null];
    } catch(error) {
        console.error("Error al crear la Notificacion/Alerta:", error);
        return [null, "Error interno del servidor"];
    }
}