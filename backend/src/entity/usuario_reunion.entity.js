"use stric";
import {EntitySchema} from "typeorm";
const UsuarioReunion=new EntitySchema({
    name: "UsuarioReunion",
    tableName: "usuario_reunion",
    columns:{
        id_usuario:{
            type: "int",
            primary: true
        },
        id_reunion:{
            type: "int",
            primary: true
        },
        id_token:{
            type: "int"
        },
        asistio:{
            type: "Boolean"
        },
        fecha_confirmacion_asistencia:{
            type: "date",
            nullable: true      //  true???
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
        Reunion:{
            type: "many-to-one",
            target: "Reunuion",
            joinColumn:{
                name:"id_reunion"
            },
        },
    }
});
export default UsuarioReunion;