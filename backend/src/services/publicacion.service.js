"use strict";
import Publicacion from "../entity/publicacion.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Obtengo publicacion por id o titulo
export async function getPublicacionService(query) {
    try {
        const { id_publicacion, titulo } = query;

        const publicacionRepository = AppDataSource.getRepository(Publicacion);

        const publicacionFound = await publicacionRepository.findOne({
        where: [{ id_publicacion: id_publicacion }, { titulo: titulo }],
        });

        if (!publicacionFound) return [null, "Publicacion no encontrada"];

        return [publicacionFound, null];
    } catch (error) {U
        console.error("Error al obtener la publicacion:", error);
        return [null, "Error interno del servidor"];
    }
}
// Obtengo lista de publicaciones
export async function getPublicacionesService() {
    try {
        const publicacionRepository = AppDataSource.getRepository(Publicacion);

        const publicaciones = await publicacionRepository.find();

        if (!publicaciones || publicaciones.length === 0) return [null, "No hay publicaciones"];

        return [publicaciones, null];
    }catch (error) {
    console.error("Error al obtener las publicaciones:", error);
    return [null, "Error interno del servidor"];
    }
}
// Modifico datos de las publicaciones
export async function updatePublicacionService(query, body) {
  try {
        const { id_publicacion } = query;

        const publicacionRepository = AppDataSource.getRepository(Publicacion);

        const publicacionFound = await publicacionRepository.findOne({
        where: { id_publicacion }
        });

    if (!publicacionFound) return [null, "Publicación no encontrada"];

        const dataUpdate = {
            titulo: body.titulo,
            tipo: body.tipo,
            contenido: body.contenido,
            fecha_publicacion: new Date(),
            estado: body.estado,
            fechaActualizacion: new Date(),
        };
    
    await publicacionRepository.update({ id_publicacion }, dataUpdate);

    const updatedPublicacion = await publicacionRepository.findOne({
        where: { id_publicacion },
    });

    if (!updatedPublicacion)
        return [null, "Publicación no econtrada despúes de actualizar"];

    return [updatedPublicacion, null];
    } catch (error){
    console.error("Error al actualizar la publicación:", error);
    return [null, "Error interno del servidor"];
    }
}
// Elimino publicaciones
export async function deletePublicacionService(query) {
  try {
    const { id_publicacion } = query;

    const publicacionRepository = AppDataSource.getRepository(Publicacion);

    const publicacionFound = await publicacionRepository.findOne({
      where: { id_publicacion }
    });

    if (!publicacionFound) return [null, "Publicación no encontrada"];

    const deletedPublicacion = await publicacionRepository.remove(publicacionFound);

    return [deletedPublicacion, null];
    } catch (error) {
    console.error("Error al eliminar la publicación:", error);
    return [null, "Error interno del servidor"];
  }
}
// Creo publicaciones
export async function createPublicacionService(body) {
    try{
        const publicacionRepository = AppDataSource.getRepository(Publicacion);

        const newPublicacion = publicacionRepository.create ({
            titulo: body.titulo,
            tipo: body.tipo,
            contenido: body.contenido,
            fecha_publicacion: new Date(),
            estado: body.estado || "pendiente",
            fechaActualizacion: new Date()
        });

        await publicacionRepository.save(newPublicacion);

        return [newPublicacion, null];
    } catch(error) {
        console.error("Error al crear la publicación:", error);
        return [null, "Error interno del servidor:"];
    }
}