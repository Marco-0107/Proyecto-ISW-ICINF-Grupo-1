"use strict";
import CuotasVecinales from "../entity/cuotas_vecinales.entity.js";
import Usuario from "../entity/user.entity.js";
import UsuarioCuota from "../entity/Usuario_cuota.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Obtener una reunion por ID
export async function getcuota_vecinalService({ id_cuota }) {
    try {
        const cuotaRepository = AppDataSource.getRepository(Cuota);

        const cuotaFound = await cuotaRepository.findOne({
        where: [{ id_cuota: id_cuota }],
        });

        if (!cuotaFound) return [null, "Cuota no encontrada"];

        return [cuotaFound, null];

    } catch (error) {
        console.error("Error al obtener la cuota", error);
        return [null, "Error interno del servidor"];
  }
}
// Obtengo lista de cuotas
export async function getcuotas_vecinalesService() {
    try {
        const cuotasRepository = AppDataSource.getRepository(Cuotas);

        const cuotas = await cuotasRepository.find();

        if (!reuniones || reuniones.length === 0) return [null, "No hay reuniones"];

        return [reuniones, null];

    } catch (error) {
        console.error("Error al obtener las reuniones:", error);
        return [null, "Error interno del servidor"];
    }
}
// Modifico datos de las cuotas
export async function updatecuotas_vecinalesService(query, body) {
    try {
        const { id_cuota } = query;

        const cuotaRepository = AppDataSource.getRepository(Cuota);

        const cuotaFound = await cuotaRepository.findOne({
        where: { id_reunion }
        });

        if (!cuotaFound) return [null, "Cuota no encontrada"];

        const dataUpdate = {
            monto_c: body.monto_c,
            fecha_emision: body.fecha_emision,
            fechaActualizacion: new Date(),
        };
    
        await cuotaRepository.update({ id_cuota }, dataUpdate);

        const updatedCuota = await cuotaRepository.findOne({
        where: { id_cuota },
        });

        if (!updatedCuota)
        return [null, "Cuota no econtrada despúes de actualizar"];

        return [updatedCuota, null];
    } catch (error){
        console.error("Error al actualizar la Cuota:", error);
        return [null, "Error interno del servidor"];
    }
}
// Eliminar reunion
export async function deletecuotas_vecinalesService(query) {
    try {
        const { id_cuota } = query;

        const cuotaRepository = AppDataSource.getRepository(Reunion);

        const cuotaFound = await cuotaRepository.findOne({
        where: { id_cuota }
        });

        if (!cuotaFound) return [null, "Cuota no encontrada"];

        const deletedCuota = await cuotaRepository.remove(cuotaFound);

        return [deletedCuota, null];
    } catch (error) {
        console.error("Error al eliminar la cuota:", error);
        return [null, "Error interno del servidor"];
    }
}
// Crear Cuota y asignarla a todos los vecinos
export async function createcuotas_vecinalesService(data) {
        const cuotaRepository = AppDataSource.getRepository(CuotasVecinales);
        const UsuarioRepository = AppDataSource.getRepository(Usuario)
        const ucRepository = AppDataSource.getRepository(UsuarioCuota)

    try{
        
        // Crear la cuota

        const newCuota = cuotaRepository.create ({
            monto_c: body.monto_c,
            fecha_emision: body.fecha_emision,
            fechaActualizacion: new Date(),
        });
        const saveCuota = await cuotaRepository.save(newCuota);

        // Obtener usuarios con rol de vecino y que esten activos

        const vecinos_habilitados = await UsuarioRepository.find ({ where : { rol: "vecino", estado_activo: true } });

        // Asignar la cuota a todos los vecinos
        const asignar_cuota= vecinos_habilitados.map(vecino => { 
        
        return ucRepository.create({        //Recorro mi array uno por uno con el .map luego para cada vecino creamos un UsuarioCuota 
            id_usuario: vecino.id_usuario,
            id_cuota: saveCuota.id_cuota,
            estado_pago: "pendiente",
            });
        });

        await ucRepository.save(asignar_cuota);

        return [saveCuota, null];
    } catch(error) {
            console.error("Error al asignar la Cuota:", error);
        return [null, "Error interno del servidor:"];
    }
}

