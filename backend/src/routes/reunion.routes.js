"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteReunion,
  getReunion,
  getReuniones,
  updateReunion,
  createReunion,
  registrarAsistencia
} from "../controllers/reunion.controller.js";

const router=Router();

router
    .use(authenticateJwt)
    .use(isAdmin);

router
    .get("/", getReuniones)
    .get("/detail/", getReunion)
    .patch("/detail/", updateReunion)
    .delete("/detail/", deleteReunion)
    .post("/", createReunion)
    .post("/", registrarAsistencia);
export default router;