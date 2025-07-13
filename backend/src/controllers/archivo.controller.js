import path from "path";
import { HOST, PORT } from "../config/configEnv.js";
import { getArchivosService, subidaArchivoService } from "../services/archivo.service.js";
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
    const baseUrl = `http://${HOST}:${PORT}/api/src/upload/`;
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