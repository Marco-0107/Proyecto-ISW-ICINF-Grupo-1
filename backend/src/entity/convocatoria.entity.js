"use stric";
import { EntitySchema } from "typeorm";
const Convocatoria = new EntitySchema({
    name: "Convocatoria",
    tableName: "convocatoria",
    columns:{
        id_convocatoria:{
            primary: true,
            type: "int",
            generated: true
        },
        titulo: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        descripcion:{
            type: "text",
            nullable: false
        },
        requisitos:{
            type: "text",
            nullable: false
        },
        fecha_inicio:{
            type: "timestamp",
            nullable: false
        },
        fecha_cierre:{
            type: "date",
            nullable: false
        },
        fechaActualizacion:{
            type:"timestamp",
            nullable:false
        },
        estado:{
            type: "boolean"
        },
        archivo_convocatoria:{
            type: "int",
            nullable: true
        },
    },
});
export default Convocatoria;