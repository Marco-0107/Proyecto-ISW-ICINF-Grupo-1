"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteNotificacion_alerta,
  getNotificacion_alerta,
  getNotificaciones_alertas,
  updateNotificacion_alerta,
} from "../controllers/notificacion_alerta.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getNotificaciones_alertas)
  .get("/detail/", getNotificacion_alerta)
  .patch("/detail/", updateNotificacion_alerta)
  .delete("/detail/", deleteNotificacion_alerta);

export default router;