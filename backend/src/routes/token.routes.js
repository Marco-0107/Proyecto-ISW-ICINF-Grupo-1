"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  getToken,
  getTokens,
  closeTokens,
  createToken,
} from "../controllers/token.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/", authorizeRoles("admin", "presidenta", "secretario", "vecino"), getTokens)
  .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "vecino"), getToken)
  .patch("/detail/", authorizeRoles("admin","presidenta"), closeTokens) 
  .post("/", authorizeRoles("admin","presidenta"), createToken);

export default router;