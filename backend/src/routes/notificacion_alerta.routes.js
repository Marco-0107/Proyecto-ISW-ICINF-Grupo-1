"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js"; 
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteNotificacionAlerta,
  getNotificacionAlerta,
  getNotificacionesAlertas,
  updateNotificacionAlerta,
  createNotificacionAlerta,
} from "../controllers/notificacion_alerta.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), getNotificacionesAlertas)
  .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), getNotificacionAlerta)
  .patch("/detail/", authorizeRoles("presidenta"), updateNotificacionAlerta)
  .delete("/detail/", authorizeRoles("admin"), deleteNotificacionAlerta)
  .post("/", authorizeRoles("presidenta"), createNotificacionAlerta);

export default router;