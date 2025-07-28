"use strict"

import {
    createPublicacionService,
    getPublicacionService,
    getPublicacionesService,
    updatePublicacionService,
    deletePublicacionService,
} from "../services/publicacion.service.js";

import { sendEmail } from "../services/email.service.js";

import {
    publicacionBodyValidation,
    publicacionQueryValidation,
} from "../validations/publicacion.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entity/user.entity.js";

// Función para enviar notificación de nueva publicación
const enviarNotificacionPublicacion = async (publicacion) => {
    try {
        // Obtener todos los vecinos activos
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const vecinos = await usuarioRepository.find({ 
            where: { rol: "vecino", estado_activo: true }
        });

        // Formatear la fecha de la publicación
        const fechaPublicacion = new Date(publicacion.fecha);
        const fechaFormateada = fechaPublicacion.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const tipoTexto = publicacion.tipo === 'noticia' ? 'Noticia' : 
                         publicacion.tipo === 'evento' ? 'Evento' : 'Publicación';

        const subject = `📰 Nueva ${tipoTexto} - ${publicacion.titulo}`;
        
        const mensaje = `Se ha publicado una nueva ${tipoTexto.toLowerCase()} en la Junta de Vecinos.

📰 ${tipoTexto.toUpperCase()}: ${publicacion.titulo}

📅 Fecha de Publicación: ${fechaFormateada}
📝 Contenido: ${publicacion.contenido}

¡Mantente informado de las novedades de tu comunidad!

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
                            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px;">📰 Nueva ${tipoTexto}</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Junta de Vecinos</p>
                            </div>
                            <div style="background: #eff6ff; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; margin-bottom: 25px;">¡Hola <strong>${vecino.nombre}</strong>!</p>
                                <p style="font-size: 16px; margin-bottom: 20px;">Se ha publicado una nueva ${tipoTexto.toLowerCase()}:</p>
                                
                                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                                    <h3 style="color: #1d4ed8; margin-top: 0;">📋 ${publicacion.titulo}</h3>
                                    <p style="margin: 10px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 10px 0;"><strong>📝 Contenido:</strong></p>
                                    <div style="margin: 15px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #e2e8f0;">
                                        ${publicacion.contenido.replace(/\n/g, '<br>')}
                                    </div>
                                    ${publicacion.imagen ? `<p style="margin: 15px 0;"><strong>🖼️ Imagen:</strong> <a href="${publicacion.imagen}" style="color: #3b82f6;">Ver imagen adjunta</a></p>` : ''}
                                </div>
                                
                                <p style="text-align: center; margin: 25px 0;">
                                    <strong>¡Mantente informado de las novedades de tu comunidad!</strong>
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
                    console.log(`Email de publicación enviado a: ${vecino.email}`);
                } catch (emailError) {
                    console.error(`Error enviando email a ${vecino.email}:`, emailError.message);
                }
            }
        });

        // Esperar a que se envíen todos los emails
        await Promise.allSettled(promesasEmail);
        console.log(`📧 Notificaciones de publicación enviadas a ${vecinos.length} vecinos`);
        
    } catch (error) {
        console.error("Error al enviar notificaciones de publicación:", error.message);
    }
};
// Obtengo publicacion por id o titulo
export async function getPublicacion(req, res) {
    try {
        const { id_publicacion, titulo } = req.query;

        const { error } = publicacionQueryValidation.validate({ id_publicacion, titulo });
        if (error) return handleErrorClient(res, 400, error.message);

        const [publicacion, errorPub] = await getPublicacionService({ id_publicacion, titulo });
        if (errorPub) return handleErrorClient(res, 404, errorPub);

        handleSuccess(res, 200, "Publicación encontrada", publicacion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
 }
// Listo todas las publicaciones 
 export async function getPublicaciones (req, res) {
    try {
        const [publicaciones, errorPubs] = await getPublicacionesService();
        if(errorPubs) return handleErrorClient(res, 404, errorPubs)

        publicaciones.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Publicaciones encontradas", publicaciones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las publicaciones 
export async function updatePublicacion(req, res) {
    try {
        const { id_publicacion } = req.query;
        
        console.log('=== ACTUALIZAR PUBLICACIÓN ===');
        console.log('ID:', id_publicacion);
        console.log('Body recibido:', req.body);
        console.log('Archivo recibido:', req.file);
        
        // Validar que el ID sea válido
        const { error: queryError } = publicacionQueryValidation.validate({ id_publicacion });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);
        
        // Construir el objeto de datos desde req.body (multer ya procesó los campos)
        const body = {};
        
        // Solo incluir campos que estén presentes y no vacíos
        if (req.body.titulo) body.titulo = req.body.titulo;
        if (req.body.tipo) body.tipo = req.body.tipo;
        if (req.body.contenido) body.contenido = req.body.contenido;
        if (req.body.estado) body.estado = req.body.estado;
        
        // Si se subió una nueva imagen, agregar la ruta al body
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            body.imagen = `${protocol}://${host}/uploads/images/${req.file.filename}`;
        }

        console.log('Datos a actualizar:', body);

        // Para actualización, usamos una validación más flexible (no todos los campos son requeridos)
        // Solo validamos los campos que están presentes
        if (Object.keys(body).length === 0) {
            return handleErrorClient(res, 400, "Error", "No hay datos para actualizar");
        }

        const [publicacion, errorUpdatePub] = await updatePublicacionService({ id_publicacion }, body);
        if (errorUpdatePub) return handleErrorClient(res, 400, "Error actualizando publicacion", errorUpdatePub);

        console.log('✅ Publicación actualizada exitosamente');
        handleSuccess(res, 200, "Publicacion actualizada", publicacion);
    } catch (error) {
        console.error('💥 Error en updatePublicacion:', error);
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una públicacion
export async function deletePublicacion(req, res) {
    try{
        const { id_publicacion } = req.query;

        const { error } = publicacionQueryValidation.validate({ id_publicacion });
        if (error) return handleErrorClient(res, 400, "Errror en consulta", error.message);

        const [publicacion, errorDeletePub] = await deletePublicacionService({ id_publicacion });
        if (errorDeletePub) return handleErrorClient(res, 400, "Error eliminando la publicación", errorDeletePub);

        handleSuccess(res, 200, "Publicación eliminada", publicacion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear una publicación
export async function createPublicacion(req, res) {
    try {
        console.log('=== CREAR PUBLICACIÓN (COMO HOME) ===');
        console.log('Body recibido:', req.body);
        
        // Usar la misma lógica que Home.jsx
        const body = {
            titulo: req.body.titulo,
            tipo: req.body.tipo || 'noticia',
            contenido: req.body.contenido,
            estado: req.body.estado || 'pendiente',
            imagen: null // Por ahora sin imagen como en Home
        };

        console.log('Datos a validar:', body);

        // Validar los datos usando Joi
        const { error } = publicacionBodyValidation.validate(body);
        if (error) {
            console.log('Error de validación:', error.message);
            return handleErrorClient(res, 400, "Datos inválidos", error.message);
        }

        console.log('✅ Validación exitosa, creando publicación...');

        // Crear la publicación
        const [publicacion, errorCreatePub] = await createPublicacionService(body);
        if (errorCreatePub) {
            console.log('Error creando publicación:', errorCreatePub);
            return handleErrorClient(res, 404, "Error creando publicacion", errorCreatePub);
        }

        // Enviar notificaciones por email de forma asíncrona
        enviarNotificacionPublicacion(publicacion).catch(error => {
            console.error("Error en el envío de notificaciones de publicación:", error);
        });

        console.log('✅ Publicación creada exitosamente');
        handleSuccess(res, 201, "Publicación creada correctamente y notificaciones enviadas", {
            ...publicacion,
            notificaciones: "Enviando notificaciones por email..."
        });
    } catch (error) {
        console.error('Error inesperado en createPublicacion:', error);
        handleErrorServer(res, 500, error.message);
    }
}



    
