"use stric";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware";


const router=Router();
router
    .get("/", getPublicacion)
    .get("/detail/", getPublicacion)
    .patch("/detail/", updatePublicacion)
    .delete("/detail/", deletePublicacion)
export default router;