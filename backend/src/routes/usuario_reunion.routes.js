"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteUsuao_reunion,
  getUsuario_reunion,
  getUsuario_reuniones,
  updateUsuao_reunion,
} from "../controllers/usuario_reunion.controller.js";

const router= Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getUsuario_reuniones)
  .get("/detail/", getUsuario_reunion)
  .patch("/detail/", updateUsuao_reunion)
  .delete("/detail/", deleteUsuao_reunion);

export default router;