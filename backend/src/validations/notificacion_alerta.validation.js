"use strict";
import Joi from "joi";

export const notificacion_alertaQueryValidation = Joi.object({
    id_notificacion: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id de la notificación no puede estar vacío",
        "integer.base": "El id de la notificación debe ser un integer",
        "integer.positive": "El id de la notificación debe ser positivo"
    }),
    titulo: Joi.string()
    .min(3)
    .max(250)
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser tipo Varchar",
        "string.min": "El titulo debe tener como mínimo 3 caracteres",
        "string.max": "El titulo debe tener como máximo 250",
        "string.pattern.base": "El nombre solo puede contener letras y espacios"
    }),
    tipo: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/)
    .messages({
        "String.empty": "El tipo de movimiento puede estar vacío",
        "String.base": "El tipo de movimiento debe ser tipo Varchar",
        "String.min": "El tipo de movimiento debe contener mínimo 10 caracteres",
        "String.max": "El tipo de movimiento puede contener máximo 1000 caracteres"
    }),
    fecha: Joi.date()
    .iso()
    .max("now")
    .messages({
        "date.empty": "La fecha de movimiento no puede estar vacía",
        "date.base": "La fecha de movimiento debe ser tipo Date",
        "date.iso": "La fecha de movimiento debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor máximo la fecha actual"
    }),
    id_usuario: Joi.number()
    .integer()
    .positive()
    .messages({
        "number.base": "El id debe ser un número.",
        "number.integer": "El id debe ser un número entero.",
        "number.positive": "El id debe ser un número positivo.",
    })
})

export const notificacion_alertaBodyValidation = Joi.object({
    id_notificacion: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id de la notificación no puede estar vacío",
        "integer.base": "El id de la notificación debe ser un integer",
        "integer.positive": "El id de la notificación debe ser positivo"
    }),
    titulo: Joi.string()
    .min(3)
    .max(250)
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser tipo Varchar",
        "string.min": "El titulo debe tener como mínimo 3 caracteres",
        "string.max": "El titulo debe tener como máximo 250",
        "string.pattern.base": "El nombre solo puede contener letras y espacios"
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
    tipo: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/)
    .messages({
        "String.empty": "El tipo de movimiento puede estar vacío",
        "String.base": "El tipo de movimiento debe ser tipo Varchar",
        "String.min": "El tipo de movimiento debe contener mínimo 10 caracteres",
        "String.max": "El tipo de movimiento puede contener máximo 1000 caracteres",
        "String.pattern.base": "El tipo de movimiento solo puede contener letras, numeros y los caracteres: - ' . #."
    }),
    fecha: Joi.date()
    .iso()
    .max("now")
    .messages({
        "date.empty": "La fecha de movimiento no puede estar vacía",
        "date.base": "La fecha de movimiento debe ser tipo Date",
        "date.iso": "La fecha de movimiento debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor máximo la fecha actual"
    }),
    estado_visualizacion: Joi.string()
    .min(3)
    .max(50)
    .messages({
        "String.empty": "El estado de visualización no puede estar vacío",
        "String.base": "El estado de visualización debe ser de tipo Varchar",
        "String.min": "El estado de visualización debe contener mínimo 3 caracteres",
        "String.max": "El estado de visualización debe contener máximo 50 caracteres"
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
    "titulo",
    "descripción",
    "tipo",
    "estado_visualizacion"
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos: titulo, tipo y fecha."
  });