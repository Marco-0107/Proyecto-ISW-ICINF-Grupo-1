"use strict";
import { EntitySchema } from "typeorm"

const UsuarioCuota = new EntitySchema({
    name: "UsuarioCuota",
    tableName: "usuario_cuota",
    columns: {
        id_usuario: {
            type: "int",
            primary: true
        },
        id_cuota: {
            type: "int",
            primary: true
        },
        estado_pago: {
            type: "varchar", //podria ser boolean?
            length:50
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
        cuotas_vecinales:{
            type: "many-to-one",
            target: "cuotas__vecinales",
            joinColumn:{
                name:"id_cuota"
            },
        },
    }
})
export default UsuarioCuota;