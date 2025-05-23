"use strict";
import {EntitySchema} from "typeorm";
import Convocatoria from "../entity/convocatoria.entity.js";
import User from "../entity/user.entity.js";
const UsuarioConvocatoria=new EntitySchema({
    name: "UsuarioConvocatoria",
    tableName: "usuario_convocatoria",
    columns:{
        id:{
            type:"int",
            primary:true
        },
        id_convocatoria:{
            type:"int",
            primary:true
        }
    },
    relations:{
        User:{
            type:"many-to-one",
            target: "User",
            joinColumn:{
                name:"id"
            },
            primary:true,
        },
        Convocatoria:{
            type:"many-to-one",
            target:"Convocatoria",
            joinColumn:{
                name:"id_convocatoria"
            },
            primary:true,
        },
    },
});
export default UsuarioConvocatoria;