"use strict"

import {
    createNotificacionAlertaService,
    getNotificacionAlertaService,
    getNotificacionesAlertasService,
    updateNotificacionAlertaService,
    deleteNotificacionAlertaService,
} from "../services/notificacion_alerta.service.js";

import { sendEmail } from "../services/email.service.js";

import {
    notificacion_alertaBodyValidation,
    notificacion_alertaQueryValidation,
} from "../validations/notificacion_alerta.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entity/user.entity.js";

// Función para enviar notificación de nueva alerta/notificación
const enviarNotificacionAlerta = async (notificacion) => {
    try {
        // Obtener todos los vecinos activos
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const vecinos = await usuarioRepository.find({ 
            where: { rol: "vecino", estado_activo: true }
        });

        // Formatear la fecha de la notificación
        const fechaNotificacion = new Date(notificacion.fecha);
        const fechaFormateada = fechaNotificacion.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Determinar el tipo y color según el tipo de notificación
        const tipoInfo = notificacion.tipo?.toLowerCase() === 'alerta' ? 
            { texto: 'Alerta', emoji: '🚨', color: '#ef4444', bgColor: '#fef2f2', borderColor: '#fecaca' } :
            { texto: 'Notificación', emoji: '📢', color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#bfdbfe' };

        const subject = `${tipoInfo.emoji} ${tipoInfo.texto} Importante - ${notificacion.titulo}`;
        
        const mensaje = `Se ha publicado una nueva ${tipoInfo.texto.toLowerCase()} importante de la Junta de Vecinos.

${tipoInfo.emoji} ${tipoInfo.texto.toUpperCase()}: ${notificacion.titulo}

📅 Fecha: ${fechaFormateada}
📝 Descripción: ${notificacion.descripcion}

${notificacion.tipo?.toLowerCase() === 'alerta' ? 
'⚠️ Esta es una alerta importante, por favor revisa la información.' : 
'ℹ️ Mantente informado de esta notificación importante.'}

Atentamente,
Directiva de la Junta de Vecinos`;

        // Enviar email a cada vecino
        const promesasEmail = vecinos.map(async (vecino) => {
            if (vecino.email) {
                try {
                    await sendEmail(
                        vecino.email,
                        subject,
                        mensaje,
                        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, ${tipoInfo.color}, ${tipoInfo.color}dd); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px;">${tipoInfo.emoji} ${tipoInfo.texto} Importante</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Junta de Vecinos</p>
                            </div>
                            <div style="background: ${tipoInfo.bgColor}; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; margin-bottom: 25px;">¡Hola <strong>${vecino.nombre}</strong>!</p>
                                <p style="font-size: 16px; margin-bottom: 20px;">Se ha publicado una nueva ${tipoInfo.texto.toLowerCase()} importante:</p>
                                
                                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${tipoInfo.color}; margin: 20px 0;">
                                    <h3 style="color: ${tipoInfo.color}; margin-top: 0;">${tipoInfo.emoji} ${notificacion.titulo}</h3>
                                    <p style="margin: 10px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 10px 0;"><strong>📝 Descripción:</strong></p>
                                    <div style="margin: 15px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #e2e8f0;">
                                        ${notificacion.descripcion.replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                                
                                <div style="background: ${tipoInfo.borderColor}; border: 1px solid ${tipoInfo.color}; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: ${tipoInfo.color}; font-size: 14px;">
                                        <strong>${tipoInfo.tipo?.toLowerCase() === 'alerta' ? '⚠️ Importante:' : 'ℹ️ Nota:'}</strong> 
                                        ${tipoInfo.tipo?.toLowerCase() === 'alerta' ? 
                                          'Esta es una alerta importante, por favor revisa la información cuidadosamente.' : 
                                          'Mantente informado de esta notificación importante.'}
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                                    <p style="color: #666; font-size: 12px; margin: 0;">
                                        Atentamente,<br>
                                        <strong>Directiva de la Junta de Vecinos</strong>
                                    </p>
                                    <p style="color: #666; font-size: 11px; margin: 10px 0 0 0;">
                                        Este correo fue enviado automáticamente por el sistema de gestión de la Junta de Vecinos.
                                    </p>
                                </div>
                            </div>
                        </div>`
                    );
                    console.log(`✅ Email de ${tipoInfo.texto.toLowerCase()} enviado a: ${vecino.email}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando email a ${vecino.email}:`, emailError.message);
                }
            }
        });

        // Esperar a que se envíen todos los emails
        await Promise.allSettled(promesasEmail);
        console.log(`📧 ${tipoInfo.texto}s enviadas a ${vecinos.length} vecinos`);
        
    } catch (error) {
        console.error("Error al enviar notificaciones de alerta:", error.message);
    }
};
// Obtengo Notificacion/Alerta por id o titulo
export async function getNotificacionAlerta(req, res) {
    try {
        const { id_notificacion } = req.query;

        const { error } = notificacion_alertaQueryValidation.validate({ id_notificacion });
        if (error) return handleErrorClient(res, 400, error.message);

        const [notificacion, errorNotificacion] = await getNotificacionAlertaService({ id_notificacion });
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
        const { id_notificacion } = req.query;
        const { body } = req;

        const { error: queryError } = notificacion_alertaQueryValidation.validate({ id_notificacion });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = notificacion_alertaBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [notificacion, errorNotificacion] = await updateNotificacionAlertaService({ id_notificacion }, body);
        if (errorNotificacion) return handleErrorClient(res, 400, "Error actualizando publicacion", errorNotificacion);

        handleSuccess(res, 200, "Publicacion actualizada", notificacion);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una Notificacion/Alerta
export async function deleteNotificacionAlerta(req, res) {
    try{
        const { id_notificacion } = req.query;

        const { error } = notificacion_alertaQueryValidation.validate({ id_notificacion });
        if (error) return handleErrorClient(res, 400, "Errror en consulta", error.message);

        const [notificacion, errorNotificacion] = await deleteNotificacionAlertaService({ id_notificacion });
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

        const [notificacion, errorNotificacion] = await createNotificacionAlertaService(body);
        if (errorNotificacion) return handleErrorClient(res, 404, "Error creando Notificación/Alerta", errorNotificacion);

        // Enviar notificaciones por email de forma asíncrona
        enviarNotificacionAlerta(notificacion).catch(error => {
            console.error("Error en el envío de notificaciones de alerta:", error);
        });

        handleSuccess(res, 201, "Notificación/Alerta creada correctamente y notificaciones enviadas", {
            ...notificacion,
            notificaciones: "Enviando notificaciones por email..."
        });
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}