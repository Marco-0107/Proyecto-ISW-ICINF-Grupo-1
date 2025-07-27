"use strict";
import Joi from "joi";
import moment from "moment-timezone";

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
       .min(3)
       .max(100)
       .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-'.#]+$/)
       .messages({
        "string.empty": "El lugar no puede estar vacío",
        "string.base": "El lugar debe ser de tipo texto",
        "string.min": "El lugar debe tener mínimo 3 caracteres",
        "string.max": "El lugar debe tener como máximo 100 caracteres"
       }),
    observaciones: Joi.string()
       .max(1000)
       .allow('', null)
       .messages({
        "string.base": "Las observaciones deben ser de tipo texto",
        "string.max": "Las observaciones pueden contener máximo 1000 caracteres"
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
       .min(3)
       .max(100)
       .pattern(/^(?=.*[a-zA-Z0-9])[\w\s\-'.#áéíóúÁÉÍÓÚñÑ]+$/)
       .required()
       .messages({
        "string.empty": "El lugar no puede estar vacío",
        "string.base": "El lugar debe ser de tipo texto",
        "string.min": "El lugar debe tener mínimo 3 caracteres",
        "string.max": "El lugar debe tener como máximo 100 caracteres",
        "string.pattern.base": "El lugar debe contener al menos una letra o número",
        "any.required": "El lugar es obligatorio"
       }),
    descripcion: Joi.string()
       .min(10)
       .max(500)
       .pattern(/^(?=.*[a-zA-Z0-9])[\w\s\-'.#áéíóúÁÉÍÓÚñÑ]+$/)
       .required()
       .messages({
        "string.empty": "La descripción no puede estar vacía",
        "string.base": "La descripción debe ser de tipo texto",
        "string.min": "La descripción debe contener mínimo 10 caracteres",
        "string.max": "La descripción puede contener máximo 500 caracteres",
        "string.pattern.base": "La descripción debe contener al menos una letra o número",
        "any.required": "La descripción es obligatoria"
       }),
    observaciones: Joi.string()
       .max(1000)
       .allow('', null)
       .messages({
        "string.base": "Las observaciones deben ser de tipo texto",
        "string.max": "Las observaciones pueden contener máximo 1000 caracteres"
       }),
    fecha_reunion: Joi.date()
    .iso()
    .min(Joi.ref('$now', { 
        adjust: (value) => {
            // Calcular 24 horas de anticipación en zona horaria de Chile
            const fechaChile = moment.tz("America/Santiago").add(24, 'hours');
            return fechaChile.toDate();
        } 
    }))
    .max(Joi.ref('$now', { 
        adjust: (value) => {
            // Calcular máximo 1 año en zona horaria de Chile
            const fechaChile = moment.tz("America/Santiago").add(365, 'days');
            return fechaChile.toDate();
        } 
    }))
    .custom((value, helpers) => {
        // Usar moment-timezone para validar la hora en zona horaria de Chile
        const fechaChile = moment.tz(value, "America/Santiago");
        const hour = fechaChile.hour();
        if (hour < 10 || hour >= 19) {
            return helpers.error('date.hour');
        }
        return value;
    })
    .required()
    .messages({
        "date.empty": "La fecha no puede estar vacía",
        "date.base": "La fecha debe ser tipo Date",
        "date.iso": "La fecha debe estar en formato ISO",
        "date.min": "La fecha debe ser con mínimo 24 horas de anticipación (hora de Chile)",
        "date.max": "La fecha no puede ser mayor a 1 año",
        "date.hour": "La hora debe estar entre las 10:00 y 18:59 (hora de Chile)",
        "any.required": "La fecha y hora son obligatorias"
    }),
    fechaActualizacion: Joi.date()
    .iso()
    .messages({
        "date.empty": "La fecha no puede estar vacía",
        "date.base": "La fecha debe ser tipo Date",
        "date.iso": "La fecha debe estar en formato AAAA-MM-DD",
        "date.max": "La fecha puede tomar como valor mínimo la fecha de hoy"
    })
}).unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

export const reunionEditValidation = Joi.object({
  id_reunion: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).optional(),

  lugar: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^(?=.*[a-zA-Z0-9])[\w\s\-'.#áéíóúÁÉÍÓÚñÑ]+$/),

  descripcion: Joi.string()
    .min(10)
    .max(500)
    .pattern(/^(?=.*[a-zA-Z0-9])[\w\s\-'.#áéíóúÁÉÍÓÚñÑ]+$/),

  fecha_reunion: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    .custom((value, helpers) => {
        // Usar moment-timezone para validar la hora en zona horaria de Chile
        const fechaChile = moment.tz(value, "America/Santiago");
        const hour = fechaChile.hour();
        if (hour < 10 || hour >= 19) {
            return helpers.error('date.hour');
        }
        return value;
    })
    .messages({
        "date.hour": "La hora debe estar entre las 10:00 y 18:59 (hora de Chile)"
    }),

  fechaActualizacion: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),

  observaciones: Joi.string()
    .max(1000)
    .allow('', null)
}).or(
  "lugar",
  "descripcion", 
  "fecha_reunion",  
  "fechaActualizacion",
  "observaciones"
);


  
