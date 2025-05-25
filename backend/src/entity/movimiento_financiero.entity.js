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
        tipo_transaccion:{
            type:"varchar",
            length:50
        },
        paga:{
            type:"boolean"
        },
        fechaActualizacion:{
            type:"date",
            nullable:false
        },
    },
    relations:{
        User:{
            type:   "many-to-one",
            target: "User",
            joinColumn:{
                name: "id"
            },
            primary:true,
        },
        cuota:{
            type:"many-to-one",
            target: "CuotasVecinales",
            joinColumn:{
                name:"id_cuota"
            },
            primary:true,
        },
    },
});
export default MovimientoFinanciero;