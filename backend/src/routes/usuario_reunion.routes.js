"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  getUsuarioReunion,
  marcarAsistenciaManual,
  registrarAsistencia
} from "../controllers/usuario_reunion.controller.js";

const router= Router();

router.use(authenticateJwt);

router
  .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "tesorera"), getUsuarioReunion)
  .patch("/detail/", authorizeRoles("admin", "presidenta", "secretaria"), marcarAsistenciaManual)
  .post("/", authorizeRoles("admin", "presidenta" ), registrarAsistencia)

export default router;