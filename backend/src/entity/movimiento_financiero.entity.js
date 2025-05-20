"use strict";
import {EntitySchema} from "typeorm";
import Usuario from "./user.entity";
const MovimientoFinanciero=new EntitySchema({
    name: "MovimientoFinanciero",
    tableName: "movimiento_financiero",
    columns:{
        id_movimiento:{
            type:"int",
            primary:true,
            generated:true
        },
        tipo_movimiento:{
            type: "varchar",
            length: 50
        },
        monto:{
            type:"int"
        },
        descripcion:{
            type:"text",
            length:512
        },
        fecha_movimiento:{
            type:"date",
            nullable:false
        },
        estado:{
            type:"varchar",
            length:50
        },
        paga:{
            type:"boolean"
        },
    },
    relations:{
        Usuario:{
            type:   "many-to-one",
            target: "Usuario",
            joinColumn:{
                name: "id_usuario"
            },
        },
        cuota:{
            type:"many-to-one",
            target: "CuotasVecinales",
            joinColumn:{
                name:"id_cuota"
            },
            nullable:true,
        },
    },
});
export default MovimientoFinanciero;