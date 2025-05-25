"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import{
    deleteConvocatoria,
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
    .delete("/detail/", deleteConvocatoria)
    .post("/", createConvocatoria);

export default router;