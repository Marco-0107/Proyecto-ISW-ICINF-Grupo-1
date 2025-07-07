import UsuarioReunion from "../entity/usuario_reunion.entity.js";
import Token from "../entity/token.entity.js";
import { AppDataSource } from "../config/configDb.js";



// Retorna todos los usuarios que pertenecen a una reunion.
export async function getUsuariosReunionService({ id_reunion }) {
  try {
    const urRepository = AppDataSource.getRepository(UsuarioReunion);

    const registros = await urRepository.find({
      where: { id_reunion },
      relations: ["User"]
    });

    return [registros, null];

  } catch (error) {
    console.error("Error al obtener usuarios de la reunión:", error);
    return [null, "Error interno del servidor"];
  }
}

// Retorna un registro entre un usuario y una reunión
export async function getUsuarioReunionService({ id_usuario, id_reunion }) {
  try {
    const UrRepository = AppDataSource.getRepository(UsuarioReunion);

    const registro = await UrRepository.findOneBy({ id_usuario, id_reunion });

    if (!registro) return [null, "El usuario no está vinculado a esta reunión"];

    return [registro, null];

  } catch (error) {
    console.error("Error al obtener el token", error);
    return [null, "Error interno del servidor"];
  }
}

// Marca asistencia de forma manual (Por la presidenta) en caso de que no puedan poner el token
export async function marcarAsistenciaManualService({ id_usuario, id_reunion }) {
  try {
    const UrRepository = AppDataSource.getRepository(UsuarioReunion);

    const registro = await UrRepository.findOneBy({ id_usuario, id_reunion });

    if (!registro) return [null, "No existe asignación previa a esta reunión"];

    registro.asistio = !registro.asistio;
    registro.fecha_confirmacion_asistencia = registro.asistio ? new Date() : null;
    registro.id_token = null;
    registro.numero_token =null;

    const actualizado = await UrRepository.save(registro);

    return [actualizado, null];

  } catch (error) {
    console.error("Error al marcar la asistencia del usuario", error);
    return [null, "Error interno del servidor"];
  }
}

//Registrar asistencia a una reunion con token  (Funcion adicional a las básicas)
export async function registrarAsistenciaService(query) {
  try {
    const { id_usuario, id_reunion, numero_token, id_token } = query;

    const urRepository = AppDataSource.getRepository(UsuarioReunion);
    const tokenRepository = AppDataSource.getRepository(Token);

    // Buscar token válido (mismo número, misma reunión, estado activo)
    const tokenFound = await tokenRepository.findOne({
      where: { numero_token: numero_token, id_token: id_token },
    });

    if (!tokenFound)
      return [null, "Token inválido o proceso de asistencia cerrado."];

    // Buscar si el usuario está asignado a esa reunión
    const urFound = await urRepository.findOne({
      where: { id_usuario, id_reunion },
    });

    if (!urFound) return [null, "Usuario no habilitado para reunión"];
    if (urFound.asistio) return [null, "Usuario ya registró su asistencia anteriormente"];

    // Actualizar campos
    urFound.asistio = true;
    urFound.fecha_confirmacion_asistencia = new Date();
    urFound.id_token = tokenFound.id_token;
    urFound.numero_token = tokenFound.numero_token;

    const asistenciaConfirmada = await urRepository.save(urFound);
    return [asistenciaConfirmada, null];
  } catch (error) {
    return [null, error.message];
  }
}