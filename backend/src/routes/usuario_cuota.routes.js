"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  getUsuarioCuota,
  UpdateEstadoPagoCuota,
} from "../controllers/usuario_cuota.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/detail/", getUsuarioCuota) //id's en ruta
  .patch("/", UpdateEstadoPagoCuota);//id's en ruta

export default router;