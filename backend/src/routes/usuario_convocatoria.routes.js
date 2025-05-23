"use stric";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware";
import { authenticateJwt } from "../middlewares/authentication.middleware";
import{
    deleteUsuarioConvocatoria,
    getUsuarioConvocatoria,
    getUsuariosConvocatorias,
    createUsuarioConvocatoria
} from"../controllers/usuario_convocatoria.controller.js"

const router = Router();

router
    .use(authenticateJwt)
    .use(isAdmin);

router
    .get("/", getUsuariosConvocatorias)
    .get("/detail/", getUsuarioConvocatoria)
    .delete("/detail/", deleteUsuarioConvocatoria)
    .post("/", createUsuarioConvocatoria);

export default router;