"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteToken,
  getToken,
  getTokens,
  updateToken,
} from "../controllers/token.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/", getTokens)
  .get("/detail/", getToken)
  .patch("/detail/", updateToken)
  .delete("/detail/", deleteToken);

export default router;