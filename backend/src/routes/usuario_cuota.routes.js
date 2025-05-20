"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteUsuario_cuota,
  getUsuario_cuota,
  getUsuario_cuotas,
  updateUsuario_cuota,
} from "../controllers/usuario_cuota.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getUsuario_cuotas)
  .get("/detail/", getUsuario_cuota)
  .patch("/detail/", updateUsuario_cuota)
  .delete("/detail/", deleteUsuario_cuota);

export default router;