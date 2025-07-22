"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
  deleteReunion,
  getReunion,
  getReuniones,
  updateReunion,
  createReunion,
  updateArchivoActa
} from "../controllers/reunion.controller.js";

const router=Router();

router
    .use(authenticateJwt);

router
    .get("/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), getReuniones)
    .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), getReunion)
    .patch("/detail/", authorizeRoles("admin", "presidenta", "secretario"),updateReunion)
    .patch("/archivo-acta/:id", authorizeRoles("presidenta", "admin"), updateArchivoActa)
    .delete("/detail/", authorizeRoles("admin", "presidenta", "secretario"), deleteReunion)
    .post("/", authorizeRoles("presidenta", "admin"), createReunion)
export default router;