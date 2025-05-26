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
    .get("/detail/", authorizeRoles("vecino"), getUsuarioConvocatoria) //id's en ruta
    .delete("/detail/", authorizeRoles("vecino"), eliminarInscripcionConvocatoria) //id's en ruta
    .post("/", authorizeRoles("vecino"), inscribirUsuarioEnConvocatoria);

export default router;