"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deletReunion,
  getReunion,
  getReuniones,
  updateReunion
} from "../controllers/reunion.controller.js";

const router=Router();

router
    .use(authenticateJwt)
    .use(isAdmin);

router
    .get("/", getReuniones)
    .get("/detail/", getReunion)
    .patch("/detail/", updateReunion)
    .delete("/detail/", deletReunion);
    
export default router;