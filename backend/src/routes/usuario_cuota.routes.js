"use strict";
import { Router } from "express";
import { authorizeRoles, soloPropietarioSoloSiVecino } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  getUsuarioCuota,
  UpdateEstadoPagoCuota,
} from "../controllers/usuario_cuota.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/detail/", authorizeRoles("admin", "presidenta", "tesorera", "vecino"),soloPropietarioSoloSiVecino("id") ,getUsuarioCuota)//id's en ruta
  .patch("/", authorizeRoles("admin", "presidenta", "tesorera"), UpdateEstadoPagoCuota);//id's en ruta

export default router;