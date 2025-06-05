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
exports.loginAdmin = exports.registerAdmin = exports.checkMasterCredentials = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const admin_1 = require("../models/admin");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminUtils_1 = require("../utils/adminUtils");
const MASTER_EMAIL = "admin@loespejo.com";
const MASTER_PASSWORD = "Admin@2024#Secure";
const checkMasterCredentials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
        res.json({ isMaster: true });
    }
    else {
        res.status(401).json({
            msg: "Credenciales inválidas"
        });
    }
});
exports.checkMasterCredentials = checkMasterCredentials;
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, lastname, password } = req.body;
    try {
        const email = yield (0, adminUtils_1.generarEmailUnico)(name, lastname);
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        yield admin_1.Admin.create({
            name,
            lastname,
            email,
            password: passwordHash
        });
        res.json({
            msg: `Administrador ${name} ${lastname} creado exitosamente.`,
            email: email
        });
    }
    catch (error) {
        res.status(400).json({
            msg: `Error al crear el administrador ${name} ${lastname}.`
        });
    }
});
exports.registerAdmin = registerAdmin;
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Verificar si son las credenciales maestras
    if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
        const token = jsonwebtoken_1.default.sign({
            email: MASTER_EMAIL,
            isAdmin: true,
            isMaster: true
        }, process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', {
            expiresIn: '1h'
        });
        return res.json({ token, isAdmin: true });
    }
    // Si no son las credenciales maestras, verificar que sea un email de admin
    if (!email.endsWith('@loespejoadmin.com')) {
        res.status(400).json({
            msg: "Credenciales inválidas"
        });
        return;
    }
    const admin = yield admin_1.Admin.findOne({ where: { email } });
    if (!admin) {
        res.status(400).json({
            msg: "Credenciales inválidas"
        });
        return;
    }
    const passwordValid = yield bcrypt_1.default.compare(password, admin.getDataValue('password'));
    if (!passwordValid) {
        res.status(400).json({
            msg: "Credenciales inválidas"
        });
        return;
    }
    const token = jsonwebtoken_1.default.sign({
        id: admin.getDataValue('id'),
        email: admin.getDataValue('email'),
        isAdmin: true
    }, process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', {
        expiresIn: '1h'
    });
    res.json({ token, isAdmin: true });
});
exports.loginAdmin = loginAdmin;
