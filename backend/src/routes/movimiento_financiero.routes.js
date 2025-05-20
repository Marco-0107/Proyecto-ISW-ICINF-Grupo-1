"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteMovimiento_financiero,
  getMovimiento_financiero,
  getMovimientos_financieros,
  updateMovimiento_financiero,
} from "../controllers/movimiento_financiero.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getMovimientos_financieros)
  .get("/detail/", getMovimiento_financiero)
  .patch("/detail/", updateMovimiento_financiero)
  .delete("/detail/", deleteMovimiento_financiero);

export default router;