"use stric";
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
    .get("/detail/", getUsuarioConvocatoria)
    .delete("/detail/", eliminarInscripcionConvocatoria)
    .post("/", inscribirUsuarioEnConvocatoria);

export default router;