"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadArchive, handleUploadErrors } from "../middlewares/uploadPostulacion.middleware.js";
import{
    eliminarInscripcionConvocatoria,
    getUsuarioConvocatoria,
    inscribirUsuarioEnConvocatoria,
    crearPostulacionConArchivos,
    getPostulantesConvocatoria,
    getArchivosPostulante,
    descargarArchivoPostulante,
    descargarArchivosConvocatoriaZip
} from"../controllers/usuario_convocatoria.controller.js"

const router = Router();

router
    .use(authenticateJwt);

router
    .get("/detail/", authorizeRoles("admin", "vecino", "secretario"), getUsuarioConvocatoria) //id's en ruta
    .delete("/detail/", authorizeRoles("admin", "vecino", "secretario"), eliminarInscripcionConvocatoria) //id's en ruta
    .post("/", authorizeRoles("admin", "vecino", "secretario"), inscribirUsuarioEnConvocatoria)
    .post("/postular", 
          authorizeRoles("admin", "vecino", "secretario", "presidenta"), 
          uploadArchive, 
          handleUploadErrors,
          crearPostulacionConArchivos)
    .get("/postulantes/:id_convocatoria", authorizeRoles("admin", "presidenta", "secretario"), getPostulantesConvocatoria)
    .get("/archivos/:id_usuario/:id_convocatoria", authorizeRoles("admin", "presidenta", "secretario"), getArchivosPostulante)
    .get("/descargar-archivo/:id_archivo", authorizeRoles("admin", "presidenta", "secretario"), descargarArchivoPostulante)
    .get("/descargar-zip/:id_convocatoria", authorizeRoles("admin", "presidenta", "secretario"), descargarArchivosConvocatoriaZip);

export default router;