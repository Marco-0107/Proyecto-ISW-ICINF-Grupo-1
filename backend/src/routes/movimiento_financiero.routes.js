"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteMovimientoFinanciero,
  getMovimientoFinanciero,
  getMovimientosFinancieros,
  updateMovimientoFinanciero,
  createMovimientoFinanciero,
} from "../controllers/movimiento_financiero.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getMovimientosFinancieros)
  .get("/detail/", getMovimientoFinanciero)
  .patch("/detail/", updateMovimientoFinanciero)
  .delete("/detail/", deleteMovimientoFinanciero)
  .post("/", createMovimientoFinanciero);

export default router;