import nodemailer from "nodemailer";
import { emailConfig } from "../config/configEnv.js";

export const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: emailConfig.service,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass,
            },
        });

        const mailOptions = {
            from: `"Directiva de Junta de Vecinos " <${emailConfig.user}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente:", info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            mailOptions: mailOptions
        };
    } catch (error) {
        console.error("Error enviando el correo:", error.message);
        throw new Error("Error enviando el correo: " + error.message);
    }
};