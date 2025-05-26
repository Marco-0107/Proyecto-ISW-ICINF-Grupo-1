"use strict";
import passport from "passport";
import { handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js"; // Ajusta si lo tienes en otro archivo

export function authenticateJwt(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return handleErrorServer(
        res,
        500,
        "Error de autenticación en el servidor"
      );
    }

    if (!user) {
      return handleErrorClient(
        res,
        401,
        "No tienes permiso para acceder a este recurso",
        { info: info ? info.message : "No se encontró el usuario" }
      );
    }

    req.user = user;
    next();
  })(req, res, next);
}


// export function authenticateJwt(req, res, next) {
//   passport.authenticate("jwt", { session: false }, (err, user, info) => {
//     if (err) {
//       return handleErrorServer(
//         res,
//         500,
//         "Error de autenticación en el servidor"
//       );
//     }

//     if (!user) {
//       return handleErrorClient(
//         res,
//         401,
//         "No tienes permiso para acceder a este recurso",
//         { info: info ? info.message : "No se encontró el usuario" }
//       )
//     }

//     req.user = user;
//     next();
//   })(req, res, next);
// }