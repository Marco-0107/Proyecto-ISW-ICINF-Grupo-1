"use stric";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware";
import { authenticateJwt } from "../middlewares/authentication.middleware";
import{
    deletePublicacion,
    getPublicacion,
    getPublicaciones,
    updatePublicacion,
    createPublicacion
}from "../controllers/publicacion.controller.js";

const router=Router();

router
    .use(authenticateJwt)
    .use(isAdmin);

router
    .get("/", getPublicaciones)
    .get("/detail/", getPublicacion)
    .patch("/detail/", updatePublicacion)
    .delete("/detail/", deletePublicacion)
    .post("/", createPublicacion);

export default router;