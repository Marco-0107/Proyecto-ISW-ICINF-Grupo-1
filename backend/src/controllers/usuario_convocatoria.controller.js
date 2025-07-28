"use strict"

import {
    getUsuarioConvocatoriaService,
    inscribirUsuarioEnConvocatoriaService,
    eliminarInscripcionConvocatoriaService,
    crearPostulacionConArchivosService,
    getPostulantesConvocatoriaService,
    getArchivosPostulanteService
} from "../services/usuario_convocatoria.service.js";

import {
    usuarioConvocatoriaQueryValidation,
    usuarioConvocatoriaBodyValidation,
} from "../validations/usuario_convocatoria.validation.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

// Obtiene si un usuario está inscrito en una convocatoria

export async function getUsuarioConvocatoria(req, res) {
    try {
        const { id, id_convocatoria } = req.query;

        const { error } = usuarioConvocatoriaQueryValidation.validate({ id, id_convocatoria });

        if (error) return handleErrorClient(res, 400, error.message);

        const [registro, errorUConv] = await getUsuarioConvocatoriaService({ id, id_convocatoria });

        if (errorUConv) return handleErrorClient(res, 404, errorUConv);

        handleSuccess(res, 200, "Inscripción encontrada", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Inscribe a un usuario en una convocatoria
export async function inscribirUsuarioEnConvocatoria(req, res) {
    try {
        const { error } = usuarioConvocatoriaBodyValidation.validate(req.body);

        if (error) return handleErrorClient(res, 400, error.message);

        const [registro, errorCreateUConv] = await inscribirUsuarioEnConvocatoriaService(req.body);

        if (errorCreateUConv) return handleErrorClient(res, 400, errorCreateUConv);

        handleSuccess(res, 201, "Usuario inscrito correctamente", registro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Elimina la inscripción de un usuario en una convocatoria
export async function eliminarInscripcionConvocatoria(req, res) {
    try {
        const { id, id_convocatoria } = req.query; 

        const { error } = usuarioConvocatoriaQueryValidation.validate({ id, id_convocatoria });

        if (error) return handleErrorClient(res, 400, error.message);

        const [eliminado, errorDeleteUConv] = await eliminarInscripcionConvocatoriaService({ id, id_convocatoria });
        
        if (errorDeleteUConv) return handleErrorClient(res, 400, errorDeleteUConv);

        handleSuccess(res, 200, "Inscripción eliminada correctamente", eliminado);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Crear postulación con archivos
export async function crearPostulacionConArchivos(req, res) {
    try {
        const { id_usuario, id_convocatoria, comentarios } = req.body;
        const archivos = req.files || [];

        console.log("Datos recibidos:", { id_usuario, id_convocatoria, comentarios });
        console.log("Archivos recibidos:", archivos.length);

        // Validar datos básicos
        if (!id_usuario || !id_convocatoria) {
            return handleErrorClient(res, 400, "ID de usuario y convocatoria son requeridos");
        }

        // Validar que los IDs sean números válidos
        const userIdNum = parseInt(id_usuario);
        const convIdNum = parseInt(id_convocatoria);

        if (isNaN(userIdNum) || isNaN(convIdNum)) {
            return handleErrorClient(res, 400, "Los IDs deben ser números válidos");
        }

        if (archivos.length === 0) {
            return handleErrorClient(res, 400, "Debe subir al menos un archivo");
        }

        // Validar que todos los archivos sean PDF
        const invalidFiles = archivos.filter(file => file.mimetype !== 'application/pdf');
        if (invalidFiles.length > 0) {
            return handleErrorClient(res, 400, "Todos los archivos deben ser PDF");
        }

        const postulacionData = {
            id_usuario: userIdNum,
            id_convocatoria: convIdNum,
            comentarios: comentarios || '',
            archivos
        };

        console.log("Datos procesados:", postulacionData);

        const [postulacion, errorCreate] = await crearPostulacionConArchivosService(postulacionData);

        if (errorCreate) {
            console.error("Error del servicio:", errorCreate);
            return handleErrorClient(res, 400, errorCreate);
        }

        handleSuccess(res, 201, "Postulación enviada correctamente", postulacion);
    } catch (error) {
        console.error("Error en crearPostulacionConArchivos:", error);
        handleErrorServer(res, 500, error.message);
    }
}

// Obtener todos los postulantes de una convocatoria
export async function getPostulantesConvocatoria(req, res) {
    try {
        const { id_convocatoria } = req.params;

        if (!id_convocatoria) {
            return handleErrorClient(res, 400, "ID de convocatoria es requerido");
        }

        const [postulantes, error] = await getPostulantesConvocatoriaService(id_convocatoria);

        if (error) {
            return handleErrorClient(res, 500, error);
        }

        if (postulantes.length === 0) {
            return handleSuccess(res, 200, "No hay postulantes para esta convocatoria", []);
        }

        handleSuccess(res, 200, "Postulantes encontrados", postulantes);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Obtener archivos de un postulante específico
export async function getArchivosPostulante(req, res) {
    try {
        const { id_usuario, id_convocatoria } = req.params;

        if (!id_usuario || !id_convocatoria) {
            return handleErrorClient(res, 400, "ID de usuario y convocatoria son requeridos");
        }

        const [archivos, error] = await getArchivosPostulanteService(id_usuario, id_convocatoria);

        if (error) {
            return handleErrorClient(res, 500, error);
        }

        handleSuccess(res, 200, "Archivos encontrados", archivos);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Descargar archivo específico de postulante
export async function descargarArchivoPostulante(req, res) {
    try {
        const { id_archivo } = req.params;
        
        if (!id_archivo) {
            return handleErrorClient(res, 400, "ID de archivo es requerido");
        }

        // Usar el servicio de archivos para obtener el archivo
        const { getArchivoByIdService } = await import("../services/archivo.service.js");
        const [archivo, error] = await getArchivoByIdService(id_archivo);
        
        if (error) {
            return handleErrorClient(res, 404, "Archivo no encontrado", error);
        }

        // Construir la ruta del archivo
        const path = await import("path");
        const fs = await import("fs");
        
        let rutaArchivo;
        if (archivo.ruta_archivo) {
            rutaArchivo = path.join(process.cwd(), archivo.ruta_archivo);
        } else if (archivo.archivo && archivo.archivo.includes('postulaciones')) {
            const nombreArchivo = path.basename(archivo.archivo);
            rutaArchivo = path.join(process.cwd(), 'src', 'upload', 'postulaciones', nombreArchivo);
        } else {
            return handleErrorClient(res, 404, "Ruta de archivo no válida");
        }

        // Verificar si el archivo existe físicamente
        if (!fs.existsSync(rutaArchivo)) {
            return handleErrorClient(res, 404, "Archivo físico no encontrado");
        }

        // Obtener información del archivo
        const stats = fs.statSync(rutaArchivo);
        const nombreArchivo = archivo.nombre_archivo || path.basename(rutaArchivo);
        
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
            console.error('Error leyendo archivo de postulante:', streamError);
            if (!res.headersSent) {
                handleErrorServer(res, 500, "Error leyendo el archivo", streamError.message);
            }
        });

        fileStream.pipe(res);

    } catch (error) {
        handleErrorServer(res, 500, "Error descargando archivo", error.message);
    }
}

// Descargar todos los archivos de una convocatoria en ZIP
export async function descargarArchivosConvocatoriaZip(req, res) {
    try {
        const { id_convocatoria } = req.params;

        if (!id_convocatoria) {
            return handleErrorClient(res, 400, "ID de convocatoria es requerido");
        }

        const [postulantes, error] = await getPostulantesConvocatoriaService(id_convocatoria);

        if (error) {
            return handleErrorClient(res, 500, error);
        }

        if (postulantes.length === 0) {
            return handleErrorClient(res, 404, "No hay postulaciones para esta convocatoria");
        }

        // Por ahora, retornar la lista de archivos para descargar individualmente
        // TODO: Implementar descarga ZIP cuando se instale archiver
        const listaArchivos = [];
        
        for (const postulante of postulantes) {
            for (const archivo of postulante.archivos) {
                listaArchivos.push({
                    id_archivo: archivo.id_archivo,
                    nombre_archivo: archivo.nombre_archivo,
                    usuario: `${postulante.usuario.nombre} ${postulante.usuario.apellido}`,
                    rut: postulante.usuario.rut,
                    url_descarga: `/api/usuario-convocatoria/descargar-archivo/${archivo.id_archivo}`
                });
            }
        }

        handleSuccess(res, 200, "Lista de archivos para descarga", {
            mensaje: "Descarga individual disponible. ZIP requiere instalación de archiver",
            archivos: listaArchivos,
            total_archivos: listaArchivos.length,
            total_postulantes: postulantes.length
        });

    } catch (error) {
        console.error("Error obteniendo lista de archivos:", error);
        handleErrorServer(res, 500, "Error obteniendo archivos", error.message);
    }
}