"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { handleFileSizeLimit, upload } from "../middlewares/uploadArchive.middleware.js";
import {
  deleteReunion,
  getReunion,
  getReuniones,
  updateReunion,
  createReunion,
  updateArchivoActa,
  cargarActaReunion,
  descargarActaReunion
} from "../controllers/reunion.controller.js";

const router=Router();

router
    .use(authenticateJwt);

router
    .get("/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), getReuniones)
    .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), getReunion)
    .patch("/detail/", authorizeRoles("admin", "presidenta", "secretario"),updateReunion)
    .patch("/archivo-acta/:id", authorizeRoles("presidenta", "admin"), updateArchivoActa)
    .post("/cargar-acta/:id_reunion", upload.single("archivo"), handleFileSizeLimit, authorizeRoles("presidenta", "admin"), cargarActaReunion)
    .get("/descargar-acta/:id_reunion", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), descargarActaReunion)
    .delete("/detail/", authorizeRoles("admin", "presidenta", "secretario"), deleteReunion)
    .post("/", authorizeRoles("presidenta", "admin"), createReunion)
export default router;