"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Verificar que las variables de entorno estén configuradas
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Error: EMAIL_USER o EMAIL_PASS no están configurados en el archivo .env');
}
// Crear el transporter de nodemailer
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
// Verificar la conexión
transporter.verify(function (error, success) {
    if (error) {
        console.log('Error en la configuración del correo:', error);
    }
    else {
        console.log('Servidor de correo listo para enviar mensajes');
    }
});
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, html, text }) {
    try {
        console.log('Configurando envío de correo a:', to);
        console.log('Usando cuenta:', process.env.EMAIL_USER);
        const mailOptions = {
            from: `"Departamento de Tránsito" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text: text || ''
        };
        const info = yield transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);
        return {
            success: true,
            data: info
        };
    }
    catch (error) {
        console.error('Error al enviar el correo:', error);
        return {
            success: false,
            error
        };
    }
});
exports.sendEmail = sendEmail;
// Función de utilidad para crear plantillas HTML comunes
exports.emailTemplates = {
    welcome: (name) => ({
        subject: '¡Bienvenido a Tránsito App!',
        html: `
            <h1>¡Bienvenido ${name}!</h1>
            <p>Gracias por registrarte en nuestra aplicación.</p>
            <p>Esperamos que encuentres útil nuestra plataforma.</p>
        `
    }),
    notification: (title, message) => ({
        subject: title,
        html: `
            <h2>${title}</h2>
            <p>${message}</p>
        `
    })
};
