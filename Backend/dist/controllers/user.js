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
exports.deleteUser = exports.getAllUsers = exports.updateUser = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../models/user");
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        return;
    }
    catch (error) {
        res.status(400).json({
            msg: `Existe un error al crear el usuario ${name} ${lastname}.`
        });
        return;
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            rut: user.rut,
            telefono: user.telefono,
            fechanacimiento: user.fechanacimiento,
            direccion: user.direccion
        }
    });
    return;
});
exports.login = login;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, lastname, email, telefono, fechanacimiento, direccion, rut } = req.body;
    try {
        const user = yield user_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                msg: `No se encontró un usuario con el ID ${id}`
            });
            return;
        }
        // Validar si el RUT ya existe en otro usuario (excluyendo al usuario actual)
        const existingRutUser = yield user_1.User.findOne({
            where: {
                rut: rut,
                id: { [sequelize_1.Op.ne]: id }
            }
        });
        if (existingRutUser) {
            res.status(400).json({
                msg: `El RUT '${rut}' ya está en uso por otro usuario.`
            });
            return;
        }
        // Validar si el Email ya existe en otro usuario (excluyendo al usuario actual)
        const existingEmailUser = yield user_1.User.findOne({
            where: {
                email: email,
                id: { [sequelize_1.Op.ne]: id }
            }
        });
        if (existingEmailUser) {
            res.status(400).json({
                msg: `El email '${email}' ya está en uso por otro usuario.`
            });
            return;
        }
        yield user.update({
            name,
            lastname,
            email,
            telefono,
            fechanacimiento,
            direccion,
            rut
        });
        res.json({
            msg: 'Usuario actualizado correctamente',
            user
        });
        return;
    }
    catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al actualizar el usuario.',
            error
        });
        return;
    }
});
exports.updateUser = updateUser;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[getAllUsers] Intentando obtener todos los usuarios...');
        const users = yield user_1.User.findAll({
            attributes: { exclude: ['password'] } // Excluir el campo de contraseña
        });
        console.log(`[getAllUsers] Usuarios encontrados: ${users.length}`);
        res.status(200).json({
            users
        });
        return;
    }
    catch (error) {
        console.error('[getAllUsers] Error al obtener usuarios:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al obtener usuarios.',
            error
        });
        return;
    }
});
exports.getAllUsers = getAllUsers;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(`[deleteUser] Intentando eliminar usuario con ID: ${id}`);
    try {
        const user = yield user_1.User.findByPk(id);
        if (!user) {
            console.warn(`[deleteUser] Usuario con ID ${id} no encontrado.`);
            res.status(404).json({
                msg: `No se encontró un usuario con el ID ${id}`
            });
            return;
        }
        yield user.destroy();
        console.log(`[deleteUser] Usuario con ID ${id} eliminado exitosamente.`);
        res.status(200).json({
            msg: 'Usuario eliminado correctamente.'
        });
        return;
    }
    catch (error) {
        console.error('[deleteUser] Error al eliminar usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al eliminar usuario.',
            error
        });
        return;
    }
});
exports.deleteUser = deleteUser;
