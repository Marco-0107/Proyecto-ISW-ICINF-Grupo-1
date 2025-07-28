"use strict";
import UsuarioReunion from "../entity/usuario_reunion.entity.js";
import Reunion from "../entity/reunion.entity.js";
import Usuario from "../entity/user.entity.js"
import { AppDataSource } from "../config/configDb.js";

// Obtener una reunion por ID
export async function getReunionService({ id_reunion }) {
    try {
        const reunionRepository = AppDataSource.getRepository(Reunion);

        const reunionFound = await reunionRepository.findOne({
        where: [{ id_reunion: id_reunion }],
        });

        if (!reunionFound) return [null, "Reunion no encontrado"];

        return [reunionFound, null];

    } catch (error) {
        console.error("Error obtener la reunion", error);
        return [null, "Error interno del servidor"];
  }
}
// Obtengo lista de reuniones
export async function getReunionesService() {
    try {
        const reunionRepository = AppDataSource.getRepository(Reunion);

        const reuniones = await reunionRepository.find();

        if (!reuniones || reuniones.length === 0) return [null, "No hay reuniones"];

        return [reuniones, null];

    } catch (error) {
        console.error("Error al obtener las reuniones:", error);
        return [null, "Error interno del servidor"];
    }
}
// Modifico datos de las reuniones
export async function updateReunionService(query, body) {
    try {
        const { id_reunion } = query;

        const reunionRepository = AppDataSource.getRepository(Reunion);

        const reunionFound = await reunionRepository.findOne({
        where: { id_reunion }
        });

        if (!reunionFound) return [null, "Reunión no encontrada"];

        const dataUpdate = {
            fechaActualizacion: new Date(),
        };

        if (body.lugar !== undefined) dataUpdate.lugar = body.lugar;
        if (body.descripcion !== undefined) dataUpdate.descripcion = body.descripcion;
        if (body.fecha_reunion !== undefined) dataUpdate.fecha_reunion = body.fecha_reunion;
        if (body.observaciones !== undefined) dataUpdate.observaciones = body.observaciones;
    
        await reunionRepository.update({ id_reunion }, dataUpdate);

        const updatedReunion = await reunionRepository.findOne({
        where: { id_reunion:id_reunion },
        });

        if (!updatedReunion)
        return [null, "Reunión no econtrada despúes de actualizar"];

        return [updatedReunion, null];
    } catch (error){
        console.error("Error al actualizar la reunión:", error);
        return [null, "Error interno del servidor"];
    }
}
// Eliminar reunion
export async function deleteReunionService(query) {
    try {
        const { id_reunion } = query;

        const reunionRepository = AppDataSource.getRepository(Reunion);

        const reunionFound = await reunionRepository.findOne({
        where: { id_reunion: id_reunion}
        });

        if (!reunionFound) return [null, "Reunion no encontrada"];

        const deletedReunion = await reunionRepository.remove(reunionFound);

        return [deletedReunion, null];
    } catch (error) {
        console.error("Error al eliminar la reunión:", error);
        return [null, "Error interno del servidor"];
    }
}
// Agregar el acta a la reunion
    export async function updateArchivoActaService(id_reunion, archivo_acta) {
        try {
        const reunionRepository = AppDataSource.getRepository(Reunion);

        const reunion = await reunionRepository.findOne({ where: { id_reunion } });
        if (!reunion) return [null, "Reunión no encontrada"];

        reunion.archivo_acta = archivo_acta;
        await reunionRepository.save(reunion);

        return [reunion, null];
  } catch (error) {
    console.error("Error al actualizar el acta:", error);
    return [null, "Error interno del servidor"];
  }
}

// Crear reunion y asignarla a todos los vecinos
export async function createReunionService(body) {
        const reunionRepository = AppDataSource.getRepository(Reunion);
        const UsuarioRepository = AppDataSource.getRepository(Usuario)
        const urRepository = AppDataSource.getRepository(UsuarioReunion)

    try{
        
        // Crear la reunión

        const newReunion = reunionRepository.create ({
            lugar: body.lugar,
            descripcion: body.descripcion,
            fecha_reunion: body.fecha_reunion,
            observaciones: body.observaciones || null,
            fechaActualizacion: new Date()
        });
        const saveReunion = await reunionRepository.save(newReunion);

        // Obtener usuarios con rol de vecino y que esten activos

        const vecinos_habilitados = await UsuarioRepository.find ({ where : { rol: "vecino", estado_activo: true } });

        // Asignar la reunion a todos los vecinos
        const asignar_reunion= vecinos_habilitados.map(vecino => { 
        
        return urRepository.create({        //Recorro mi array uno por uno con el .map luego para cada vecino creamos un UsuarioReunion 
            id_usuario: vecino.id,
            id_reunion: saveReunion.id_reunion,
            asistio: "false",
            id_token: null,
            fecha_confirmacion_asistencia: new Date()
            });
        });

        await urRepository.save(asignar_reunion);

        return [saveReunion, null];
    } catch(error) {
            console.error("Error al asignar la reunión:", error);
        return [null, "Error interno del servidor:"];
    }
}