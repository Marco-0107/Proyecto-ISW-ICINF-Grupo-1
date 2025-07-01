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
            type: "timestamp",
            nullable: false
        },
        estado:{
            type:"varchar",
            length: 50
        },
    },
    relations:{
        Reunion:{
            type: "many-to-one",
            target: "Reunion",
            joinColumn:{
                name:"id_reunion"
            },
            onDelete: "CASCADE",
        },
    },
});
export default Token;