"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import{
    eliminarInscripcionConvocatoria,
    getUsuarioConvocatoria,
    inscribirUsuarioEnConvocatoria
} from"../controllers/usuario_convocatoria.controller.js"

const router = Router();

router
    .use(authenticateJwt);

router
    .get("/detail/", authorizeRoles("admin", "vecino", "secretario"), getUsuarioConvocatoria) //id's en ruta
    .delete("/detail/", authorizeRoles("admnin", "vecino", "secretario"), eliminarInscripcionConvocatoria) //id's en ruta
    .post("/", authorizeRoles("admin", "vecino", "secretario"), inscribirUsuarioEnConvocatoria);

export default router;