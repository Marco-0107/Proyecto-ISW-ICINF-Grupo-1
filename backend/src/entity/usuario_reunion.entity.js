"use stric";
import {EntitySchema} from "typeorm";
const UsuarioReunion=new EntitySchema({
    name: "UsuarioReunion",
    tableName: "usuario_reunion",
    columns:{
        id:{
            type: "int",
            primary: true
        },
        id_reunion:{
            type: "int",
            primary: true
        },
        id_token:{
            type: "int",
            nullable: true
        },
        numero_token:{
            type:"int",
            nullable:true
        },
        asistio:{
            type: "boolean",
        },
        fecha_confirmacion_asistencia:{
            type: "date",
            nullable: true
        },
    },
    relations:{
        User:{
            type: "many-to-one",
            target: "User",
            joinColumn:{
                name:"id"
            },
            primary:true,
        },
        Reunion:{
            type: "many-to-one",
            target: "Reunion",
            joinColumn:{
                name:"id_reunion"
            },
            primary:true,
        },
    }
});
export default UsuarioReunion;