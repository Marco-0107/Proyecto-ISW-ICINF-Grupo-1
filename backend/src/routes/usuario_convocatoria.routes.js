"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import{
    eliminarInscripcionConvocatoria,
    getUsuarioConvocatoria,
    inscribirUsuarioEnConvocatoria
} from"../controllers/usuario_convocatoria.controller.js"

const router = Router();

router
    .use(authenticateJwt)
    .use(isAdmin);

router
    .get("/detail/", getUsuarioConvocatoria) //id's en ruta
    .delete("/detail/", eliminarInscripcionConvocatoria) //id's en ruta
    .post("/", inscribirUsuarioEnConvocatoria);

export default router;