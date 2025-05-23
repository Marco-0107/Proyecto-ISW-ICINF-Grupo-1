import UsuarioReunion from "../entity/usuario_reunion.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Retorna un registro de asistencia entre un usuario y una reunión
export async function getUsuarioReunionService({ id_usuario, id_reunion }) {
    try {
        const UrRepository = AppDataSource.getRepository(UsuarioReunion);

        const registro = await UrRepository.findOneBy({ id, id_reunion });

    if (!registro) return [null, "El usuario no está vinculado a esta reunión"];

    return [registro, null];

    } catch (error) {
        console.error("Error al obtener el token", error);
        return [null, "Error interno del servidor"];
    }
 }

// Asigna un usuario a una reunión (cuando se crea la reunión o manualmente)
export async function asignarUsuarioAReunionService({ id, id_reunion }) {
    try {
        const UrRepository = AppDataSource.getRepository(UsuarioReunion);

        const URexiste = await repo.findOneBy({ id, id_reunion });

        if (URexiste) return [null, "El usuario ya está asignado a esta reunión"];

        const nuevoRegistro = repo.create({
        id_usuario,
        id_reunion,
        asistio: false,
        fecha_confirmacion_asistencia: null,
        id_token: null,
        });

        const guardado = await repo.save(nuevoRegistro);

        return [guardado, null];

    } catch (error) {
        console.error("Error al asignar los usuarios", error);
        return [null, "Error interno del servidor"];
    }
}
// Marca asistencia de forma manual (Por la presidenta) en caso de que no puedan poner el token
export async function marcarAsistenciaManualService({ id, id_reunion }) {
    try {
        const UrRepository = AppDataSource.getRepository(UsuarioReunion);

        const registro = await repo.findOneBy({ id, id_reunion });
        
        if (!registro) return [null, "No existe asignación previa a esta reunión"];

        if (registro.asistio) return [null, "El usuario ya tiene asistencia registrada"];

        registro.asistio = true;
        registro.fecha_confirmacion_asistencia = new Date();
        registro.id_token = null;

        const actualizado = await repo.save(registro);

        return [actualizado, null];

    } catch (error) {
        console.error("Error al marcar la asistencia del usuario", error);
        return [null, "Error interno del servidor"];
    }
}