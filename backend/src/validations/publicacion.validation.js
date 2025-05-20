"use strict";
import Joi from "joi";

export const publicacionQueryValidation = Joi.object({
    id_publicacion: Joi.number()
    .Integer()
    .positive()
    .messages({
        "integer.empty": "El id no puede estar vacío",
        "integer.base": "El id debe ser un integer",
        "integer.positive": "El id debe ser positivo"        
    }), 
    titulo: Joi.string()
    .min(50)
    .max(250)
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser tipo string",
        "string.min": "El titulo debe tener como mínimo 50 caracteres",
        "string.max": "El titulo debe tener como máximo 250",
        "string.pattern.base": "El nombre solo puede contener letras y espacios"
    })
})

export const publicacionBodyValidation = Joi.object({
    id_publicacion: Joi.number()
    .Integer()
    .positive()
    .messages({
        "integer.empty": "El id no puede estar vacío",
        "integer.base": "El id debe ser un integer",
        "integer.positive": "El id debe ser positivo"
    }),
    titulo: Joi.string()
    .min(50)
    .max(250)
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser tipo string",
        "string.min": "El titulo debe tener como mínimo 50 caracteres",
        "string.max": "El titulo debe tener como máximo 250",
        "string.pattern.base": "El nombre solo puede contener letras y espacios"
    }),
    tipo: Joi.string()
    .min(5)
    .max(25)
    .messages({
        "string.empty": "El tipo no puede estar vacío",
        "string.base": "El tipo debe ser tipo String",
        "string.min": "El titulo debe tener como mínimo 5 caracteres",
        "string.max": "El titulo debe tener como mínimo 25 caracteres",
        "string.pattern.base": "El tipo solo puede contener letras y espacios"
    }),
    contenido: Joi.text()
    .min(1)
    .max(5000)
    .messages({
        "string.empty": "El contenido no puede estar vacío",
        "string.base": "El contenido debe ser tipo TEXT",
        "string.min": "El contenido debe tener como mínimo 1 caracter",
        "string.max": "El contenido debe tener como máximo 5000 caracteres"
    }),
    fecha_publicacion: Joi.date()
    .iso()
    .max(now)
    .messages({
        "date.empty": "La fecha no puede estar vacía",
        "date.base": "La fecha debe ser tipo Date",
        "date.iso": "La fecha debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor máximo la fecha actual"
    }),
    id_usuario: Joi.number()
    .Integer()
    .positive()
    .messages({
        "number.empty": "El id debe no puede estar vacío",
        "number.base": "El id debe ser un integer",
        "integer.positive": "El id debe ser positivo"
    })
}).or(
    "id_publicacion",
    "titulo",
    "tipo",
    "contenido",
    "fecha_publicacion",
    "estado",
    "id_usuario",
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: titulo, tipo"
  });