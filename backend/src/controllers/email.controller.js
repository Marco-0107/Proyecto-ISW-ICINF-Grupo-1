import { sendEmail } from "../services/email.service.js";
import {
    handleErrorServer,
    handleSuccess,
    } from "../handlers/responseHandlers.js";

export const sendCustomEmail = async (req, res) => {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "Faltan campos obligatorios: email, subject, message"
        });
    }

    try {
        const result = await sendEmail(
            email,
            subject,
            message,
            `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2c5530;">Junta de Vecinos</h2>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                    Este correo fue enviado automáticamente por el sistema de la Junta de Vecinos.
                </p>
            </div>`
        );

        handleSuccess(res, 200, "Correo enviado con éxito.", {
            messageId: result.messageId,
            recipient: email,
            subject: subject
        });
    } catch (error) {
        console.error("Error en sendCustomEmail:", error);
        handleErrorServer(res, 500, "Error durante el envío de correo.", error.message);
    }
};

export const sendEmailDefault = async (req) => {
    const { email, message, subject } = req.body;

    if (!email || !subject || !message) {
        return {
            success: false,
            error: "Faltan campos obligatorios: email, subject, message"
        };
    }

    try {
        const result = await sendEmail(
            email,
            subject,
            message,
            `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2c5530;">Junta de Vecinos</h2>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                    Este correo fue enviado automáticamente por el sistema de la Junta de Vecinos.
                </p>
            </div>`
        );

        return {
            success: true,
            data: {
                messageId: result.messageId,
                recipient: email,
                subject: subject
            }
        };
    } catch (error) {
        console.error("Error en sendEmailDefault:", error);
        return {
            success: false,
            error: error.message
        };
    }
};