"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
  deleteReunion,
  getReunion,
  getReuniones,
  updateReunion,
  createReunion
} from "../controllers/reunion.controller.js";

const router=Router();

router
    .use(authenticateJwt);

router
    .get("/", authorizeRoles("admin", "presidenta", "secretario", "tesorera"), getReuniones)
    .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "tesorera"), getReunion)
    .patch("/detail/", authorizeRoles("presidenta"),updateReunion)
    .delete("/detail/", authorizeRoles("admin"), deleteReunion)
    .post("/", authorizeRoles("presidenta", "admin", "vecino"), createReunion)
export default router;