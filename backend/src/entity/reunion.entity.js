"use strict";
import{EntitySchema} from "typeorm";
const Reunion=new EntitySchema({
    name: "Reunion",
    tableName: "reunion",
    columns:{
        id_reunion:{
            type:"int",
            primary: true,
            generated: true
        },
        lugar:{
            type:"varchar",
            length:255
        },
        descripcion:{
            type: "text"
        },
        observaciones:{
            type: "text",
            nullable: true
        },
        fecha_reunion:{
            type:"timestamp",
            nullable:false
        },
        fechaActualizacion:{
            type: "timestamp"
        },
        archivo_acta: {
            type: "varchar",
            length: 500,
            nullable: true,
        },
    },
});
export default Reunion;