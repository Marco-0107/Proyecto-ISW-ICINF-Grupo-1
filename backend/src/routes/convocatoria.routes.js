"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { handleFileSizeLimit, upload } from "../middlewares/uploadArchive.middleware.js";
import{
    deleteConvocatoria,
    getConvocatoria,
    getConvocatorias,
    updateConvocatoria,
    createConvocatoria,
    cargarArchivoConvocatoria,
    descargarArchivoConvocatoria,
    viewArchivoConvocatoria
} from "../controllers/convocatoria.controller.js";

const router=Router();

router.use(authenticateJwt);

router
    .get("/", authorizeRoles("admin", "presidenta", "secretario", "vecino") ,getConvocatorias)
    .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "vecino") ,getConvocatoria)
    .patch("/detail/", authorizeRoles("admin", "presidenta", "secretario") ,updateConvocatoria)
    .delete("/detail/", authorizeRoles("admin") ,deleteConvocatoria)
    .post("/", authorizeRoles("admin","presidenta", "secretario"), createConvocatoria)
    .post("/cargar-archivo/:id_convocatoria", upload.single("archivo"), handleFileSizeLimit, authorizeRoles("presidenta", "admin", "secretario", "tesorera", "vecino"), cargarArchivoConvocatoria)
    .get("/descargar-archivo/:id_convocatoria", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), descargarArchivoConvocatoria)
    .get("/view-archivo/:id_convocatoria", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), viewArchivoConvocatoria);

export default router;