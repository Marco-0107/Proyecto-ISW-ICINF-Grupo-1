"use strict"

import {
    getcuota_vecinalService,
    getcuotas_vecinalesService,
    updatecuotas_vecinalesService,
    deletecuotas_vecinalesService,
    createcuotas_vecinalesService,
} from "../services/cuotas_vecinales.service.js";

import { sendEmail } from "../services/email.service.js";

import {
    cuotas_vecinalesBodyValidation,
    cuotas_vecinalesQueryValidation,
} from "../validations/cuotas_vecinales.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entity/user.entity.js";
import Cuota from "../entity/cuotas_vecinales.entity.js";

const enviarNotificacionCuotaCreada = async (cuota) => {
    try {
        // Obtener todos los vecinos activos
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const vecinos = await usuarioRepository.find({
            where: { rol: "vecino", estado_activo: true }
        });

        // Formatear la fecha de emisión
        const fechaEmision = new Date(cuota.fecha_emision);
        const fechaFormateada = fechaEmision.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const subject = `💰 Nueva Cuota Vecinal - $${cuota.monto_c.toLocaleString('es-CL')}`;

        const mensaje = `Se ha emitido una nueva cuota vecinal.

💰 Monto: $${cuota.monto_c.toLocaleString('es-CL')}
📅 Fecha de Emisión: ${fechaFormateada}

Por favor, mantente al día con tus pagos para contribuir al mantenimiento de nuestra comunidad.

¡Gracias por tu colaboración!

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
                            <div style="background: linear-gradient(135deg, #2c5530, #4ade80); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px;">💰 Nueva Cuota Vecinal</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Junta de Vecinos</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; margin-bottom: 25px;">¡Hola <strong>${vecino.nombre}</strong>!</p>
                                <p style="font-size: 16px; margin-bottom: 20px;">Se ha emitido una nueva cuota vecinal:</p>
                                
                                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4ade80; margin: 20px 0;">
                                    <h3 style="color: #2c5530; margin-top: 0;">📋 Detalles de la Cuota</h3>
                                    <p style="margin: 10px 0;"><strong>💰 Monto:</strong> <span style="color: #2c5530; font-size: 24px; font-weight: bold;">$${cuota.monto_c.toLocaleString('es-CL')}</span></p>
                                    <p style="margin: 10px 0;"><strong>📅 Fecha de Emisión:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 10px 0;"><strong>🆔 Cuota #:</strong> ${cuota.id_cuota}</p>
                                </div>
                                
                                <div style="background: #e7f3ff; border: 1px solid #b8daff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #004085; font-size: 14px;">
                                        <strong>💡 Recordatorio:</strong> Mantente al día con tus pagos para contribuir al mantenimiento de nuestra comunidad.
                                    </p>
                                </div>
                                
                                <p style="text-align: center; margin: 25px 0;">
                                    <strong>¡Gracias por tu colaboración!</strong>
                                </p>
                                
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
                    console.log(`✅ Email de nueva cuota enviado a: ${vecino.email}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando email a ${vecino.email}:`, emailError.message);
                }
            }
        });

        // Esperar a que se envíen todos los emails
        await Promise.allSettled(promesasEmail);
        console.log(`📧 Notificaciones de nueva cuota enviadas a ${vecinos.length} vecinos`);

    } catch (error) {
        console.error("Error al enviar notificaciones de nueva cuota:", error.message);
    }
};

const enviarNotificacionCuotaEliminada = async (cuota) => {
    try {
        // Obtener todos los vecinos activos
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const vecinos = await usuarioRepository.find({
            where: { rol: "vecino", estado_activo: true }
        });

        // Formatear la fecha de emisión
        const fechaEmision = new Date(cuota.fecha_emision);
        const fechaFormateada = fechaEmision.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const subject = `❌ Cuota Vecinal Eliminada - $${cuota.monto_c.toLocaleString('es-CL')}`;

        const mensaje = `Se ha ELIMINADO una cuota vecinal del sistema.

❌ CUOTA ELIMINADA:

💰 Monto: $${cuota.monto_c.toLocaleString('es-CL')}
📅 Fecha de Emisión: ${fechaFormateada}
🆔 Cuota #: ${cuota.id_cuota}

Esta cuota ya no está vigente en el sistema.

Si tenías pendiente el pago de esta cuota, ya no es necesario realizar el pago.

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
                            <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px;">❌ Cuota Eliminada</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Junta de Vecinos</p>
                            </div>
                            <div style="background: #fff5f5; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; margin-bottom: 25px;">¡Hola <strong>${vecino.nombre}</strong>!</p>
                                <p style="font-size: 16px; margin-bottom: 20px;">Te informamos que se ha <strong>eliminado</strong> la siguiente cuota del sistema:</p>
                                
                                <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                                    <h3 style="color: #721c24; margin-top: 0;">📋 Cuota Eliminada</h3>
                                    <p style="margin: 10px 0; color: #721c24;"><strong>💰 Monto:</strong> <span style="font-size: 20px; font-weight: bold;">$${cuota.monto_c.toLocaleString('es-CL')}</span></p>
                                    <p style="margin: 10px 0; color: #721c24;"><strong>📅 Fecha de Emisión:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 10px 0; color: #721c24;"><strong>🆔 Cuota #:</strong> ${cuota.id_cuota}</p>
                                </div>
                                
                                <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #0c5460; font-size: 14px;">
                                        <strong>ℹ️ Importante:</strong> Esta cuota ya no está vigente. Si tenías pendiente el pago, ya no es necesario realizarlo.
                                    </p>
                                </div>
                                
                                <p style="text-align: center; margin: 25px 0; color: #721c24;">
                                    <strong>Gracias por tu comprensión.</strong>
                                </p>
                                
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
                    console.log(`✅ Email de cuota eliminada enviado a: ${vecino.email}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando email de cuota eliminada a ${vecino.email}:`, emailError.message);
                }
            }
        });

        await Promise.allSettled(promesasEmail);
        console.log(`📧 Notificaciones de cuota eliminada enviadas a ${vecinos.length} vecinos`);

    } catch (error) {
        console.error("Error al enviar notificaciones de cuota eliminada:", error.message);
    }
};

// Obtengo Cuotas_vecinales por id o titulo
export async function getCuotaVecinal(req, res) {
    try {
        const { id_cuota } = req.query;

        const { error } = cuotas_vecinalesQueryValidation.validate({ id_cuota });
        if (error) return handleErrorClient(res, 400, error.message);

        const [cuota, errorCuota] = await getcuota_vecinalService({ id_cuota });
        if (errorCuota) return handleErrorClient(res, 404, errorCuota);

        handleSuccess(res, 200, "Cuota vecinal encontrada", cuota);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Listo todas las cuotas 
export async function getCuotasVecinales(req, res) {
    try {
        const [cuotas, errorCuotas] = await getcuotas_vecinalesService();
        if (errorCuotas) return handleErrorClient(res, 404, errorCuotas)

        cuotas.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Cuotas encontradas", cuotas);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las cuotas
export async function updateCuotaVecinal(req, res) {
    try {
        const { id_cuota } = req.query;
        const { body } = req;

        const { error: queryError } = cuotas_vecinalesQueryValidation.validate({ id_cuota });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = cuotas_vecinalesBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);

        const [cuota, errorUpdateCuota] = await updatecuotas_vecinalesService({ id_cuota }, body);
        if (errorUpdateCuota) return handleErrorClient(res, 400, "Error actualizando la Cuota", errorUpdateCuota);

        handleSuccess(res, 200, "Cuota actualizada", cuota);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una Cuota
export async function deleteCuotaVecinal(req, res) {
    try {
        const { id_cuota } = req.query;

        const { error } = cuotas_vecinalesQueryValidation.validate({ id_cuota });
        if (error) return handleErrorClient(res, 400, "Errror en consulta", error.message);

        // Obtener la cuota antes de eliminarla para enviar la notificación
        const cuotaRepository = AppDataSource.getRepository(Cuota);
        const cuotaAEliminar = await cuotaRepository.findOne({
            where: { id_cuota: parseInt(id_cuota) }
        });

        if (!cuotaAEliminar) {
            return handleErrorClient(res, 404, "Error", "Cuota no encontrada");
        }

        const [cuota, errorDeleteCuota] = await deletecuotas_vecinalesService({ id_cuota });
        if (errorDeleteCuota) return handleErrorClient(res, 400, "Error eliminando la Cuota", errorDeleteCuota);

        // Enviar notificaciones de eliminación en segundo plano
        enviarNotificacionCuotaEliminada(cuotaAEliminar).catch(error => {
            console.error("Error enviando notificaciones de cuota eliminada:", error);
        });

        handleSuccess(res, 200, "Cuota eliminada", cuota);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear una cuota
export async function createCuotaVecinal(req, res) {
    try {
        const { body } = req;

        const { error } = cuotas_vecinalesBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [cuota, errorCreateCuota] = await createcuotas_vecinalesService(body);
        if (errorCreateCuota) return handleErrorClient(res, 404, "Error creando Cuota", errorCreateCuota);

        // Enviar notificaciones por email de forma asíncrona
        enviarNotificacionCuotaCreada(cuota).catch(error => {
            console.error("Error en el envío de notificaciones de nueva cuota:", error);
        });

        handleSuccess(res, 201, "Cuota creada correctamente y notificaciones enviadas", {
            ...cuota,
            notificaciones: "Enviando notificaciones por email..."
        });
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}