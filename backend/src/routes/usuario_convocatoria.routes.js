"use stric";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware";
import { authenticateJwt } from "../middlewares/authentication.middleware";
import{
    deleteUsuario_convocatoria,
    getUsuario_convocatoria,
    getUsuario_convocatorias,
    updateUsuario_convocatoria
} from"../controllers/usuario_convocatoria.controller.js"

const router = Router();

router
    .use(authenticateJwt)
    .use(isAdmin);

router
    .get("/", getUsuario_convocatorias)
    .get("/detail/", getUsuario_convocatoria)
    .patch("/detail/", updateUsuario_convocatoria)
    .delete("/detail/", deleteUsuario_convocatoria);

export default router;