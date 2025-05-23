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
            type: "text",
            length: 512
        },
        fecha_reunion:{
            type:"date",
            nullable:false
        },
        objetivo:{
            type: "text",
            length: 512
        },
        observaciones:{
            type: "text",
            length: 512
        },
    },
});
export default Reunion;