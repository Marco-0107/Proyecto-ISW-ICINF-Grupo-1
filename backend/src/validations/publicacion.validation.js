"use strict";
import Joi from "joi";

export const publicacionQueryValidation = Joi.object({
    id_publicacion: Joi.number()
    .integer()
    .positive()
    .messages({
        "integer.empty": "El id no puede estar vacío",
        "integer.base": "El id debe ser un integer",
        "integer.positive": "El id debe ser positivo"        
    }), 
    titulo: Joi.string()
    .min(5)
    .max(250)
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser tipo Varchar",
        "string.min": "El titulo debe tener como mínimo 5 caracteres",
        "string.max": "El titulo debe tener como máximo 250",
        "string.pattern.base": "El nombre solo puede contener letras y espacios"
    })
});

// Validación simple para crear publicaciones
export const publicacionBodyValidation = Joi.object({
    titulo: Joi.string()
    .min(5)
    .max(250)
    .required()
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser de tipo string",
        "string.min": "El titulo debe tener como mínimo 5 caracteres",
        "string.max": "El titulo debe tener como máximo 250 caracteres",
        "any.required": "El título es obligatorio"
    }),
    tipo: Joi.string()
    .valid('noticia', 'comunicado', 'alerta')
    .required()
    .messages({
        "string.empty": "El tipo no puede estar vacío",
        "any.only": "El tipo debe ser: noticia, comunicado o alerta",
        "any.required": "El tipo es obligatorio"
    }),
    contenido: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
        "string.empty": "El contenido no puede estar vacío",
        "string.min": "El contenido debe tener como mínimo 1 caracter",
        "string.max": "El contenido debe tener como máximo 5000 caracteres",
        "any.required": "El contenido es obligatorio"
    }),
    estado: Joi.string()
    .valid('pendiente', 'publicada', 'archivada')
    .default('pendiente')
    .messages({
        "any.only": "El estado debe ser: pendiente, publicada o archivada"
    }),
    imagen: Joi.string()
    .allow(null, '')
    .optional()
}).options({ 
    allowUnknown: false,  // No permitir campos adicionales
    stripUnknown: true,   // Eliminar campos desconocidos
    abortEarly: false     // Mostrar todos los errores
});

// Validación más flexible para FormData (sin requerir todos los campos)
export const publicacionFormDataValidation = Joi.object({
    titulo: Joi.string()
    .min(5)
    .max(250)
    .when(Joi.exist(), { then: Joi.required() })
    .messages({
        "string.empty": "El titulo no puede estar vacío",
        "string.base": "El titulo debe ser de tipo string",
        "string.min": "El titulo debe tener como mínimo 5 caracteres",
        "string.max": "El titulo debe tener como máximo 250 caracteres"
    }),
    tipo: Joi.string()
    .valid('noticia', 'comunicado', 'alerta')
    .messages({
        "string.empty": "El tipo no puede estar vacío",
        "any.only": "El tipo debe ser: noticia, comunicado o alerta"
    }),
    contenido: Joi.string()
    .min(1)
    .max(5000)
    .messages({
        "string.empty": "El contenido no puede estar vacío",
        "string.min": "El contenido debe tener como mínimo 1 caracter",
        "string.max": "El contenido debe tener como máximo 5000 caracteres"
    }),
    estado: Joi.string()
    .valid('pendiente', 'publicada', 'archivada')
    .default('pendiente')
    .messages({
        "any.only": "El estado debe ser: pendiente, publicada o archivada"
    }),
    imagen: Joi.string()
    .allow(null, '')
    .optional()
}).options({ 
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
});