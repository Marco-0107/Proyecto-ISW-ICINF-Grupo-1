"use strict";
import Joi from "joi";

export const usuarioConvocatoriaQueryValidation = Joi.object({
    id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
    id_convocatoria: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id de la convocatoria no puede estar vacío",
        "integer.base": "El id de la convocatoria debe ser un integer",
        "integer.positive": "El id de la convocatoria debe ser positivo"       
    })
})

export const usuarioConvocatoriaBodyValidation = Joi.object({
    id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
    id_convocatoria: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id de la convocatoria no puede estar vacío",
        "integer.base": "El id de la convocatoria debe ser un integer",
        "integer.positive": "El id de la convocatoria debe ser positivo"       
    })
}).or(
    "id",
    "id_convocatoria",
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos: id_usuario, id_convocatoria"
  });