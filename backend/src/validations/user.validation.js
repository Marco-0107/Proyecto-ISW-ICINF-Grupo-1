"use strict";
import Joi from "joi";

const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@gmail.com" || "@hotmail.com" || "outlook.com")) {
    return helper.message(
      "Correo inválido: Dominio desconocido"
    );
  }
  return value;
};

export const userQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  email: Joi.string()
    .min(15)
    .max(35)
    .email()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe finalizar en @gmail.com, hotmail.com o outlook.com",
      "string.min":
        "El correo electrónico debe tener como mínimo 15 caracteres.",
      "string.max":
        "El correo electrónico debe tener como máximo 35 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio email"),
    rut: Joi.string()
    .min(9)
    .max(12)
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 12 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
    }),
})
  .or("id", "email", "rut")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un parámetro: id, email o rut.",
  });

export const userBodyValidation = Joi.object({
  id_usuario: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  nombre: Joi.string()
    .min(4)
    .max(25)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "Los nombre debe ser de tipo string.",
      "string.min": "Los nombre debe tener como mínimo 4 caracteres.",
      "string.max": "Los nombre debe tener como máximo 25 caracteres.",
      "string.pattern.base":
        "El nombre solo puede contener letras y espacios.",
    }),
    apellido: Joi.string()
    .min(4)
    .max(25)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      "string.empty": "Los apellidos no pueden estar vacío.",
      "string.base": "Los apellidos deben ser de tipo string.",
      "string.min": "Los apellidos deben tener como mínimo 4 caracteres.",
      "string.max": "Los apellidos deben tener como máximo 25 caracteres.",
      "string.pattern.base":
        "Los apellidos solo pueden contener letras y espacios.",
    }),
  email: Joi.string()
    .min(15)
    .max(35)
    .email()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe finalizar en @gmail.com, hotmail.com o outlook.com",
      "string.min":
        "El correo electrónico debe tener como mínimo 15 caracteres.",
      "string.max":
        "El correo electrónico debe tener como máximo 35 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio email"),
  password: Joi.string()
    .min(8)
    .max(26)
    .pattern(/^[a-zA-Z0-9]+$/)
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "string.base": "La contraseña debe ser de tipo string.",
      "string.min": "La contraseña debe tener como mínimo 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base":
        "La contraseña solo puede contener letras y números.",
    }),
  newPassword: Joi.string()
    .min(8)
    .max(26)
    .allow("")
    .pattern(/^[a-zA-Z0-9]+$/)
    .messages({
      "string.empty": "La nueva contraseña no puede estar vacía.",
      "string.base": "La nueva contraseña debe ser de tipo string.",
      "string.min": "La nueva contraseña debe tener como mínimo 8 caracteres.",
      "string.max": "La nueva contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base":
        "La nueva contraseña solo puede contener letras y números.",
    }),
  rut: Joi.string()
    .min(9)
    .max(12)
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 12 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
    }),
  rol: Joi.string()
    .min(4)
    .max(15)
    .pattern(/^[a-zA-Z]+$/)
    .messages({
      "string.base": "El rol debe ser de tipo string.",
      "string.min": "El rol debe tener como mínimo 4 caracteres.",
      "string.max": "El rol debe tener como máximo 15 caracteres.",
      "string.pattern.base": "El rol solo puede contener letras"
    }),
  direccion: Joi.string()
    .min(5)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑñ0-9\s\-'.#]+$/)
    .messages({
      "string.empty": "La dirección no puede estar vacía",
      "string.base": "La dirección debe ser de tipo string",
      "string.min": "La dirección debe tener mínimo 40 caracteres.",
      "string.max": "La dirección debe tener como máximo 100 caracteres"
    }),
    estado_activo: Joi.boolean()
    .messages({
      "boolean.empty": "El estado de actividad no puede estar vacío",
      "boolean.base": "El estado de actividad debe ser de tipo boolean"
    }),
    fecha_registro: Joi.date()
    .iso()
    .max("now")
    .messages({
      "date.base": "La fecha de registro debe ser de tipo Date",
      "date.empty": "La fecha de registro no puede estar vacía",
      "date.iso": "La fecha de registro debe estar en formato AAAA-MM-DD",
      "date.positive": "La fecha de registro debe ser positiva" 
    }),
    telefono: Joi.string()
    .min(12)
    .max(12)
    .pattern(/^\+569\d{8}$/)
    .messages({
      "string.base": "El número telefonico no puede estar vacío",
      "string.min": "El número telefonico puede tener mínimo 12 dígitos",
      "string.max": "El número telefonico puede tener máximo 12 dígitos",
      "string.pattern.base": "Formato número telefonico inválido, debe contener prefijo +569"
    })
})
  .or(
    "nombre",
    "apellido",
    "email",
    "password",
    "newPassword",
    "rut",
    "rol",
    "direccion",
    "estado_activo",
    "fecha_registro"
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: nombreCompleto, email, password, newPassword, rut o rol, dirección"
  });
