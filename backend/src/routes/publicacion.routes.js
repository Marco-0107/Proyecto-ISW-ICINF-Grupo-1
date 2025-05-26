"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import{
    deletePublicacion,
    getPublicacion,
    getPublicaciones,
    updatePublicacion,
    createPublicacion
}from "../controllers/publicacion.controller.js";

const router=Router();

router.use(authenticateJwt);

router
    .get("/", authorizeRoles("admin", "presidenta", "tesorera", "secretario", "vecino"), getPublicaciones)
    .get("/detail/", authorizeRoles("admin", "presidenta", "tesorera", "secretario", "vecino"), getPublicacion)
    .patch("/detail/", authorizeRoles("admin", "presidenta", "tesorera", "secretario"), updatePublicacion)
    .delete("/detail/",authorizeRoles("admin", "presidenta", "tesorera", "secretario"), deletePublicacion)
    .post("/", authorizeRoles("admin", "presidenta", "tesorera", "secretario"), createPublicacion);

export default router;