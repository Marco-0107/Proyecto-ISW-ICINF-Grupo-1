"use stric";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware";
import { authenticateJwt } from "../middlewares/authentication.middleware";
import{
    deleteConvocoria,
    getConvocatoria,
    getConvocatorias,
    updateConvocatoria,
    createConvocatoria,
} from "../controllers/convocatoria.controller.js";

const router=Router();

router
    .use(authenticateJwt)
    .use(isAdmin);

router
    .get("/", getConvocatorias)
    .get("/detail/", getConvocatoria)
    .patch("/detail/", updateConvocatoria)
    .delete("/detail/", deleteConvocoria)
    .post("/", createConvocatoria);

export default router;