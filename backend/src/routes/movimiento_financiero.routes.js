"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteMovimientoFinanciero,
  getMovimientoFinanciero,
  getMovimientosFinancieros,
  updateMovimientoFinanciero,
  createMovimientoFinanciero,
} from "../controllers/movimiento_financiero.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/", authorizeRoles("admin", "presidenta", "tesorera"),getMovimientosFinancieros)
  .get("/detail/", authorizeRoles("admin", "presidenta", "tesorera"), getMovimientoFinanciero)
  .patch("/detail/", authorizeRoles("admin","presidenta", "tesorera") , updateMovimientoFinanciero)
  .delete("/detail/", authorizeRoles("admin", "presidenta"), deleteMovimientoFinanciero)
  .post("/", authorizeRoles("admin","tesorera", "presidenta"), createMovimientoFinanciero);

export default router;