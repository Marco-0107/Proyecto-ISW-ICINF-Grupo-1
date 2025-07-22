"use strict";
import Joi from "joi";

export const reunionQueryValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .messages({
          "number.base": "El id debe ser un número.",
          "number.integer": "El id debe ser un número entero.",
          "number.positive": "El id debe ser un número positivo.",
        }),
    id_reunion: Joi.number()
        .integer()
        .positive()
        .messages({
            "integer.empty": "El id no puede estar vacío",
            "integer.base": "El id debe ser un integer",
            "integer.positive": "El id debe ser positivo"        
        }),
    lugar: Joi.string()
       .min(5)
       .max(255)
       .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/)
       .messages({
        "string.empty": "El lugar no puede estar vacía",
        "string.base": "El lugar debe ser de tipo Varchar",
        "string.min": "El lugar debe tener mínimo 5 caracteres",
        "string.max": "El lugar debe tener como máximo 255 caracteres"
       }),
    fecha_reunion: Joi.date()
    .iso()
    .messages({
        "date.empty": "La fecha no puede estar vacía",
        "date.base": "La fecha debe ser tipo Date",
        "date.iso": "La fecha debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor mínimo la fecha de hoy"
        }),
    
})

export const reunionBodyValidation = Joi.object({
    id_reunion: Joi.number()
        .integer()
        .positive()
        .messages({
            "integer.empty": "El id no puede estar vacío",
            "integer.base": "El id debe ser un integer",
            "integer.positive": "El id debe ser positivo"        
        }), 
    lugar: Joi.string()
       .min(5)
       .max(255)
       .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/)
       .messages({
        "string.empty": "El lugar no puede estar vacía",
        "string.base": "El lugar debe ser de tipo Varchar",
        "string.min": "El lugar debe tener mínimo 5 caracteres",
        "string.max": "El lugar debe tener como máximo 255 caracteres"
       }),
    descripcion: Joi.string()
       .min(10)
       .max(1000)
       .messages({
        "String.empty": "La descripción no puede estar vacía",
        "String.base": "La descripción debe ser de tipo TEXT",
        "String.min": "La descripción debe contener mínimo 10 caracteres",
        "String.max": "La descripción puede contener máximo 1000 caracteres"
       }),
    fecha_reunion: Joi.date()
    .iso()
    .min("now")
    .messages({
        "date.empty": "La fecha no puede estar vacía",
        "date.base": "La fecha debe ser tipo Date",
        "date.iso": "La fecha debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor mínimo la fecha de hoy"
    }),
    objetivo: Joi.string()
        .min(10)
        .max(1000)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/)
        .messages({
            "String.empty": "El objetivo puede estar vacío",
            "String.base": "El objetivo debe ser tipo TEXT",
            "String.min": "El objetivo debe contener mínimo 10 caracteres",
            "String.max": "El objetivo puede contener máximo 1000 caracteres"
    }),
    observaciones: Joi.string()
        .min(10)
        .max(3000)
        .pattern(/^[\s\S]*$/) 
        .messages({
            "String.empty": "Las observaciones no pueden estar vacías",
            "String.base": "Las observaciones debe ser texto",
            "String.min": "Las observaciones debe contener al menos 10 caracteres",
            "String.max": "Las observaciones puede contener hasta 3000 caracteres"
        }),
    fechaActualizacion: Joi.date()
    .iso()
    .messages({
        "date.empty": "La fecha no puede estar vacía",
        "date.base": "La fecha debe ser tipo Date",
        "date.iso": "La fecha debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor mínimo la fecha de hoy"
    })
}).or(
    "id_reunion",
    "lugar",
    "descripcion",
    "fecha_reunion",
    "objetivo",
    "observaciones",
    "fechaActualizacion"
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: lugar, descripción, fecha_reunion"
  });

export const reunionEditValidation = Joi.object({
  id_reunion: Joi.number()
    .integer()
    .positive()
    .required(),

  lugar: Joi.string()
    .min(5)
    .max(255)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/),

  descripcion: Joi.string()
    .min(10)
    .max(1000),

  fecha_reunion: Joi.date()
    .iso(), 

  objetivo: Joi.string()
    .min(10)
    .max(1000)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/),

  observaciones: Joi.string()
    .min(10)
    .max(3000)
    .pattern(/^[\s\S]*$/),

  fechaActualizacion: Joi.date()
    .iso()
}).or(
  "lugar",
  "descripcion",
  "fecha_reunion",
  "objetivo",
  "observaciones",
  "fechaActualizacion"
).messages({
  "object.missing": "Debes proporcionar al menos un campo para actualizar.",
});


  
