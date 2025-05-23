"use stric";
import {EntitySchema} from "typeorm";
import Usuario from "./user.entity";
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
            type:"text",
            length:512
        },
        tipo:{
            type:"varchar",
            length:64
        },
        fecha:{ 
            type:"date",
            nullable:true
        },
        estado_visualizacion:{
            type:"varchar",
            length:64
        },
    },
    relations:{
        Usuario:{
            type: "many-to-one",
            target: "Usuario",
            joinColumn:{
                name:"id_usuario"
            },
        },
    },
});
export default Notificacion;