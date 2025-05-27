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
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../models/user");
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, rut, lastname, email, password, telefono, fechanacimiento, direccion } = req.body;
    const user = yield user_1.User.findOne({ where: { [sequelize_1.Op.or]: { email: email, rut: rut } } });
    if (user) {
        res.status(400).json({
            msg: `El usuario ya existe con el email ${email} o rut ${rut}.`
        });
        return;
    }
    console.log("Estoy por aqui");
    const passwordHash = yield bcrypt_1.default.hash(password, 10);
    try {
        yield user_1.User.create({
            name: name,
            rut: rut,
            lastname: lastname,
            email: email,
            password: passwordHash,
            telefono: telefono,
            fechanacimiento: fechanacimiento,
            direccion: direccion,
        });
        res.json({
            msg: `User ${name} ${lastname} create succes..`,
        });
    }
    catch (error) {
        res.status(400).json({
            msg: `Existe un error al crear el usuario ${name} ${lastname}.`
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_1.User.findOne({ where: { email: email } });
    if (!user) {
        res.status(400).json({
            msg: `El usuario no existe con el email ${email}.`
        });
        return;
    }
    const passwordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!passwordValid) {
        res.status(400).json({
            msg: `Contraseña Incorrecta ${password}.`
        });
        return;
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
    }, process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', {
        expiresIn: '1h'
    });
    res.json({ token });
});
exports.login = login;
