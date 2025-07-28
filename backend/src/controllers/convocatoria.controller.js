"use strict"

import path from "path";
import fs from "fs";
import { HOST, PORT } from "../config/configEnv.js";
import {
    getconvocatoriaService,
    getconvocatoriasService,
    updateconvocatoriaService,
    deleteconvocatoriaService,
    createconvocatoriaService,
    updateArchivoConvocatoriaService
} from "../services/convocatoria.service.js";

import { sendEmail } from "../services/email.service.js";
import { subidaArchivoService, getArchivoByIdService } from "../services/archivo.service.js";

import {
    convocatoriaBodyValidation,
    convocatoriaQueryValidation,
} from "../validations/convocatoria.validation.js"

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entity/user.entity.js";

// Función para enviar notificación de nueva convocatoria
const enviarNotificacionConvocatoria = async (convocatoria) => {
    try {
        // Obtener todos los vecinos activos
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const vecinos = await usuarioRepository.find({ 
            where: { rol: "vecino", estado_activo: true }
        });

        // Formatear la fecha de la convocatoria
        const fechaConvocatoria = new Date(convocatoria.fecha_convocatoria);
        const fechaFormateada = fechaConvocatoria.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const subject = `📢 Nueva Convocatoria - ${convocatoria.titulo}`;
        
        const mensaje = `Se ha publicado una nueva convocatoria de la Junta de Vecinos.

📢 CONVOCATORIA: ${convocatoria.titulo}

📅 Fecha y Hora: ${fechaFormateada}
📝 Descripción: ${convocatoria.descripcion}

Te invitamos a participar y estar atento a los detalles.

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
                            <div style="background: linear-gradient(135deg, #4ade80, #22c55e); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px;">📢 Nueva Convocatoria</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Junta de Vecinos</p>
                            </div>
                            <div style="background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px; margin-bottom: 25px;">¡Hola <strong>${vecino.nombre}</strong>!</p>
                                <p style="font-size: 16px; margin-bottom: 20px;">Se ha publicado una nueva convocatoria:</p>
                                
                                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
                                    <h3 style="color: #16a34a; margin-top: 0;">📋 ${convocatoria.titulo}</h3>
                                    <p style="margin: 10px 0;"><strong>📅 Fecha y Hora:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 10px 0;"><strong>📝 Descripción:</strong></p>
                                    <p style="margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">${convocatoria.descripcion}</p>
                                </div>
                                
                                <p style="text-align: center; margin: 25px 0;">
                                    <strong>Te invitamos a participar y estar atento a los detalles.</strong>
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
                    console.log(`✅ Email de convocatoria enviado a: ${vecino.email}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando email a ${vecino.email}:`, emailError.message);
                }
            }
        });

        // Esperar a que se envíen todos los emails
        await Promise.allSettled(promesasEmail);
        console.log(`📧 Notificaciones de convocatoria enviadas a ${vecinos.length} vecinos`);
        
    } catch (error) {
        console.error("Error al enviar notificaciones de convocatoria:", error.message);
    }
};
// Obtengo Convocatoria por id o titulo
export async function getConvocatoria(req, res) {
    try {
        const { id_convocatoria } = req.query;

        const { error } = convocatoriaQueryValidation.validate({ id_convocatoria});
        if (error) return handleErrorClient(res, 400, error.message);

        const [convocatoria, errorConvocatoria] = await getconvocatoriaService({ id_convocatoria });
        if (errorConvocatoria) return handleErrorClient(res, 404, errorConvocatoria);

        handleSuccess(res, 200, "Convocatoria encontrada", convocatoria);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
 }
// Listo todas las convocatorias 
 export async function getConvocatorias (req, res) {
    try {
        const [convocatorias, errorConvocatorias] = await getconvocatoriasService();
        if(errorConvocatorias) return handleErrorClient(res, 404, errorConvocatorias)

        convocatorias.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "Convocatorias encontradas", convocatorias);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Actualizar las convocatorias
export async function updateConvocatoria(req, res) {
    try{
        const { id_convocatoria} = req.query;
        const { body } = req;

        const { error: queryError } = convocatoriaQueryValidation.validate({ id_convocatoria });
        if (queryError) return handleErrorClient(res, 400, "Error en consulta", queryError.message);

        const { error: bodyError } = convocatoriaBodyValidation.validate(body);
        if (bodyError) return handleErrorClient(res, 400, "Error en datos", bodyError.message);
        
        const [convocatoria, errorUpdateConvocatoria] = await updateconvocatoriaService({ id_convocatoria }, body);
        if (errorUpdateConvocatoria) return handleErrorClient(res, 400, "Error actualizando la Convocatoria", errorUpdateConvocatoria);

        handleSuccess(res, 200, "Convocatoria actualizada", convocatoria);
    }catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Eliminar una Cuota
export async function deleteConvocatoria(req, res) {
    try{
        const { id_convocatoria } = req.query;

        const { error } = convocatoriaQueryValidation.validate({ id_convocatoria });
        if (error) return handleErrorClient(res, 400, "Errror en consulta", error.message);

        const [convocatoria, errorDeleteConvocatoria] = await deleteconvocatoriaService({ id_convocatoria });
        if (errorDeleteConvocatoria) return handleErrorClient(res, 400, "Error eliminando la Convocatoria", errorDeleteConvocatoria);

        handleSuccess(res, 200, "Convocatoria eliminada", convocatoria);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
// Crear una Convocatoria
export async function createConvocatoria(req, res) {
    try{
        const { body } = req;

        const { error } = convocatoriaBodyValidation.validate(body);
        if (error) return handleErrorClient(res, 400, "Datos invalidos", error.message);

        const [convocatoria, errorCreateConvocatoria] = await createconvocatoriaService(body);
        if (errorCreateConvocatoria) return handleErrorClient(res, 404, "Error creando Convocatoria", errorCreateConvocatoria);

        // Enviar notificaciones por email de forma asíncrona
        enviarNotificacionConvocatoria(convocatoria).catch(error => {
            console.error("Error en el envío de notificaciones de convocatoria:", error);
        });

        handleSuccess(res, 201, "Convocatoria creada correctamente y notificaciones enviadas", {
            ...convocatoria,
            notificaciones: "Enviando notificaciones por email..."
        });
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Cargar archivo a la convocatoria
export async function cargarArchivoConvocatoria(req, res) {
  try {
    const { id_convocatoria } = req.params;
    let archivoPath = req.file?.path;
    const usuario = req.user; // Usuario autenticado

    console.log("Usuario cargando archivo:", { 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol 
    });
    console.log("Archivo recibido:", req.file?.originalname);

    if (!archivoPath) {
      return handleErrorClient(res, 400, "Archivo no subido");
    }

    if (!id_convocatoria) {
      return handleErrorClient(res, 400, "ID de convocatoria es requerido");
    }

    // Verificar que la convocatoria existe
    const convocatoriaRepository = AppDataSource.getRepository("Convocatoria");
    const convocatoria = await convocatoriaRepository.findOne({ 
      where: { id_convocatoria: parseInt(id_convocatoria) } 
    });

    if (!convocatoria) {
      return handleErrorClient(res, 404, "Convocatoria no encontrada");
    }

    // Construir el nombre del archivo con información de la convocatoria y usuario
    const extension = path.extname(req.file.originalname);
    const fechaActual = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const nombreArchivoSanitizado = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const nombreArchivo = `Convocatoria-${convocatoria.id_convocatoria}-${usuario.rol}-${fechaActual}-${nombreArchivoSanitizado}`;

    // Guardar el archivo en el sistema de archivos
    const baseUrl = `http://${HOST}:${PORT}/api/src/upload/convocatorias/`;
    const archivoUrl = baseUrl + path.basename(archivoPath);

    console.log("Guardando archivo:", { nombreArchivo, archivoUrl });

    // Crear registro en la tabla de archivos
    const [archivoCreado, errorArchivo] = await subidaArchivoService({ 
      nombre: nombreArchivo, 
      archivoPath: archivoUrl 
    });

    if (errorArchivo) {
      console.error("Error guardando archivo:", errorArchivo);
      return handleErrorClient(res, 500, "Error guardando información del archivo", errorArchivo);
    }

    // Solo admin, presidenta y secretario pueden reemplazar el archivo oficial de la convocatoria
    if (["admin", "presidenta", "secretario"].includes(usuario.rol)) {
      const [convocatoriaActualizada, errorConvocatoria] = await updateArchivoConvocatoriaService(id_convocatoria, archivoCreado.id);
      
      if (errorConvocatoria) {
        console.error("Error asociando archivo:", errorConvocatoria);
        return handleErrorClient(res, 500, "Error asociando archivo a la convocatoria", errorConvocatoria);
      }

      console.log("Archivo oficial de convocatoria actualizado");
      
      handleSuccess(res, 200, "Archivo oficial cargado correctamente", {
        convocatoria: convocatoriaActualizada,
        archivo: archivoCreado
      });
    } else {
      // Para vecinos y tesoreras, solo guardar el archivo sin asociarlo oficialmente
      console.log("Archivo complementario guardado");
      
      handleSuccess(res, 200, "Archivo complementario cargado correctamente", {
        mensaje: "Archivo guardado como documento complementario",
        archivo: archivoCreado,
        nota: "Este archivo no reemplaza el documento oficial de la convocatoria"
      });
    }

  } catch (error) {
    console.error("Error en cargarArchivoConvocatoria:", error);
    handleErrorServer(res, 500, "Error cargando archivo", error.message);
  }
}

// Descargar archivo de convocatoria
export async function descargarArchivoConvocatoria(req, res) {
  try {
    const { id_convocatoria } = req.params;

    if (!id_convocatoria) {
      return handleErrorClient(res, 400, "ID de convocatoria es requerido");
    }

    // Obtener la convocatoria con el ID del archivo
    const convocatoriaRepository = AppDataSource.getRepository("Convocatoria");
    const convocatoria = await convocatoriaRepository.findOne({ 
      where: { id_convocatoria: parseInt(id_convocatoria) } 
    });

    if (!convocatoria) {
      return handleErrorClient(res, 404, "Convocatoria no encontrada");
    }

    if (!convocatoria.archivo_convocatoria) {
      return handleErrorClient(res, 404, "Esta convocatoria no tiene archivo cargado");
    }

    // Obtener información del archivo
    const [archivo, error] = await getArchivoByIdService(convocatoria.archivo_convocatoria);
    if (error) {
      return handleErrorClient(res, 404, "Archivo no encontrado", error);
    }

    // Extraer la ruta real del archivo
    let rutaArchivo;
    if (archivo.archivo.includes('http://') || archivo.archivo.includes('https://')) {
      const nombreArchivo = path.basename(archivo.archivo);
      rutaArchivo = path.join(process.cwd(), 'src', 'upload', 'convocatorias', nombreArchivo);
    } else {
      rutaArchivo = path.resolve(archivo.archivo);
    }

    // Verificar si el archivo existe físicamente
    if (!fs.existsSync(rutaArchivo)) {
      return handleErrorClient(res, 404, "Archivo físico no encontrado. Por favor, vuelva a cargar el archivo.");
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
      console.error('Error leyendo archivo de convocatoria:', streamError);
      if (!res.headersSent) {
        handleErrorServer(res, 500, "Error leyendo el archivo", streamError.message);
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    handleErrorServer(res, 500, "Error descargando archivo", error.message);
  }
}

// Función para visualizar archivo en el navegador
export async function viewArchivoConvocatoria(req, res) {
  try {
    const { id_convocatoria } = req.params;

    if (!id_convocatoria) {
      return handleErrorClient(res, 400, "ID de convocatoria es requerido");
    }

    // Obtener la convocatoria con el ID del archivo
    const convocatoriaRepository = AppDataSource.getRepository("Convocatoria");
    const convocatoria = await convocatoriaRepository.findOne({ 
      where: { id_convocatoria: parseInt(id_convocatoria) } 
    });

    if (!convocatoria) {
      return handleErrorClient(res, 404, "Convocatoria no encontrada");
    }

    if (!convocatoria.archivo_convocatoria) {
      return handleErrorClient(res, 404, "Esta convocatoria no tiene archivo cargado");
    }

    // Obtener información del archivo
    const [archivo, error] = await getArchivoByIdService(convocatoria.archivo_convocatoria);
    if (error) {
      return handleErrorClient(res, 404, "Archivo no encontrado", error);
    }

    // Extraer la ruta real del archivo
    let rutaArchivo;
    if (archivo.archivo.includes('http://') || archivo.archivo.includes('https://')) {
      const nombreArchivo = path.basename(archivo.archivo);
      rutaArchivo = path.join(process.cwd(), 'src', 'upload', 'convocatorias', nombreArchivo);
    } else {
      rutaArchivo = path.resolve(archivo.archivo);
    }

    // Verificar si el archivo existe físicamente
    if (!fs.existsSync(rutaArchivo)) {
      return handleErrorClient(res, 404, "Archivo físico no encontrado en el servidor");
    }

    // Obtener información del archivo
    const stats = fs.statSync(rutaArchivo);
    const nombreArchivo = path.basename(rutaArchivo);
    
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

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const fileStream = fs.createReadStream(rutaArchivo);
    
    fileStream.on('error', (streamError) => {
      console.error('Error leyendo archivo:', streamError);
      if (!res.headersSent) {
        handleErrorServer(res, 500, "Error leyendo el archivo", streamError.message);
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    handleErrorServer(res, 500, "Error visualizando archivo", error.message);
  }
}