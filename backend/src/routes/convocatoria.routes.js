"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import{
    deleteConvocatoria,
    getConvocatoria,
    getConvocatorias,
    updateConvocatoria,
    createConvocatoria,
} from "../controllers/convocatoria.controller.js";

const router=Router();

router.use(authenticateJwt);

router
    .get("/", authorizeRoles("admin", "presidenta", "secretario", "vecino") ,getConvocatorias)
    .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "vecino") ,getConvocatoria)
    .patch("/detail/", authorizeRoles("admin", "presidenta", "secretario") ,updateConvocatoria)
    .delete("/detail/", authorizeRoles("admin") ,deleteConvocatoria)
    .post("/", authorizeRoles("admin","presidenta", "secretario"), createConvocatoria);

export default router;