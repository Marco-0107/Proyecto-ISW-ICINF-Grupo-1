"use strict";
import { EntitySchema } from "typeorm"

const UsuarioCuota = new EntitySchema({
    name: "UsuarioCuota",
    tableName: "usuario_cuota",
    columns: {
        id: {
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
        User:{
            type: "many-to-one",
            target: "User",
            joinColumn:{
                name:"id"
            },
            primary:true,
        },
        cuotas_vecinales:{
            type: "many-to-one",
            target: "cuotas_vecinales",
            joinColumn:{
                name:"id_cuota"
            },
            primary:true,
        },
    }
})
export default UsuarioCuota;