"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteCuotaVecinal,
  getCuotaVecinal,
  getCuotasVecinales,
  updateCuotaVecinal,
  createCuotaVecinal,
} from "../controllers/cuotas_vecinales.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/", authorizeRoles("admin", "presidenta", "secretario", "tesorera"), getCuotasVecinales)
  .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "tesorera"), getCuotaVecinal)
  .patch("/detail/", authorizeRoles("admin", "presidenta", "tesorera"),updateCuotaVecinal)
  .delete("/detail/", authorizeRoles("admin", "presidenta", "tesorera"), deleteCuotaVecinal)
  .post("/", authorizeRoles("admin","tesorera", "presidenta"), createCuotaVecinal);

export default router;