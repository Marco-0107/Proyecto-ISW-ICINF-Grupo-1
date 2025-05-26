"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles, soloPropietario } from "../middlewares/authorization.middleware.js";
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
  .get("/", authorizeRoles("admin", "presidenta", "secretario", "tesorera") ,getUsers)
  .get("/detail/", authorizeRoles("admin", "presidenta", "secretario", "tesorera", "vecino"),soloPropietario("id") ,getUser)
  .patch("/detail/", authorizeRoles("admin", "presidenta", "secretario", "vecino"), soloPropietario("id") ,updateUser)
  .delete("/detail/", authorizeRoles("admin") ,deleteUser)
  .post("/", authorizeRoles("admin") ,createUser);

export default router;


