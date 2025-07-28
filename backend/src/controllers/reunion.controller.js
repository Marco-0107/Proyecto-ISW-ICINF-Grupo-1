"use strict"

import fs from "fs";
import path from "path";
import {
   getReunionService,
   getReunionesService,
   updateReunionService,
   deleteReunionService,
   createReunionService,
   updateArchivoActaService
} from "../services/reunion.service.js";

import { sendEmail } from "../services/email.service.js";
import { subidaArchivoService, getArchivoByIdService } from "../services/archivo.service.js";

import {
    reunionBodyValidation,
    reunionEditValidation,
    reunionQueryValidation,
} from "../validations/reunion.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entity/user.entity.js";
import { HOST, PORT } from "../config/configEnv.js";

const enviarNotificacionReunion = async (reunion) => {
    try {
        // Obtener todos los vecinos activos
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const vecinos = await usuarioRepository.find({ 
            where: { rol: "vecino", estado_activo: true }
        });

        // Formatear la fecha de la reunión
        const fechaReunion = new Date(reunion.fecha_reunion);
        const fechaFormateada = fechaReunion.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const subject = `📅 Nueva Reunión de Junta de Vecinos - ${fechaFormateada}`;
        
        const mensaje = `Se ha programado una nueva reunión de la Junta de Vecinos.

📍 Lugar: ${reunion.lugar}
📅 Fecha y Hora: ${fechaFormateada}
📝 Descripción: ${reunion.descripcion}

Por favor, confirma tu asistencia cuando recibas el token de confirmación.

¡Esperamos contar con tu participación!

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
                                <h1 style="margin: 0; font-size: 28px;">📅 Nueva Reunión</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Junta de Vecinos</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; margin-bottom: 25px;">¡Hola <strong>${vecino.nombre}</strong>!</p>
                                <p style="font-size: 16px; margin-bottom: 20px;">Se ha programado una nueva reunión de la Junta de Vecinos:</p>
                                
                                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4ade80; margin: 20px 0;">
                                    <h3 style="color: #2c5530; margin-top: 0;">📋 Detalles de la Reunión</h3>
                                    <p style="margin: 10px 0;"><strong>📍 Lugar:</strong> ${reunion.lugar}</p>
                                    <p style="margin: 10px 0;"><strong>📅 Fecha y Hora:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 10px 0;"><strong>📝 Descripción:</strong> ${reunion.descripcion}</p>
                                </div>
                                
                                <p style="text-align: center; margin: 25px 0;">
                                    <strong>¡Esperamos contar con tu participación!</strong>
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
                    console.log(`✅ Email enviado a: ${vecino.email}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando email a ${vecino.email}:`, emailError.message);
                }
            }
        });

        // Esperar a que se envíen todos los emails
        await Promise.allSettled(promesasEmail);
        console.log(`📧 Notificaciones enviadas a ${vecinos.length} vecinos`);
        
    } catch (error) {
        console.error("Error al enviar notificaciones:", error.message);
    }
};


const enviarNotificacionReunionEditada = async (reunion, cambiosRealizados) => {
    try {
        // Obtener todos los vecinos activos
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const vecinos = await usuarioRepository.find({ 
            where: { rol: "vecino", estado_activo: true }
        });

        // Formatear la fecha de la reunión
        const fechaReunion = new Date(reunion.fecha_reunion);
        const fechaFormateada = fechaReunion.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const subject = `🔄 Reunión Modificada - ${fechaFormateada}`;
        
        const listaCambios = cambiosRealizados.join('\n• ');
        
        const mensaje = `Se han realizado cambios en una reunión programada de la Junta de Vecinos.

📝 CAMBIOS REALIZADOS:
• ${listaCambios}

📍 Lugar: ${reunion.lugar}
📅 Nueva Fecha y Hora: ${fechaFormateada}
📝 Descripción: ${reunion.descripcion}

Por favor, toma nota de estos cambios importantes.

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
                            <div style="background: linear-gradient(135deg, #ff8c00, #ffa500); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px;">🔄 Reunión Modificada</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Junta de Vecinos</p>
                            </div>
                            <div style="background: #fff8f0; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; margin-bottom: 25px;">¡Hola <strong>${vecino.nombre}</strong>!</p>
                                <p style="font-size: 16px; margin-bottom: 20px;">Se han realizado cambios importantes en una reunión programada:</p>
                                
                                <div style="background: #ffe6cc; padding: 20px; border-radius: 8px; border-left: 4px solid #ff8c00; margin: 20px 0;">
                                    <h3 style="color: #d2691e; margin-top: 0;">📝 Cambios Realizados</h3>
                                    <ul style="margin: 10px 0; color: #8b4513;">
                                        ${cambiosRealizados.map(cambio => `<li style="margin: 5px 0;">${cambio}</li>`).join('')}
                                    </ul>
                                </div>
                                
                                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4ade80; margin: 20px 0;">
                                    <h3 style="color: #2c5530; margin-top: 0;">📋 Detalles Actualizados</h3>
                                    <p style="margin: 10px 0;"><strong>📍 Lugar:</strong> ${reunion.lugar}</p>
                                    <p style="margin: 10px 0;"><strong>📅 Fecha y Hora:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 10px 0;"><strong>📝 Descripción:</strong> ${reunion.descripcion}</p>
                                </div>
                                
                                <div style="background: #e7f3ff; border: 1px solid #b8daff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #004085; font-size: 14px;">
                                        <strong>ℹ️ Importante:</strong> Por favor actualiza tu calendario con estos cambios.
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
                    console.log(`✅ Email de modificación enviado a: ${vecino.email}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando email de modificación a ${vecino.email}:`, emailError.message);
                }
            }
        });

        await Promise.allSettled(promesasEmail);
        console.log(`📧 Notificaciones de modificación enviadas a ${vecinos.length} vecinos`);
        
    } catch (error) {
        console.error("Error al enviar notificaciones de modificación:", error.message);
    }
};


const enviarNotificacionReunionEliminada = async (reunion) => {
    try {
        // Obtener todos los vecinos activos
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const vecinos = await usuarioRepository.find({ 
            where: { rol: "vecino", estado_activo: true }
        });

        // Formatear la fecha de la reunión
        const fechaReunion = new Date(reunion.fecha_reunion);
        const fechaFormateada = fechaReunion.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const subject = `❌ Reunión Cancelada - ${fechaFormateada}`;
        
        const mensaje = `Se ha CANCELADO una reunión programada de la Junta de Vecinos.

❌ REUNIÓN CANCELADA:

📍 Lugar: ${reunion.lugar}
📅 Fecha y Hora: ${fechaFormateada}
📝 Descripción: ${reunion.descripcion}

Puedes eliminar esta reunión de tu calendario.

Nos disculpamos por cualquier inconveniente.

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
                                <h1 style="margin: 0; font-size: 28px;">❌ Reunión Cancelada</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Junta de Vecinos</p>
                            </div>
                            <div style="background: #fff5f5; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; margin-bottom: 25px;">¡Hola <strong>${vecino.nombre}</strong>!</p>
                                <p style="font-size: 16px; margin-bottom: 20px;">Lamentamos informarte que se ha <strong>cancelado</strong> la siguiente reunión:</p>
                                
                                <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                                    <h3 style="color: #721c24; margin-top: 0;">📋 Reunión Cancelada</h3>
                                    <p style="margin: 10px 0; color: #721c24;"><strong>📍 Lugar:</strong> ${reunion.lugar}</p>
                                    <p style="margin: 10px 0; color: #721c24;"><strong>📅 Fecha y Hora:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 10px 0; color: #721c24;"><strong>📝 Descripción:</strong> ${reunion.descripcion}</p>
                                </div>
                                
                                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #856404; font-size: 14px;">
                                        <strong>📅 Recordatorio:</strong> Puedes eliminar esta reunión de tu calendario personal.
                                    </p>
                                </div>
                                
                                <p style="text-align: center; margin: 25px 0; color: #721c24;">
                                    <strong>Nos disculpamos por cualquier inconveniente.</strong>
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
                    console.log(`✅ Email de cancelación enviado a: ${vecino.email}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando email de cancelación a ${vecino.email}:`, emailError.message);
                }
            }
        });

        await Promise.allSettled(promesasEmail);
        console.log(`📧 Notificaciones de cancelación enviadas a ${vecinos.length} vecinos`);
        
    } catch (error) {
        console.error("Error al enviar notificaciones de cancelación:", error.message);
    }
};

// Obtengo reunion por id o titulo

export async function getReunion(req, res) {
    try {
        const { id_reunion } = req.query;

        const { error } = reunionQueryValidation.validate({ id_reunion });
        if (error) return handleErrorClient(res, 400, error.message);

        const [reunion, errorReunion] = await getReunionService ({ id_reunion });
        if (errorReunion) return handleErrorClient(res, 404, errorReunion);
        
        handleSuccess(res, 200, "Reunión encontrada", reunion);
        
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Listo todas las reuniones
 export async function getReuniones (req, res) {
    try {
        const [reuniones, errorReuniones] = await getReunionesService();
        if(errorReuniones) return handleErrorClient(res, 404, errorReuniones)

        reuniones.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Reuniones encontradas", reuniones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las reuniones
export async function updateReunion(req, res) {
    try{
        const { id_reunion } = req.query;
        const { body } = req;

        const { error: bodyError } = reunionEditValidation.validate(body);
        if (bodyError) {
            return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        }
        
        // Obtener la reunión actual antes de modificarla
        const reunionRepository = AppDataSource.getRepository("Reunion");
        const reunionAnterior = await reunionRepository.findOne({
            where: { id_reunion: parseInt(id_reunion) }
        });
        
        if (!reunionAnterior) {
            return handleErrorClient(res, 404, "Error", "Reunión no encontrada");
        }
        
        const { id_reunion: _, ...bodyData } = body;
        
        const [reunion, errorUpdateReunion] = await updateReunionService({ id_reunion }, bodyData);
        if (errorUpdateReunion) return handleErrorClient(res, 400, "Error actualizando reunión", errorUpdateReunion);

        // Detectar cambios y crear lista de modificaciones
        const cambiosRealizados = [];
        
        if (reunionAnterior.lugar !== reunion.lugar) {
            cambiosRealizados.push(`Lugar cambió de "${reunionAnterior.lugar}" a "${reunion.lugar}"`);
        }
        
        if (new Date(reunionAnterior.fecha_reunion).getTime() !== new Date(reunion.fecha_reunion).getTime()) {
            const fechaAnterior = new Date(reunionAnterior.fecha_reunion).toLocaleDateString('es-CL', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit'
            });
            const fechaNueva = new Date(reunion.fecha_reunion).toLocaleDateString('es-CL', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit'
            });
            cambiosRealizados.push(`Fecha y hora cambió de "${fechaAnterior}" a "${fechaNueva}"`);
        }
        
        if (reunionAnterior.descripcion !== reunion.descripcion) {
            cambiosRealizados.push(`Descripción fue actualizada`);
        }

        // Si hubo cambios, enviar notificaciones
        if (cambiosRealizados.length > 0) {
            // Enviar notificaciones en segundo plano para no bloquear la respuesta
            enviarNotificacionReunionEditada(reunion, cambiosRealizados).catch(error => {
                console.error("Error enviando notificaciones de modificación:", error);
            });
        }

        handleSuccess(res, 200, "Reunión actualizada", reunion);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una reunion
export async function deleteReunion(req, res) {
    try{
        const { id_reunion } = req.query;

        const { error } = reunionQueryValidation.validate({ id_reunion });
        if (error) return handleErrorClient(res, 400, "Error en consulta", error.message);

        // Obtener la reunión antes de eliminarla para enviar la notificación
        const reunionRepository = AppDataSource.getRepository("Reunion");
        const reunionAEliminar = await reunionRepository.findOne({
            where: { id_reunion: parseInt(id_reunion) }
        });
        
        if (!reunionAEliminar) {
            return handleErrorClient(res, 404, "Error", "Reunión no encontrada");
        }

        const [reunion, errorDeleteReunion] = await deleteReunionService({ id_reunion });
        if (errorDeleteReunion) return handleErrorClient(res, 400, "Error eliminando la reunión", errorDeleteReunion);

        // Enviar notificaciones de cancelación en segundo plano
        enviarNotificacionReunionEliminada(reunionAEliminar).catch(error => {
            console.error("Error enviando notificaciones de cancelación:", error);
        });

        handleSuccess(res, 200, "Reunión eliminada", reunion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Cargar acta a la reunion (mejorado)
export async function cargarActaReunion(req, res) {
  try {
    const { id_reunion } = req.params;
    let archivoPath = req.file?.path;

    if (!archivoPath) {
      return handleErrorClient(res, 400, "Archivo de acta no subido");
    }

    if (!id_reunion) {
      return handleErrorClient(res, 400, "ID de reunión es requerido");
    }

    // Verificar que la reunión existe
    const reunionRepository = AppDataSource.getRepository("Reunion");
    const reunion = await reunionRepository.findOne({ 
      where: { id_reunion: parseInt(id_reunion) } 
    });

    if (!reunion) {
      return handleErrorClient(res, 404, "Reunión no encontrada");
    }

    // Construir el nombre del archivo con información de la reunión
    const extension = path.extname(req.file.originalname);
    const fechaReunion = new Date(reunion.fecha_reunion).toLocaleDateString('es-CL').replace(/\//g, '-');
    const nombreArchivo = `Acta-Reunion-${fechaReunion}-${reunion.id_reunion}${extension}`;

    // Guardar el archivo en el sistema de archivos
    const baseUrl = `http://${HOST}:${PORT}/api/src/upload/actas/`;
    const archivoUrl = baseUrl + path.basename(archivoPath);

    // Crear registro en la tabla de archivos
    const [archivoCreado, errorArchivo] = await subidaArchivoService({ 
      nombre: nombreArchivo, 
      archivoPath: archivoUrl 
    });

    if (errorArchivo) {
      return handleErrorClient(res, 500, "Error guardando información del archivo", errorArchivo);
    }

    // Actualizar la reunión con el ID del archivo
    const [reunionActualizada, errorReunion] = await updateArchivoActaService(id_reunion, archivoCreado.id);
    
    if (errorReunion) {
      return handleErrorClient(res, 500, "Error asociando acta a la reunión", errorReunion);
    }

    handleSuccess(res, 200, "✅ Acta cargada correctamente", {
      reunion: reunionActualizada,
      archivo: archivoCreado
    });

  } catch (error) {
    handleErrorServer(res, 500, "Error cargando acta", error.message);
  }
}

// Descargar acta de reunion
export async function descargarActaReunion(req, res) {
  try {
    const { id_reunion } = req.params;

    if (!id_reunion) {
      return handleErrorClient(res, 400, "ID de reunión es requerido");
    }

    // Obtener la reunión con el ID del archivo
    const reunionRepository = AppDataSource.getRepository("Reunion");
    const reunion = await reunionRepository.findOne({ 
      where: { id_reunion: parseInt(id_reunion) } 
    });

    if (!reunion) {
      return handleErrorClient(res, 404, "Reunión no encontrada");
    }

    if (!reunion.archivo_acta) {
      return handleErrorClient(res, 404, "Esta reunión no tiene acta cargada");
    }

    // Si archivo_acta es un ID, obtener el archivo
    let archivoId = reunion.archivo_acta;
    
    // Si es una URL antigua, informar que debe re-subir el archivo
    if (typeof archivoId === 'string' && (archivoId.includes('http://') || archivoId.includes('https://'))) {
      return handleErrorClient(res, 404, "Acta con formato antiguo. Por favor, vuelva a cargar el acta.");
    }

    // Obtener información del archivo
    const [archivo, error] = await getArchivoByIdService(archivoId);
    if (error) {
      return handleErrorClient(res, 404, "Archivo de acta no encontrado", error);
    }

    // Extraer la ruta real del archivo
    let rutaArchivo;
    if (archivo.archivo.includes('http://') || archivo.archivo.includes('https://')) {
      const nombreArchivo = path.basename(archivo.archivo);
      rutaArchivo = path.join(process.cwd(), 'src', 'upload', 'actas', nombreArchivo);
    } else {
      rutaArchivo = path.resolve(archivo.archivo);
    }

    // Verificar si el archivo existe físicamente
    if (!fs.existsSync(rutaArchivo)) {
      return handleErrorClient(res, 404, "Archivo físico no encontrado. Por favor, vuelva a cargar el acta.");
    }

    // Obtener información del archivo
    const stats = fs.statSync(rutaArchivo);
    const nombreArchivo = archivo.nombre || path.basename(rutaArchivo);
    
    // Determinar el tipo MIME
    const extension = path.extname(nombreArchivo).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    switch (extension) {
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      case '.doc':
        mimeType = 'application/msword';
        break;
      case '.docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.txt':
        mimeType = 'text/plain';
        break;
    }

    // Configurar headers para descarga
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(nombreArchivo)}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Crear stream y enviar archivo
    const fileStream = fs.createReadStream(rutaArchivo);
    
    fileStream.on('error', (streamError) => {
      console.error('Error leyendo acta:', streamError);
      if (!res.headersSent) {
        handleErrorServer(res, 500, "Error leyendo el archivo de acta", streamError.message);
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    handleErrorServer(res, 500, "Error descargando acta", error.message);
  }
}

export async function updateArchivoActa(req, res) {
  const { id_reunion } = req.params;
  const { archivo_acta } = req.body;

  if (!archivo_acta) {
    return res.status(400).json({ message: "Falta la URL del acta" });
  }

  const [reunionUpdated, error] = await updateArchivoActaService(id_reunion, archivo_acta);
  if (error) return res.status(404).json({ message: error });

  res.status(200).json({
    message: "✅ Acta guardada correctamente",
    data: reunionUpdated,
  });
}

// Crear una Reunion
export async function createReunion(req, res) {
    try{
        const { body } = req;

        const { error } = reunionBodyValidation.validate(body, { 
            context: { now: new Date() } 
        });
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [reunion, errorCreateReunion] = await createReunionService(body);
        if (errorCreateReunion) return handleErrorClient(res, 404, "Error creando reunión", errorCreateReunion);

        // Enviar notificaciones por email de forma asíncrona
        enviarNotificacionReunion(reunion).catch(error => {
            console.error("Error en el envío de notificaciones:", error);
        });

        handleSuccess(res, 201, "Reunión creada correctamente y notificaciones enviadas", {
            ...reunion,
            notificaciones: "Enviando notificaciones por email..."
        });
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

