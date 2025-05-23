"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteNotificacionAlerta,
  getNotificacionAlerta,
  getNotificacionesAlertas,
  updateNotificacionAlerta,
  createNotificacionAlerta,
} from "../controllers/notificacion_alerta.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getNotificacionesAlertas)
  .get("/detail/", getNotificacionAlerta)
  .patch("/detail/", updateNotificacionAlerta)
  .delete("/detail/", deleteNotificacionAlerta)
  .post("/", createNotificacionAlerta);

export default router;