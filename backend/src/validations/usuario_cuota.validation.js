"use strict";
import Joi from "joi";

export const usuarioCuotaQueryValidation = Joi.object({
    id_usuario: Joi.number()
        .integer()
        .positive()
        .messages({
          "number.base": "El id debe ser un número.",
          "number.integer": "El id debe ser un número entero.",
          "number.positive": "El id debe ser un número positivo.",
        }),
    id_cuota: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El id debe ser un número",
            "number.integer": "El id debe ser un número entero.",
            "number.positive": "El id debe ser un número positivo"
        }),
    estado_pago: Joi.string()
        .min(3)
        .max(50)
        .messages({
            "String.empty": "El estado de pago no puede estar vacío.",
            "String.base": "El estado de pago debe ser tipo Varchar.",
            "String.min": "El estado de pago debe contener mínimo 3 caracteres.",
            "String.max": "El estado de pago puede contener máximo 50 caracteres."
        })
})

export const usuarioCuotaBodyValidation = Joi.object({
    id_usuario: Joi.number()
        .integer()
        .positive()
        .messages({
          "number.base": "El id debe ser un número.",
          "number.integer": "El id debe ser un número entero.",
          "number.positive": "El id debe ser un número positivo.",
        }),
    id_cuota: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El id debe ser un número",
            "number.integer": "El id debe ser un número entero.",
            "number.positive": "El id debe ser un número positivo"
        }),
    estado_pago: Joi.string()
        .min(3)
        .max(50)
        .messages({
            "String.empty": "El estado de pago no puede estar vacío.",
            "String.base": "El estado de pago debe ser tipo Varchar.",
            "String.min": "El estado de pago debe contener mínimo 3 caracteres.",
            "String.max": "El estado de pago puede contener máximo 50 caracteres."
        })
}).or(
    "id_usuario",
    "id_cuota",
    "estado_pago",  
)
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos: id_usuario, id_cuota y estado_pago."
  });