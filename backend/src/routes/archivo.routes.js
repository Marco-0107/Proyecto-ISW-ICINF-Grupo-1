"use strict";

import { Router } from "express";
import { getArchivos, subidaArchivo, getArchivo, viewArchivo } from "../controllers/archivo.controller.js";
import { handleFileSizeLimit, upload } from "../middlewares/uploadArchive.middleware.js";

const router = Router();

router
  .post("/", upload.single("archivo"), handleFileSizeLimit, subidaArchivo)
  .get("/", getArchivos)
  .get("/:id", getArchivo)
  .get("/:id/view", viewArchivo);

export default router;
