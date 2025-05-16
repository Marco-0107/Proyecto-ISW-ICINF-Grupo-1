"use strict";
import { EntitySchema } from "typeorm";

const Usuario = new EntitySchema({
  name: "Usuario",
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
      length: 13,
      nullable: false
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    contrasena: {
      type: "varchar",
      length: 32,
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

const Publicacion = new EntitySchema({
  name: "Publicacion",
  tableName: "publicacion",
  columns:{
    id_publicacion: {
      primary: true,
      type: "int",
      generated: true
    },
    titulo:{
      type: "varchar",
      length: 83,
      nullable: false
    },
    tipo:{
      type: "varchar",
      length: 32,
      nullable: false
    },
    contenido:{
      type: "varchar",
      length: 1024,
      nullable: false
    },
    fecha_publicacion:{
      type: "date",
      nullable: false
    },
  },
  relations:{
    usuario:{
      type:"many-to-one",
      target: "Usuario",
      joinColumn:{name: "id_usuario"},
    },
  },
})

export default (Usuario, Publicacion);