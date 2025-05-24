import { AppDataSource } from "../config/configDb.js";
import UsuarioConvocatoria from "../entity/usuario_convocatoria.entity.js";

// Obtiene si un usuario está inscrito en una convocatoria
export async function getUsuarioConvocatoriaService({ id_usuario, id_convocatoria }) {
  try {
    const uConvRepository = AppDataSource.getRepository(UsuarioConvocatoria);
    const registro = await uConvRepository.findOneBy({ id_usuario, id_convocatoria });

    if (!registro) return [null, "El usuario no está inscrito en esta convocatoria"];
    return [registro, null];
  } catch (error) {
    return [null, error.message];
  }
}
// Inscribe al usuario en una convocatoria
export async function inscribirUsuarioEnConvocatoriaService({ id_usuario, id_convocatoria }) {
  try {
    const uConvRepository = AppDataSource.getRepository(UsuarioConvocatoria);

    const uConvFound = await uConvRepository.findOneBy({ id_usuario, id_convocatoria });
    if (uConvFound) return [null, "El usuario ya está inscrito en esta convocatoria"];

    const nuevo = uConvRepository.create({ id_usuario, id_convocatoria });
    const guardado = await uConvRepository.save(nuevo);
    return [guardado, null];
  } catch (error) {
    return [null, error.message];
  }
}

// Elimina la inscripción de un usuario
export async function eliminarInscripcionConvocatoriaService({ id_usuario, id_convocatoria }) {
  try {
    const uConvRepository = AppDataSource.getRepository(UsuarioConvocatoria);
    const result = await uConvRepository.delete({ id_usuario, id_convocatoria });

    if (result.affected === 0) return [null, "No se encontró el registro para eliminar"];
    return [result, null];
  } catch (error) {
    return [null, error.message];
    }
}