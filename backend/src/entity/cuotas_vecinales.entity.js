"use strict";
import {EntitySchema} from "typeorm";

const CuotasVecinales=new EntitySchema({
    name: "CuotasVecinales",
    tableName: "cuotas_vecinales",
    columns:{
        id_cuota:{
            primary: true,
            type: "int",
            generated: true
        },
        monto_c:{
            type:"int"
        },
        fecha_emision:{
            type: "date",
            nullable: false
        },
    },
});
export default CuotasVecinales;