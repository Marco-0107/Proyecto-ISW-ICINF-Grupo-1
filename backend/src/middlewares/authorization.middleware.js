import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

// Consulta el rol actual desde la base de datos antes de autorizar
export function authorizeRoles(...rolesPermitidos) {
  return async (req, res, next) => {
    try {
      const userRepository = AppDataSource.getRepository(User);

      const userFound = await userRepository.findOneBy({ email: req.user.email });

      if (!userFound) {
        return handleErrorClient(
          res,
          404,
          "Usuario no encontrado en la base de datos"
        );
      }

      const rolActual = userFound.rol;

      if (!rolesPermitidos.includes(rolActual)) {
        return handleErrorClient(
          res,
          403,
          "Acceso denegado: permisos insuficientes",
          `Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}`
        );
      }

      req.user.rol = rolActual;
      next();
    } catch (error) {
      return handleErrorServer(res, 500, "Error en verificación de rol", error.message);
    }
  };
}


// Middleware que permite modificar solo su propia info (usado por vecinos)
export function soloPropietarioSoloSiVecino(param = "id") {
  return (req, res, next) => {
    const idEnRuta = req.params[param] || req.query[param];
    const esVecino = req.user.rol === "vecino";

    if (!esVecino) {
      return next();
    }

    const esPropietario = parseInt(idEnRuta) === req.user.id;

    if (esPropietario) {
      return next();
    }

    return handleErrorClient(
      res,
      403,
      "Solo puedes acceder o modificar tus propios datos",
      { idUsuario: req.user.id, idRecurso: idEnRuta }
    );
  };
}


