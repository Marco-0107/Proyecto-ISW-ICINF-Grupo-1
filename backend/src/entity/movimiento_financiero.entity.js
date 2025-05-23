"use strict";
import {EntitySchema} from "typeorm";
import Usuario from "../entity/user.entity.js";
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
            type:"text"
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
        User:{
            type:   "many-to-one",
            target: "User",
            joinColumn:{
                name: "id"
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