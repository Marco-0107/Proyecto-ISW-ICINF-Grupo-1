"use strict";
import Joi from "joi";

export const movimiento_financieroQueryValidation = Joi.object({
    id_movimiento: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id de la convocatoria no puede estar vacío",
        "integer.base": "El id de la convocatoria debe ser un integer",
        "integer.positive": "El id de la convocatoria debe ser positivo"       
    }),
    tipo_movimiento: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/)
    .messages({
        "String.empty": "El tipo de movimiento puede estar vacío",
        "String.base": "El tipo de movimiento debe ser tipo Varchar",
        "String.min": "El tipo de movimiento debe contener mínimo 10 caracteres",
        "String.max": "El tipo de movimiento puede contener máximo 1000 caracteres"
    }),
    estado: Joi.string()
    .min(3)
    .max(50)
    .messages({
        "String.empty": "El estado no puede estar vacío",
        "String.base": "El estado debe ser de tipo Varchar",
        "String.min": "El estado debe contener más de 3 caracteres",
        "String.max": "El estado no debe contener más de 50 caracteres"
    }),
    id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
})

export const movimiento_financieroBodyValidation = Joi.object({
    id_movimiento: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id de la convocatoria no puede estar vacío",
        "integer.base": "El id de la convocatoria debe ser un integer",
        "integer.positive": "El id de la convocatoria debe ser positivo"       
    }), 
    tipo_movimiento: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/)
    .messages({
        "String.empty": "El tipo de movimiento puede estar vacío",
        "String.base": "El tipo de movimiento debe ser tipo Varchar",
        "String.min": "El tipo de movimiento debe contener mínimo 10 caracteres",
        "String.max": "El tipo de movimiento puede contener máximo 1000 caracteres"
    }),
    monto: Joi.number()
    .precision(2)
    .min(0)
    .max(99999999.99)
    .messages({
        "number.base": "El monto debe ser un numero",
        "number.empty": "El monto no puede estar vacío",
        "number.precision": "El monto puede contener hasta 2 decimales",
        "number.min": "El monto no puede ser negativo",
        "number.max": "El monto debe ser menor a 10 millones"
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
    fecha_movimiento: Joi.date()
    .iso()
    .max("now")
    .messages({
        "date.empty": "La fecha de movimiento no puede estar vacía",
        "date.base": "La fecha de movimiento debe ser tipo Date",
        "date.iso": "La fecha de movimiento debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor máximo la fecha actual"
    }),
    estado: Joi.string()
    .min(3)
    .max(50)
    .messages({
        "String.empty": "El estado no puede estar vacío",
        "String.base": "El estado debe ser de tipo Varchar",
        "String.min": "El estado debe contener más de 3 caracteres",
        "String.max": "El estado no debe contener más de 50 caracteres"
    }),
    id: Joi.number()
    .integer()
    .positive()
    //.required()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
    id_cuota: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    })
}).or(
    "id_movimiento",
    "tipo_movimiento",
    "monto",
    "descripción",
    "fecha_movimiento",
    "estado",
    //"forma_pago",
  )
  .unknown(true)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: tipo de movimiento, monto, fecha_movimiento"
  });
