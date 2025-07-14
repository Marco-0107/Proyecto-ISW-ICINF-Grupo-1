"use strict";

import Archivo from "../entity/archivo.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function subidaArchivoService(archivoData) {
  try {
    // Obtiene el repositorio de la entidad Archivo a través de TypeORM
    const archivoRepository = AppDataSource.getRepository(Archivo);
    // Extrae el nombre del archivo y la ruta donde se almacenó
    const { nombre, archivoPath } = archivoData;
    console.log("Datos recibidos para guardar en la base de datos:", { nombre, archivoPath });

    // Crea una nueva instancia de la entidad Archivo con los datos recibidos
    const newArchivo = archivoRepository.create({
      nombre,
      archivo: archivoPath, // Almacena la ruta del archivo, no el contenido
    });
    // Guarda la nueva instancia en la base de datos
    await archivoRepository.save(newArchivo);
    // Retorna el archivo creado y null para indicar que no hubo errores
    return [newArchivo, null];
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getArchivosService() {
  try {
    // Obtiene el repositorio de la entidad Archivo
    const archivoRepository = AppDataSource.getRepository(Archivo);

    const archivos = await archivoRepository.find();
    // Retorna los archivos encontrados y null para indicar que no hubo errores
    return [archivos, null];
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    return [null, "Error interno del servidor"];
  }
}