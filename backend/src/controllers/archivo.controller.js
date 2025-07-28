import path from "path";
import fs from "fs";
import { HOST, PORT } from "../config/configEnv.js";
import { getArchivosService, subidaArchivoService, getArchivoByIdService } from "../services/archivo.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";


export async function subidaArchivo(req, res) {
  try {
    const { nombre } = req.body;
    let archivoPath = req.file?.path;

    if (!archivoPath) {
      return handleErrorClient(res, 400, "Archivo no subido");
    }
    // Construye la URL completa para acceder al archivo subido
    const baseUrl = `http://${HOST}:${PORT}/api/src/upload/actas/`;
    // Obtiene el nombre del archivo y lo añade a la URL base
    archivoPath = baseUrl + path.basename(archivoPath);

    const [newArchivo, error] = await subidaArchivoService({ nombre, archivoPath });

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Archivo subido", newArchivo);
  } catch (error) {
    handleErrorServer(res, 500, "Error subiendo archivo", error.message);
  }
}

export async function getArchivos(req, res) {
  try {
    // Llama al service para obtener todos los archivos desde la base de datos
    const [archivos, error] = await getArchivosService();
    if (error) return handleErrorClient(res, 404, error);

    archivos.length === 0
      ? handleSuccess(res, 200)
      : handleSuccess(res, 200, "Archivos encontrados", archivos);
  } catch (error) {
    handleErrorServer(res, 500, "Error obteniendo archivos", error.message);
  }
}

export async function getArchivo(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return handleErrorClient(res, 400, "ID del archivo es requerido");
    }

    // Obtener información del archivo desde la base de datos
    const [archivo, error] = await getArchivoByIdService(id);
    if (error) {
      return handleErrorClient(res, 404, "Archivo no encontrado", error);
    }

    // Extraer la ruta real del archivo desde la URL almacenada
    let rutaArchivo;
    if (archivo.archivo.includes('http://') || archivo.archivo.includes('https://')) {
      // Si es una URL completa, extraer solo la parte del nombre del archivo
      const nombreArchivo = path.basename(archivo.archivo);
      rutaArchivo = path.join(process.cwd(), 'src', 'upload', 'actas', nombreArchivo);
    } else {
      // Si ya es una ruta relativa
      rutaArchivo = path.resolve(archivo.archivo);
    }

    // Verificar si el archivo existe
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
    }

    // Configurar headers para la descarga
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(archivo.nombre || nombreArchivo)}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Crear stream de lectura y enviarlo al cliente
    const fileStream = fs.createReadStream(rutaArchivo);
    
    fileStream.on('error', (streamError) => {
      console.error('Error leyendo archivo:', streamError);
      if (!res.headersSent) {
        handleErrorServer(res, 500, "Error leyendo el archivo", streamError.message);
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    handleErrorServer(res, 500, "Error obteniendo archivo", error.message);
  }
}

// Función para visualizar archivo en el navegador
export async function viewArchivo(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return handleErrorClient(res, 400, "ID del archivo es requerido");
    }

    // Obtener información del archivo desde la base de datos
    const [archivo, error] = await getArchivoByIdService(id);
    if (error) {
      return handleErrorClient(res, 404, "Archivo no encontrado", error);
    }

    // Extraer la ruta real del archivo desde la URL almacenada
    let rutaArchivo;
    if (archivo.archivo.includes('http://') || archivo.archivo.includes('https://')) {
      const nombreArchivo = path.basename(archivo.archivo);
      rutaArchivo = path.join(process.cwd(), 'src', 'upload', 'actas', nombreArchivo);
    } else {
      rutaArchivo = path.resolve(archivo.archivo);
    }

    // Verificar si el archivo existe
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