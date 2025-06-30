"use strict";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import indexRoutes from "./routes/index.routes.js";
import session from "express-session";
import passport from "passport";
import express, { json, urlencoded } from "express";
import http from "http";
import { Server } from "socket.io";
import { cookieKey, HOST, PORT, SOCKET_HOST, SOCKET_PORT} from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import { createUsers } from "./config/initialSetup.js";
import { passportJwtSetup } from "./auth/passport.auth.js";

export let io = null;

async function setupSocketIO() {
  const socketApp = express();
  const socketServer = http.createServer(socketApp);
  io = new Server(socketServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("mensaje", (data) => {
      socket.to(data.sala).emit("mensaje", data.mensaje);
    });

    socket.on("unirseSala", (salaId) => {
      socket.join(salaId);
    });

    socket.on("salirSala", (salaId) => {
      socket.leave(salaId);
    });

    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.id);
    });
  });

  socketServer.listen(SOCKET_PORT, () => {
    console.log(`Socket.io corriendo en http://${SOCKET_HOST}:${SOCKET_PORT}`);
  });
}

async function setupServer() {
  try {
    const app = express();

    app.disable("x-powered-by");

    app.use(cors({ credentials: true, origin: true }));
    app.use(urlencoded({ extended: true, limit: "1mb" }));
    app.use(json({ limit: "1mb" }));
    app.use(cookieParser());
    app.use(morgan("dev"));

    app.use(
      session({
        secret: cookieKey,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          sameSite: "strict",
        },
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passportJwtSetup();
    app.use("/api", indexRoutes);

    app.listen(PORT, () => {
      console.log(`=> Servidor corriendo en ${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.log("Error en index.js -> setupServer(), el error es: ", error);
  }
}

async function setupAPI() {
  try {
    await connectDB();
    await setupServer();
    await setupSocketIO();
    await createUsers();
  } catch (error) {
    console.log("Error en index.js -> setupAPI(), el error es: ", error);
  }
}

setupAPI()
  .then(() => console.log("=> API Iniciada exitosamente"))
  .catch((error) =>
    console.log("Error en index.js -> setupAPI(), el error es: ", error),
  );