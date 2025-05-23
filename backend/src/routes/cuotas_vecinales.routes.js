"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteCuotaVecinal,
  getCuotaVecinal,
  getCuotasVecinales,
  updateCuotaVecinal,
  createCuotaVecinal,
} from "../controllers/cuotas_vecinales.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getCuotasVecinales)
  .get("/detail/", getCuotaVecinal)
  .patch("/detail/", updateCuotaVecinal)
  .delete("/detail/", deleteCuotaVecinal)
  .post("/", createCuotaVecinal);

export default router;