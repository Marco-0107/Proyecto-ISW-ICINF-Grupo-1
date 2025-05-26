"use strict";
import {EntitySchema} from "typeorm";
import Usuario from "../entity/user.entity.js";
const Notificacion=new EntitySchema({
    name: "Notificacion",
    tableName: "notificacion_alerta",
    columns:{
        id_notificacion:{
            type:"int",
            primary:true,
            generated:true
        },
        titulo:{
            type:"varchar",
            length: 255
        },
        descripcion:{
            type:"text"
        },
        tipo:{
            type:"varchar",
            length:64
        },
        fecha:{ 
            type:"date",
            nullable:true
        },
        fechaActualizacion:{
            type:"date",
            nullable:false
        },
        estado_visualizacion:{
            type:"varchar",
            length:64
        }
    },
    relations:{
        User:{
            type: "many-to-one",
            target: "User",
            joinColumn:{
                name:"id"
            },
        },
    },
});
export default Notificacion;