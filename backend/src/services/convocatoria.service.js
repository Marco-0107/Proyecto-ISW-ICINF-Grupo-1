"use strict";
import Convocatoria from "../entity/convocatoria.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Obtener una convocatoria por ID
export async function getconvocatoriaService({ id_convocatoria }) {
    try {
        const convocatoriaRepository = AppDataSource.getRepository(Convocatoria);

        const convocatoriaFound = await convocatoriaRepository.findOne({
        where: [{ id_convocatoria: id_convocatoria}],
        });

        if (!convocatoriaFound) return [null, "Convocatoria no encontrada"];

        return [convocatoriaFound, null];

    } catch (error) {
        console.error("Error al obtener la Convocatoria", error);
        return [null, "Error interno del servidor"];
  }
}
// Obtengo lista de cuotas
export async function getconvocatoriasService() {
    try {
        const convocatoriaRepository = AppDataSource.getRepository(Convocatoria);

        const convocatorias = await convocatoriaRepository.find();

        if (!convocatorias || convocatorias.length === 0) return [null, "No hay convocatorias"];

        return [convocatorias, null];

    } catch (error) {
        console.error("Error al obtener las convocatorias:", error);
        return [null, "Error interno del servidor"];
    }
}
// Modifico datos de las convocatorias
export async function updateconvocatoriaService(query, body) {
    try {
        const { id_convocatoria } = query;

        const convocatoriaRepository = AppDataSource.getRepository(Convocatoria);

        const convocatoriaFound = await convocatoriaRepository.findOne({
        where: { id_convocatoria }
        });

        if (!convocatoriaFound) return [null, "Convocataria no encontrada"];

        const dataUpdate = {
            titulo: body.titulo,
            descripcion: body.descripcion,
            requisitos: body.requisitos,
            fecha_inicio: body.fecha_inicio,
            fecha_cierre: body.fecha_cierre,
            estado: body.estado,
            fechaActualizacion: new Date(),
        };
    
        await convocatoriaRepository.update({ id_convocatoria }, dataUpdate);

        

        return [dataUpdate, null];
    } catch (error){
        console.error("Error al actualizar la Convocatoria:", error);
        return [null, "Error interno del servidor"];
    }
}
// Eliminar convocatoria
export async function deleteconvocatoriaService(query) {
    try {
        const { id_convocatoria } = query;

        const convocatoriaRepository = AppDataSource.getRepository(Convocatoria);

        const convocatoriaFound = await convocatoriaRepository.findOne({
        where: { id_convocatoria : id_convocatoria }
        });

        if (!convocatoriaFound) return [null, "Convocatoria no encontrada"];

        const deletedConvocatoria = await convocatoriaRepository.remove(convocatoriaFound);

        return [deletedConvocatoria, null];
    } catch (error) {
        console.error("Error al eliminar la convocatoria:", error);
        return [null, "Error interno del servidor"];
    }
}
// Crear Convocatoria
export async function createconvocatoriaService(body) {
    try{
        const convocatoriaRepository = AppDataSource.getRepository(Convocatoria);
        const newConvocatoria = convocatoriaRepository.create ({
            titulo: body.titulo,
            descripcion: body.descripcion,
            requisitos: body.requisitos,
            fecha_inicio: body.fecha_inicio,
            fecha_cierre: body.fecha_cierre,
            estado: body.estado,
            fechaActualizacion: new Date()
        });
        const saveConvocatoria = await convocatoriaRepository.save(newConvocatoria);

        return [saveConvocatoria, null];
    } catch(error) {
            console.error("Error al crear la Convocatoria:", error);
        return [null, "Error interno del servidor:"];
    }
}
