import { AppDataSource } from "../config/configDb.js";
import UsuarioConvocatoria from "../entity/usuario_convocatoria.entity.js";
import Archivo from "../entity/archivo.entity.js";
import fs from 'fs';
import path from 'path';

// Obtiene si un usuario está inscrito en una convocatoria
export async function getUsuarioConvocatoriaService({ id, id_convocatoria }) {
  try {
    const uConvRepository = AppDataSource.getRepository(UsuarioConvocatoria);
    const registro = await uConvRepository.findOneBy({ id , id_convocatoria});

    if (!registro) return [null, "El usuario no está inscrito en esta convocatoria"];
    return [registro, null];
  } catch (error) {
    return [null, error.message];
  }
}

// Inscribe al usuario en una convocatoria
export async function inscribirUsuarioEnConvocatoriaService({ id, id_convocatoria }) {
  try {
    const uConvRepository = AppDataSource.getRepository(UsuarioConvocatoria);

    const uConvFound = await uConvRepository.findOneBy({ id, id_convocatoria });
    if (uConvFound) return [null, "El usuario ya está inscrito en esta convocatoria"];

    const nuevo = uConvRepository.create({ id, id_convocatoria });
    const guardado = await uConvRepository.save(nuevo);
    return [guardado, null];
  } catch (error) {
    return [null, error.message];
  }
}

// Elimina la inscripción de un usuario
export async function eliminarInscripcionConvocatoriaService({ id, id_convocatoria }) {
  try {

    const uConvRepository = AppDataSource.getRepository(UsuarioConvocatoria);
    const result = await uConvRepository.delete({ id, id_convocatoria });

    if (result.affected === 0) return [null, "No se encontró el registro para eliminar"];
    return [result, null];
  } catch (error) {
    return [null, error.message];
    }
}

// Crear postulación con archivos
export async function crearPostulacionConArchivosService({ id_usuario, id_convocatoria, comentarios, archivos }) {
  console.log("Iniciando crearPostulacionConArchivosService con:", { id_usuario, id_convocatoria, comentarios, archivosCount: archivos.length });
  
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const uConvRepository = queryRunner.manager.getRepository(UsuarioConvocatoria);
    const archivoRepository = queryRunner.manager.getRepository(Archivo);

    console.log("Repositorios obtenidos correctamente");

    // Verificar si ya está inscrito
    const existing = await uConvRepository.findOne({
      where: { id: id_usuario, id_convocatoria }
    });

    if (existing) {
      console.log("Usuario ya inscrito con ID:", id_usuario, "en convocatoria:", id_convocatoria);
      await queryRunner.rollbackTransaction();
      return [null, "El usuario ya está inscrito en esta convocatoria"];
    }

    console.log("Creando inscripción...");

    // Crear la inscripción
    const inscripcion = uConvRepository.create({
      id: id_usuario,  // Campo 'id' representa el id_usuario según la entidad
      id_convocatoria,
      comentarios: comentarios || '',
      fecha_inscripcion: new Date()
    });

    const inscripcionGuardada = await uConvRepository.save(inscripcion);
    console.log("Inscripción guardada:", inscripcionGuardada);

    // Guardar archivos
    const archivosGuardados = [];
    
    for (const archivo of archivos) {
      try {
        // Crear directorio si no existe
        const uploadDir = path.join(process.cwd(), 'src', 'upload', 'postulaciones');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const extension = path.extname(archivo.originalname);
        const nombreArchivoSanitizado = archivo.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const nombreArchivo = `${timestamp}-${nombreArchivoSanitizado}`;
        const rutaArchivo = path.join(uploadDir, nombreArchivo);

        // Guardar archivo físicamente (usando buffer para archivos en memoria)
        if (archivo.buffer) {
          fs.writeFileSync(rutaArchivo, archivo.buffer);
        } else {
          throw new Error("No se pudo acceder al buffer del archivo");
        }

        // Guardar metadata en base de datos
        const archivoEntity = archivoRepository.create({
          nombre_archivo: archivo.originalname,
          ruta_archivo: `src/upload/postulaciones/${nombreArchivo}`,
          tipo_archivo: archivo.mimetype,
          tamaño_archivo: archivo.size,
          id_usuario_convocatoria: `${id_usuario}-${id_convocatoria}`, // Clave compuesta como string
          fecha_subida: new Date()
        });

        const archivoGuardado = await archivoRepository.save(archivoEntity);
        archivosGuardados.push(archivoGuardado);
        
        console.log(`Archivo guardado: ${nombreArchivo}`);
      } catch (fileError) {
        console.error(`Error guardando archivo ${archivo.originalname}:`, fileError);
        throw new Error(`Error procesando archivo ${archivo.originalname}: ${fileError.message}`);
      }
    }

    console.log(`Procesados ${archivosGuardados.length} archivos exitosamente`);

    await queryRunner.commitTransaction();
    console.log("Transacción completada exitosamente");

    return [{
      inscripcion: inscripcionGuardada,
      archivos: archivosGuardados
    }, null];

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error en crearPostulacionConArchivosService:", error);
    console.error("Stack trace:", error.stack);
    return [null, `Error interno del servidor: ${error.message}`];
  } finally {
    await queryRunner.release();
  }
}

// Obtener todos los postulantes de una convocatoria con sus archivos
export async function getPostulantesConvocatoriaService(id_convocatoria) {
  try {
    const uConvRepository = AppDataSource.getRepository(UsuarioConvocatoria);
    const archivoRepository = AppDataSource.getRepository(Archivo);

    // Obtener postulantes con información del usuario usando query builder para asegurar joins
    const postulantes = await uConvRepository
      .createQueryBuilder("uc")
      .leftJoinAndSelect("uc.User", "user")
      .where("uc.id_convocatoria = :id_convocatoria", { id_convocatoria: parseInt(id_convocatoria) })
      .getMany();

    if (postulantes.length === 0) {
      return [[], null];
    }

    // Para cada postulante, obtener sus archivos
    const postulantesConArchivos = [];
    
    for (const postulante of postulantes) {
      const claveCompuesta = `${postulante.id}-${postulante.id_convocatoria}`;
      
      const archivos = await archivoRepository.find({
        where: { id_usuario_convocatoria: claveCompuesta }
      });

      postulantesConArchivos.push({
        usuario: {
          id: postulante.User?.id || postulante.id,
          nombre: postulante.User?.nombre || 'No disponible',
          apellido: postulante.User?.apellido || '',
          email: postulante.User?.email || 'No disponible',
          rut: postulante.User?.rut || 'No disponible'
        },
        comentarios: postulante.comentarios,
        fecha_inscripcion: postulante.fecha_inscripcion,
        archivos: archivos
      });
    }

    return [postulantesConArchivos, null];

  } catch (error) {
    console.error("Error obteniendo postulantes:", error);
    return [null, "Error interno del servidor"];
  }
}

// Obtener archivos de un postulante específico
export async function getArchivosPostulanteService(id_usuario, id_convocatoria) {
  try {
    const archivoRepository = AppDataSource.getRepository(Archivo);
    const claveCompuesta = `${id_usuario}-${id_convocatoria}`;
    
    const archivos = await archivoRepository.find({
      where: { id_usuario_convocatoria: claveCompuesta }
    });

    return [archivos, null];

  } catch (error) {
    console.error("Error obteniendo archivos del postulante:", error);
    return [null, "Error interno del servidor"];
  }
}