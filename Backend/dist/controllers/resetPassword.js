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
exports.resetPassword = exports.requestResetCode = void 0;
const user_1 = require("../models/user");
const admin_1 = require("../models/admin");
const resetCode_1 = require("../models/resetCode");
const email_1 = require("../utils/email");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
// Generar código aleatorio de 6 dígitos
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Solicitar código de recuperación
const requestResetCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Verificar si el email existe en User o Admin
        const user = yield user_1.User.findOne({ where: { email } });
        const admin = yield admin_1.Admin.findOne({ where: { email } });
        if (!user && !admin) {
            return res.status(404).json({ message: 'No se encontró una cuenta con ese correo electrónico' });
        }
        // Generar código y fecha de expiración (15 minutos)
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        // Guardar código en la base de datos
        yield resetCode_1.ResetCode.create({
            email,
            code,
            expiresAt
        });
        // Enviar email con el código
        const emailContent = `
            <h2>Recuperación de Contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>
            <h1 style="color: #56baed; font-size: 2em;">${code}</h1>
            <p>Este código expirará en 15 minutos.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        `;
        yield (0, email_1.sendEmail)(email, 'Recuperación de Contraseña', emailContent);
        res.json({ message: 'Código de recuperación enviado al correo electrónico' });
    }
    catch (error) {
        console.error('Error al solicitar código de recuperación:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
});
exports.requestResetCode = requestResetCode;
// Verificar código y actualizar contraseña
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code, newPassword } = req.body;
        // Buscar código válido
        const resetCode = yield resetCode_1.ResetCode.findOne({
            where: {
                email,
                code,
                used: false,
                expiresAt: {
                    [sequelize_1.Op.gt]: new Date() // expiresAt > current date
                }
            }
        });
        if (!resetCode) {
            return res.status(400).json({ message: 'Código inválido o expirado' });
        }
        // Verificar si el usuario existe en User o Admin
        const user = yield user_1.User.findOne({ where: { email } });
        const admin = yield admin_1.Admin.findOne({ where: { email } });
        if (!user && !admin) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        // Encriptar nueva contraseña
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Actualizar contraseña según el tipo de usuario
        if (user) {
            yield user.update({ password: hashedPassword });
        }
        else if (admin) {
            yield admin.update({ password: hashedPassword });
        }
        // Marcar código como usado
        yield resetCode.update({ used: true });
        res.json({ message: 'Contraseña actualizada exitosamente' });
    }
    catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
});
exports.resetPassword = resetPassword;
