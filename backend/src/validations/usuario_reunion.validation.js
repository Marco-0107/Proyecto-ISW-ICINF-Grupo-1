"use strict";
import Joi from "joi";

export const usuarioReunionQueryValidation = Joi.object({
    id_usuario: Joi.number()
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
    id_token: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id de la notificación no puede estar vacío",
        "integer.base": "El id de la notificación debe ser un integer",
        "integer.positive": "El id de la notificación debe ser positivo"
    }),
    fecha_confirmacion_asistencia: Joi.date()
    .iso()
    .max("now")
    .messages({
        "Date.empty": "La fecha de confirmación no puede estar vacía",
        "Date.base": "La fecha de confimación debe ser de tipo Date",
        "Date.iso": "La fecha de confirmación debe estar en el formato AAAA-MM-DD",
        "Date.max": "La fecha de confirmación no puede tomar fechas posteriores a la actual"
    })
})

export const usuarioReunionBodyValidation = Joi.object({
     id_usuario: Joi.number()
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
    id_token: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id de la notificación no puede estar vacío",
        "integer.base": "El id de la notificación debe ser un integer",
        "integer.positive": "El id de la notificación debe ser positivo"
    }),
    asistio: Joi.boolean()
    .messages({
      "boolean.empty": "El estado de actividad no puede estar vacío",
      "boolean.base": "El estado de actividad debe ser de tipo boolean"
    }),
    fecha_confirmacion_asistencia: Joi.date()
    .iso()
    .max("now")
    .messages({
        "Date.empty": "La fecha de confirmación no puede estar vacía",
        "Date.base": "La fecha de confimación debe ser de tipo Date",
        "Date.iso": "La fecha de confirmación debe estar en el formato AAAA-MM-DD",
        "Date.max": "La fecha de confirmación no puede tomar fechas posteriores a la actual"
    })
}).or(
    "id_usuario",
    "id_reunion",
    "id_token",
    "asitio",
    "fecha_confirmacion_asistencia"
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: tipo de id_usuario, id_reunion, asistio"
  });