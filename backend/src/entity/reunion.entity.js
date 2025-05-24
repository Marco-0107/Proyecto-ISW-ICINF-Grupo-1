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
        fecha_reunion:{
            type:"date",
            nullable:false
        },
        objetivo:{
            type: "text"
        },
        observaciones:{
            type: "text"
        },
        fechaActualizacion:{
            type: "date"
        }
    },
});
export default Reunion;