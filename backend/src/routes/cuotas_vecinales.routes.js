"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteCuotavecinal,
  getCuota_vecinal,
  getCuotas_vecinales,
  updateCuota_vecinal,
} from "../controllers/cuotas_vecinales.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getCuotas_vecinales)
  .get("/detail/", getCuota_vecinal)
  .patch("/detail/", updateCuota_vecinal)
  .delete("/detail/", deleteCuotavecinal);

export default router;