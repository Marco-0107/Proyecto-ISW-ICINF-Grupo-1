"use strict";
import { EntitySchema } from "typeorm";

const User = new EntitySchema({
  name: "User",
  tableName: "usuario",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    apellido: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    direccion:{
      type: "varchar",
      length: 255,
      nullable: false
    },
    rut: {
      type: "varchar",
      length: 12,
      nullable: false,
      unique: true,
    },
    telefono:{
      type: "varchar",
      length: 20,
      nullable: false
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false
    },
    rol: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    estado_activo: {
      type: "boolean",
      nullable: false,
    },
    fecha_registro: {
      type: "date",
      nullable: false
    },
  },
  indices: [
    {
      name: "IDX_USER",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_USER_RUT",
      columns: ["rut"],
      unique: true,
    },
    {
      name: "IDX_USER_EMAIL",
      columns: ["email"],
      unique: true,
    },
  ],
});


export default (User);