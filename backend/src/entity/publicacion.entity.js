"use strict";
import { EntitySchema } from "typeorm";

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
      length: 255,
      nullable: false
    },
    tipo:{
      type: "varchar",
      length: 50,
      nullable: false
    },
    contenido:{
      type: "text",
      length: 1024,
      nullable: false
    },
    fecha_publicacion:{
      type: "date",
      nullable: false
    },
    estado:{
      type:"varchar",
      length:50
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

export default (Publicacion);