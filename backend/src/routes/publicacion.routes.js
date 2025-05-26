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
    .get("/", authorizeRoles("admin", "presidenta", "tesorera"), getPublicaciones)
    .get("/detail/", authorizeRoles("admin", "presidenta", "tesorera"), getPublicacion)
    .patch("/detail/", authorizeRoles("presidenta"), updatePublicacion)
    .delete("/detail/",authorizeRoles("admin"), deletePublicacion)
    .post("/", authorizeRoles("presidenta"), createPublicacion);

export default router;