"use strict";
import UsuarioReunion from "../entity/usuario_reunion.entity.js";
import Reunion from "../entity/reunion.entity.js";
import Token from "../entity/token.entity.js";
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
            lugar: body.titulo,
            descripcion: body.descripcion,
            fecha_reunion: body.fecha_reunion,
            objetivo: body.objetivo,
            observaciones: body.observaciones,
            fechaActualizacion: new Date(),
        };
    
        await reunionRepository.update({ id_reunion }, dataUpdate);

        const updatedReunion = await publicacionRepository.findOne({
        where: { id_reunion },
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
        where: { id_reunion}
        });

        if (!reunionFound) return [null, "Publicación no encontrada"];

        const deletedReunion = await reunionRepository.remove(reunionFound);

        return [deletedReunion, null];
    } catch (error) {
        console.error("Error al eliminar la reunión:", error);
        return [null, "Error interno del servidor"];
    }
}
// Crear reunion
export async function createPublicacionService(body) {
    try{
        const reunionRepository = AppDataSource.getRepository(Reunion);

        const newReunion = reunionRepository.create ({
            lugar: body.titulo,
            descripcion: body.descripcion,
            fecha_reunion: body.fecha_reunion,
            objetivo: body.objetivo,
            observaciones: body.observaciones,
            fechaActualizacion: new Date(),
        });

        await reunionRepository.save(newReunion);

        return [newReunion, null];
    } catch(error) {
        console.error("Error al crear Reunión:", error);
        return [null, "Error interno del servidor:"];
    }
}

//Registrar asistencia a una reunion con token  (Funcion adicional a las básicas)

export async function registrarAsistenciaService(query) {
    try{
        const {id_usuario, id_reunion, numero_token} = query;

        const urRepository = AppDataSource.getRepository(UsuarioReunion);
        const tokenRepository = AppDataSource.getRepository(Token);

        //Verifico que el token sea valido
        const tokenFound = await tokenRepository.findOne({
            where: [{ numero_token: numero_token }, { id_reunion: id_reunion }],
        });

        if (!tokenFound) return [null, "Token inválido o proceso de asistencia cerrado."];
        
        //Verificar si el usuario se encuentra habilitado para marcar asistencia.
        const urFound = await urRepository.findOne({
            where: [{ id_usuario: id_usuario }, { id_reunion: id_reunion }],
        });
        if (!urFound) return [null, "Usuario no habilitado para reunión"];

        //verificar si el usuario ya marco asistencia.
        if (urFound.asistio) return [null, "Usuario ya registro su asistencia anteiormente"];

        //Marcar asistencia.
        urFound.asistio = true;
        urFound.fecha_confirmacion_asistencia = new Date();
        urFound.id_token = tokenFound.id_token;

        const asistenciaConfirmada = await urRepository.save(urFound);
        return [asistenciaConfirmada, null];
    } catch {
        return [null, error.messsage];
    }
}