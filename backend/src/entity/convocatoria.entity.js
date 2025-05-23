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
            type: "date",
            nullable: false
        },
        fecha_cierre:{
            type: "date",
            nullable: false
        },
        estado:{
            type: "varchar",
            length: 50
        },
    },
});
export default Convocatoria;