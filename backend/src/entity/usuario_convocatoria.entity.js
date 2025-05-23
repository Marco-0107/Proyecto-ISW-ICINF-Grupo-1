"use strict";
import {EntitySchema} from "typeorm";
import Convocatoria from "./convocatoria.entity";
const UsuarioConvocatoria=new EntitySchema({
    name: "UsuarioConvocatoria",
    tableName: "usuario_convocatoria",
    columns:{},
    relations:{
        Usuario:{
            type:"many-to-one",
            target: "Usuario",
            joinColumn:{
                name:"id_usuario"
            },
        },
        Convocatoria:{
            type:"many-to-one",
            target:"Convocatoria",
            joinColumn:{
                name:"id_convocatoria"
            },
        },
    },
});
export default UsuarioConvocatoria;