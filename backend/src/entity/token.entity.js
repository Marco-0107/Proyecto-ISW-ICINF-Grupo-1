"use strict";
import {EntitySchema} from "typeorm";
import Usuario from "../entity/user.entity.js";
const Token= new EntitySchema({
    name: "Token",
    tableName: "token",
    columns:{
        id_token:{
            type: "int",
            primary: true,
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
        User:{
            type:"many-to-one",
            target: "User",
            joinColumn: {
                name: "id"
            },
            primary:true,
        },
    },
});
export default Token;