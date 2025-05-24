"use strict";
import Joi from "joi";

export const cuotas_vecinalesQueryValidation = Joi.object({
    id_cuota: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El id debe ser un número",
            "number.integer": "El id debe ser un número entero.",
            "number.positive": "El id debe ser un número positivo"
        }),
    monto_c: Joi.number()
        .precision(2)
        .min(0)
        .max(99999999.99)
        .messages({
            "number.base": "El monto de la cuota debe ser un numero",
            "number.empty": "El monto de la cuota no puede estar vacío",
            "number.precision": "El monto de la cuota puede contener hasta 2 decimales",
            "number.min": "El monto de la cuota no puede ser negativo",
            "number.max": "El monto de la cuota debe ser menor a 10 millones"
        }),
    fecha_emision: Joi.date()
        .iso()
        .max("now")
        .messages({
            "date.empty": "La fecha de emision no puede estar vacía",
            "date.base": "La fecha de emision debe ser tipo Date",
            "date.iso": "La fecha de emision debe estar en formato AAAA-MM-DD",
            "date.max": "La fecha puede tomar como valor máximo la fecha actual"
    })
})

export const cuotas_vecinalesBodyValidation = Joi.object({
    id_cuota: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El id debe ser un número",
            "number.integer": "El id debe ser un número entero.",
            "number.positive": "El id debe ser un número positivo"
        }),
    monto_c: Joi.number()
        .precision(2)
        .min(0)
        .max(99999999.99)
        .messages({
            "number.base": "El monto de la cuota debe ser un numero",
            "number.empty": "El monto de la cuota no puede estar vacío",
            "number.precision": "El monto de la cuota puede contener hasta 2 decimales",
            "number.min": "El monto de la cuota no puede ser negativo",
            "number.max": "El monto de la cuota debe ser menor a 10 millones"
        }),
        fecha_emision: Joi.date()
        .iso()
        .max("now")
        .messages({
            "date.empty": "La fecha de emision no puede estar vacía",
            "date.base": "La fecha de emision debe ser tipo Date",
            "date.iso": "La fecha de emision debe estar en formato AAAA-MM-DD",
            "date.max": "La fecha puede tomar como valor máximo la fecha actual"
    })
}).or(
    "id_cuota",
    "monto_c",
    "fecha_emision",
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: monto_c"
  });