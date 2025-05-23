"use strict";
import Joi from "joi";

export const convocatoriaQueryValidation = Joi.object({
    id_convocatoria: Joi.number()
    .Integer()
    .positive()
    .messages({
        "integer.empty": "El id de la convocatoria no puede estar vacío",
        "integer.base": "El id de la convocatoria debe ser un integer",
        "integer.positive": "El id de la convocatoria debe ser positivo"       
    }), 
    titulo: Joi.string()
    .min(50)
    .max(250)
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser tipo Varchar",
        "string.min": "El titulo debe tener como mínimo 50 caracteres",
        "string.max": "El titulo debe tener como máximo 250",
        "string.pattern.base": "El nombre solo puede contener letras y espacios"
    }),
    fecha_inicio: Joi.date()
    .iso()
    .messages({
        "date.empty": "La fecha de inicio no puede estar vacía",
        "date.base": "La fecha de inicio debe ser tipo Date",
        "date.iso": "La fecha de inicio debe estar en formato AAAA-MM-DD",
    }),
    fecha_cierre: Joi.date()
    .iso()
    .greater(Joi.ref('fecha_inicio'))
    .messages({
        "date.empty": "La fecha de cierre no puede estar vacía",
        "date.base": "La fecha de cierre debe ser de tipo Date",
        "date.iso": "La fecha debe estar en formato AAAA-MM-DD",
        "date.greater": "La fecha de cierre no puede ser anterior a la fecha de inicio"
    })
})

export const convocactoriaBodyValidation = Joi.object({
    id_convocatoria: Joi.number()
    .Integer()
    .positive()
    .messages({
        "integer.empty": "El id de la convocatoria no puede estar vacío",
        "integer.base": "El id de la convocatoria debe ser un integer",
        "integer.positive": "El id de la convocatoria debe ser positivo"       
    }), 
    titulo: Joi.string()
    .min(50)
    .max(250)
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser tipo Varchar",
        "string.min": "El titulo debe tener como mínimo 50 caracteres",
        "string.max": "El titulo debe tener como máximo 250",
        "string.pattern.base": "El nombre solo puede contener letras y espacios"
    }),
    descripcion: Joi.String()
    .min(10)
    .max(1000)
    .messages({
        "String.empty": "La descripción no puede estar vacía",
        "String.base": "La descripción debe ser de tipo TEXT",
        "String.min": "La descripción debe contener mínimo 10 caracteres",
        "String.max": "La descripción puede contener máximo 1000 caracteres"
    }),
    requisitos: Joi.String()
    .min(10)
    .max(1000)
    .messages({
        "String.empty": "La descripción no puede estar vacía",
        "String.base": "La descripción debe ser de tipo TEXT",
        "String.min": "La descripción debe contener mínimo 10 caracteres",
        "String.max": "La descripción puede contener máximo 1000 caracteres"
    }),
    fecha_inicio: Joi.date()
    .iso()
    .messages({
        "date.empty": "La fecha de inicio no puede estar vacía",
        "date.base": "La fecha de inicio debe ser tipo Date",
        "date.iso": "La fecha de inicio debe estar en formato AAAA-MM-DD",
    }),
    fecha_cierre: Joi.date()
    .iso()
    .greater(Joi.ref('fecha_inicio'))
    .messages({
        "date.empty": "La fecha de cierre no puede estar vacía",
        "date.base": "La fecha de cierre debe ser de tipo Date",
        "date.iso": "La fecha debe estar en formato AAAA-MM-DD",
        "date.greater": "La fecha de cierre no puede ser anterior a la fecha de inicio"
    }),
    estado: Joi.String()
    .min(3)
    .max(50)
    .messages({
        "String.empty": "El estado no puede estar vacío",
        "String.base": "El estado debe ser de tipo Varchar",
        "String.min": "El estado debe contener más de 3 caracteres",
        "String.max": "El estado no debe contener más de 50 caracteres"
    })
}).or(
    "id_publicacion",
    "titulo",
    "descripción",
    "requisitos",
    "fecha_inicio",
    "fecha_cierre",
    "estado",
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: titulo, requisitos, fecha de inicio o fecha de cierre"
  });