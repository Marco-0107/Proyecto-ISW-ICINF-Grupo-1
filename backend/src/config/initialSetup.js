"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const count = await userRepository.count();
    if (count > 0) return;

    const now = new Date();

    await Promise.all([
      userRepository.save(userRepository.create({
        nombre: "Ignacio",
        apellido: "Valdés Troncoso",
        direccion: "Avenida Central 1245",
        rut: "17.345.321-0",
        telefono: "+56975345612",
        email: "ignacio.admin@gmail.com",
        password: await encryptPassword("admin2025"),
        rol: "admin",
        estado_activo: true,
        fecha_registro: now,
      })),
      userRepository.save(userRepository.create({
        nombre: "Martina",
        apellido: "Rivas Palacios",
        direccion: "Villa Cordillera 302",
        rut: "18.456.789-1",
        telefono: "+56981234567",
        email: "martina.presi@gmail.com",
        password: await encryptPassword("presi2025"),
        rol: "presidenta",
        estado_activo: true,
        fecha_registro: now,
      })),
      userRepository.save(userRepository.create({
        nombre: "Leonardo",
        apellido: "Garrido Núñez",
        direccion: "Condominio Arrayán 77",
        rut: "16.789.654-3",
        telefono: "+56998765432",
        email: "leo.secre@gmail.com",
        password: await encryptPassword("secre2025"),
        rol: "secretario",
        estado_activo: true,
        fecha_registro: now,
      })),
      userRepository.save(userRepository.create({
        nombre: "Camila",
        apellido: "Moreno Acevedo",
        direccion: "Pasaje Los Lirios 44",
        rut: "15.321.789-2",
        telefono: "+56975678912",
        email: "camila.teso@gmail.com",
        password: await encryptPassword("teso2025"),
        rol: "tesorera",
        estado_activo: true,
        fecha_registro: now,
      })),
    ]);

    console.log("* => Usuarios creados");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

export { createUsers };
