"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  getUsuarioReunion,
  marcarAsistenciaManual,
  registrarAsistencia
} from "../controllers/usuario_reunion.controller.js";

const router= Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/detail/", getUsuarioReunion)
  .patch("/detail/", marcarAsistenciaManual)
  .post("/", registrarAsistencia)

export default router;