"use strict";
import {EntitySchema} from "typeorm";
import Usuario from "./user.entity";
const Token= new EntitySchema({
    name: "Token",
    tableName: "token",
    columns:{
        id_token:{
            type: "int",
            primery: true,
            generated: true
        },
        numero_token:{
            type:"varchar",
            length:50
        },
        fecha_generacion:{
            type: "date",
            nullable: false
        },
        estado:{
            type:"varchar",
            length: 50
        },
    },
    relations:{
        Usuario:{
            type:"many-to-one",
            target: "Usuario",
            joinColumn: {
                name: "id_usuario"
            },
        },
    },
});
export default Token;