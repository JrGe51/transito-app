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
    const { Uname, Urut, Ulastname, Uemail, Upassword, Utelefono, Ufechanacimiento, Udireccion } = req.body;
    const user = yield user_1.User.findOne({ where: { [sequelize_1.Op.or]: { email: Uemail, rut: Urut } } });
    if (user) {
        res.status(400).json({
            msg: `El usuario ya existe con el email ${Uemail} o rut ${Urut}.`
        });
        return;
    }
    console.log("Estoy por aqui");
    const passwordHash = yield bcrypt_1.default.hash(Upassword, 10);
    try {
        yield user_1.User.create({
            Uname: Uname,
            Urut: Urut,
            Ulastname: Ulastname,
            Uemail: Uemail,
            Upassword: passwordHash,
            Utelefono: Utelefono,
            Ufechanacimiento: Ufechanacimiento,
            Udireccion: Udireccion,
        });
        res.json({
            msg: `User ${Uname} ${Ulastname} create succes..`,
        });
    }
    catch (error) {
        res.status(400).json({
            msg: `Existe un error al crear el usuario ${Uname} ${Ulastname}.`
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Uemail, Upassword } = req.body;
    const user = yield user_1.User.findOne({ where: { email: Uemail } });
    if (!user) {
        res.status(400).json({
            msg: `El usuario no existe con el email ${Uemail}.`
        });
        return;
    }
    const passwordValid = yield bcrypt_1.default.compare(Upassword, user.Upassword);
    if (!passwordValid) {
        res.status(400).json({
            msg: `Contraseña Incorrecta ${Upassword}.`
        });
        return;
    }
    const token = jsonwebtoken_1.default.sign({
        Uemail: Uemail,
        Upassword: Upassword,
    }, process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', {
        expiresIn: '1h'
    });
    res.json({ token });
});
exports.login = login;
