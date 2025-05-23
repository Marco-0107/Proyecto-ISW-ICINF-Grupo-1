"use strict";
import Joi from "joi";

export const tokenQueryValidation = Joi.object({
    id_token: Joi.number()
    .Integer()
    .positive()
    .messages({
        "integer.empty": "El id de la notificación no puede estar vacío",
        "integer.base": "El id de la notificación debe ser un integer",
        "integer.positive": "El id de la notificación debe ser positivo"
    }),
    numero_token: Joi.number()
    .Integer()
    .positive()
    .messages({
        "String.empty": "El numero de token no puede estar vacío",
        "String.base": "El numero de token debe ser de tipo entero",
        "String.positive": "El numero de token debe ser positivo"
    }),
    id_usuario:  Joi.number()
    .integer()
    .positive()
    .messages({
        "number.base": "El id debe ser un número.",
        "number.integer": "El id debe ser un número entero.",
        "number.positive": "El id debe ser un número positivo.",
    })
})

export const tokenBodyValidation = Joi.object({
    id_token: Joi.number()
    .Integer()
    .positive()
    .messages({
        "integer.empty": "El id de la notificación no puede estar vacío",
        "integer.base": "El id de la notificación debe ser un integer",
        "integer.positive": "El id de la notificación debe ser positivo"
    }),
    numero_token: Joi.number()
    .Integer()
    .positive()
    .messages({
        "String.empty": "El numero de token no puede estar vacío",
        "String.base": "El numero de token debe ser de tipo entero",
        "String.positive": "El numero de token debe ser positivo"
    }),
    fecha_generacion: Joi.Date()
    .iso()
    .max(now)
    .messages({
        "date.empty": "La fecha de movimiento no puede estar vacía",
        "date.base": "La fecha de movimiento debe ser tipo Date",
        "date.iso": "La fecha de movimiento debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor máximo la fecha actual"
    }),
    estado: Joi.String()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ\s]+$/)
    .messages({
        "String.empty": "El estado de visualización no puede estar vacío",
        "String.base": "El estado de visualización debe ser de tipo Varchar",
        "String.min": "El estado de visualización debe contener mínimo 3 caracteres",
        "String.max": "El estado de visualización debe contener máximo 50 caracteres",
        "String.pattern.base": "El tipo de movimiento solo puede contener letras, numeros y los caracteres: - ' . #."
    }), 
    id_usuario:  Joi.number()
    .integer()
    .positive()
    .messages({
        "number.base": "El id debe ser un número.",
        "number.integer": "El id debe ser un número entero.",
        "number.positive": "El id debe ser un número positivo.",
    })
}).or(
    "id_token",  
    "numero_token",
    "fecha_generacion",
    "estado",
    "id_usuario",
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos: numero y fecha."
  });