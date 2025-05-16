const Publicacion = new EntitySchema({
  name: "Publicacion",
  tableName: "publicacion",
  columns:{
    id_publicacion: {
      primary: true,
      type: "int",
      generated: true
    },
    titulo:{
      type: "varchar",
      length: 83,
      nullable: false
    },
    tipo:{
      type: "varchar",
      length: 32,
      nullable: false
    },
    contenido:{
      type: "varchar",
      length: 1024,
      nullable: false
    },
    fecha_publicacion:{
      type: "date",
      nullable: false
    },
  },
  relations:{
    usuario:{
      type:"many-to-one",
      target: "Usuario",
      joinColumn:{name: "id_usuario"},
    },
  },
})

export default (Publicacion);