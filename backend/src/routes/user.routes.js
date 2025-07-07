"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles, soloPropietarioSoloSiVecino } from "../middlewares/authorization.middleware.js";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  createUser,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), getUsers)
  .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"), soloPropietarioSoloSiVecino("id"), getUser)
  .patch("/detail/", authorizeRoles("admin", "presidenta", "secretario", "vecino"), updateUser)
  .delete("/detail/", authorizeRoles("admin"), deleteUser)
  .post("/", authorizeRoles("admin"), createUser);
export default router;


