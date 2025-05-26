"use strict";
import { Router } from "express";

// Importación de rutas por entidad
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import publicacionRoutes from "./publicacion.routes.js";
import reunionRoutes from "./reunion.routes.js";
import cuotasVecinalesRoutes from "./cuotas_vecinales.routes.js";
import convocatoriaRoutes from "./convocatoria.routes.js";
import movimientoFinancieroRoutes from "./movimiento_financiero.routes.js";
import notificacionAlertaRoutes from "./notificacion_alerta.routes.js";
import tokenRoutes from "./token.routes.js";
import usuarioReunionRoutes from "./usuario_reunion.routes.js";
import usuarioCuotaRoutes from "./usuario_cuota.routes.js";
import usuarioConvocatoriaRoutes from "./usuario_convocatoria.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/publicacion", publicacionRoutes)
    .use("/reunion", reunionRoutes)
    .use("/cuotas", cuotasVecinalesRoutes)
    .use("/convocatoria", convocatoriaRoutes)
    .use("/movimiento", movimientoFinancieroRoutes)
    .use("/notificacion", notificacionAlertaRoutes)
    .use("/token", tokenRoutes)
    .use("/usuario-reunion", usuarioReunionRoutes)
    .use("/usuario-cuota", usuarioCuotaRoutes)
    .use("/usuario-convocatoria", usuarioConvocatoriaRoutes);

export default router;