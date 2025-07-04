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
exports.cambiarPassword = exports.verificarCodigo = exports.recuperarPassword = exports.deleteUser = exports.getUserById = exports.getAllUsers = exports.quitarLicencia = exports.agregarLicencia = exports.updateUser = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../models/user");
const admin_1 = require("../models/admin");
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService_1 = require("../utils/emailService");
const crypto_1 = __importDefault(require("crypto"));
const rutValidation_1 = require("../utils/rutValidation");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, rut, lastname, email, password, telefono, fechanacimiento, direccion } = req.body;
    // Validar RUT antes de continuar
    const validacionRut = (0, rutValidation_1.validarRut)(rut);
    if (!validacionRut.esValido) {
        res.status(400).json({
            msg: validacionRut.mensaje
        });
        return;
    }
    const existingUserByEmail = yield user_1.User.findOne({ where: { email: email } });
    if (existingUserByEmail) {
        res.status(400).json({
            msg: `El email ${email} ya se encuentra registrado.`
        });
        return;
    }
    const existingUserByRut = yield user_1.User.findOne({ where: { rut: rut } });
    if (existingUserByRut) {
        res.status(400).json({
            msg: `El RUT ${rut} ya se encuentra registrado.`
        });
        return;
    }
    const existingAdminByEmail = yield admin_1.Admin.findOne({ where: { email: email } });
    if (existingAdminByEmail) {
        res.status(400).json({
            msg: `El email ${email} ya se encuentra registrado.`
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
            licenciaVigente: null,
            examenMedicoAprobado: false,
            examenPracticoAprobado: false,
            examenTeoricoAprobado: false,
            examenPsicotecnicoAprobado: false,
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
            msg: 'Email incorrecto'
        });
        return;
    }
    const passwordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!passwordValid) {
        res.status(400).json({
            msg: 'Contraseña incorrecta'
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
            direccion: user.direccion,
            licenciaVigente: user.licenciaVigente
        }
    });
    return;
});
exports.login = login;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, lastname, email, telefono, fechanacimiento, direccion, rut, examenMedicoAprobado, examenPracticoAprobado, examenTeoricoAprobado, examenPsicotecnicoAprobado, licenciaVigente } = req.body;
    try {
        const user = yield user_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                msg: `No se encontró un usuario con el ID ${id}`
            });
            return;
        }
        // Validar RUT antes de continuar (solo si se está actualizando)
        if (rut && rut !== user.rut) {
            const validacionRut = (0, rutValidation_1.validarRut)(rut);
            if (!validacionRut.esValido) {
                res.status(400).json({
                    msg: validacionRut.mensaje
                });
                return;
            }
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
        }
        // Validar email solo si se está actualizando
        if (email && email !== user.email) {
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
        }
        // Preparar objeto de actualización con campos opcionales
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (lastname !== undefined)
            updateData.lastname = lastname;
        if (email !== undefined)
            updateData.email = email;
        if (telefono !== undefined)
            updateData.telefono = telefono;
        if (fechanacimiento !== undefined)
            updateData.fechanacimiento = fechanacimiento;
        if (direccion !== undefined)
            updateData.direccion = direccion;
        if (rut !== undefined)
            updateData.rut = rut;
        if (examenMedicoAprobado !== undefined)
            updateData.examenMedicoAprobado = examenMedicoAprobado;
        if (examenPracticoAprobado !== undefined)
            updateData.examenPracticoAprobado = examenPracticoAprobado;
        if (examenTeoricoAprobado !== undefined)
            updateData.examenTeoricoAprobado = examenTeoricoAprobado;
        if (examenPsicotecnicoAprobado !== undefined)
            updateData.examenPsicotecnicoAprobado = examenPsicotecnicoAprobado;
        // Manejar licenciaVigente como array
        if (licenciaVigente !== undefined) {
            // Si es un string, convertirlo a array
            if (typeof licenciaVigente === 'string') {
                updateData.licenciaVigente = licenciaVigente === 'sin licencia' ? [] : [licenciaVigente];
            }
            else if (Array.isArray(licenciaVigente)) {
                updateData.licenciaVigente = licenciaVigente;
            }
        }
        yield user.update(updateData);
        res.json({
            msg: `Usuario ${user.name} ${user.lastname} actualizado correctamente`,
            user: {
                id: user.id,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                rut: user.rut,
                telefono: user.telefono,
                fechanacimiento: user.fechanacimiento,
                direccion: user.direccion,
                licenciaVigente: user.licenciaVigente
            }
        });
    }
    catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al actualizar el usuario'
        });
    }
});
exports.updateUser = updateUser;
// Función para agregar una licencia al usuario
const agregarLicencia = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { licencia } = req.body;
    try {
        const user = yield user_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                msg: `No se encontró un usuario con el ID ${id}`
            });
            return;
        }
        // Obtener licencias actuales
        const licenciasActuales = user.licenciaVigente || [];
        // Verificar si la licencia ya existe
        if (licenciasActuales.includes(licencia)) {
            res.status(400).json({
                msg: `El usuario ya tiene la licencia ${licencia}`
            });
            return;
        }
        // Agregar la nueva licencia
        const nuevasLicencias = [...licenciasActuales, licencia];
        yield user.update({ licenciaVigente: nuevasLicencias });
        res.json({
            msg: `Licencia ${licencia} agregada correctamente al usuario ${user.name} ${user.lastname}`,
            licencias: nuevasLicencias
        });
    }
    catch (error) {
        console.error('Error al agregar licencia:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al agregar la licencia'
        });
    }
});
exports.agregarLicencia = agregarLicencia;
// Función para quitar una licencia del usuario
const quitarLicencia = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { licencia } = req.body;
    try {
        const user = yield user_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                msg: `No se encontró un usuario con el ID ${id}`
            });
            return;
        }
        // Obtener licencias actuales
        const licenciasActuales = user.licenciaVigente || [];
        // Verificar si la licencia existe
        if (!licenciasActuales.includes(licencia)) {
            res.status(400).json({
                msg: `El usuario no tiene la licencia ${licencia}`
            });
            return;
        }
        // Quitar la licencia
        const nuevasLicencias = licenciasActuales.filter(l => l !== licencia);
        yield user.update({ licenciaVigente: nuevasLicencias });
        res.json({
            msg: `Licencia ${licencia} removida correctamente del usuario ${user.name} ${user.lastname}`,
            licencias: nuevasLicencias
        });
    }
    catch (error) {
        console.error('Error al quitar licencia:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al quitar la licencia'
        });
    }
});
exports.quitarLicencia = quitarLicencia;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[getAllUsers] Intentando obtener todos los usuarios...');
        const users = yield user_1.User.findAll({
            attributes: { exclude: ['password'] }
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
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(`[getUserById] Intentando obtener usuario con ID: ${id}`);
    try {
        const user = yield user_1.User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            console.warn(`[getUserById] Usuario con ID ${id} no encontrado.`);
            res.status(404).json({
                msg: `No se encontró un usuario con el ID ${id}`
            });
            return;
        }
        console.log(`[getUserById] Usuario con ID ${id} encontrado exitosamente.`);
        res.status(200).json({
            user
        });
        return;
    }
    catch (error) {
        console.error('[getUserById] Error al obtener usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al obtener usuario.',
            error
        });
        return;
    }
});
exports.getUserById = getUserById;
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
const recuperarPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield user_1.User.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({
                msg: 'No existe un usuario con ese correo electrónico'
            });
            return;
        }
        // Generar código de recuperación
        const codigoRecuperacion = crypto_1.default.randomInt(100000, 999999).toString();
        const codigoHash = yield bcrypt_1.default.hash(codigoRecuperacion, 10);
        // Guardar el código en el usuario
        yield user.update({
            codigoRecuperacion: codigoHash,
            codigoExpiracion: new Date(Date.now() + 3600000) // 1 hora de expiración
        });
        // Enviar email con el código
        yield (0, emailService_1.sendRecoveryEmail)(email, codigoRecuperacion);
        res.json({
            msg: 'Se ha enviado un código de recuperación a tu correo electrónico'
        });
    }
    catch (error) {
        console.error('Error en recuperarPassword:', error);
        res.status(500).json({
            msg: 'Error al procesar la solicitud de recuperación de contraseña'
        });
    }
});
exports.recuperarPassword = recuperarPassword;
const verificarCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, codigo } = req.body;
    try {
        const user = yield user_1.User.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({
                msg: 'No existe un usuario con ese correo electrónico'
            });
            return;
        }
        if (!user.codigoRecuperacion || !user.codigoExpiracion) {
            res.status(400).json({
                msg: 'No hay un código de recuperación activo'
            });
            return;
        }
        if (new Date() > user.codigoExpiracion) {
            res.status(400).json({
                msg: 'El código de recuperación ha expirado'
            });
            return;
        }
        const codigoValido = yield bcrypt_1.default.compare(codigo, user.codigoRecuperacion);
        if (!codigoValido) {
            res.status(400).json({
                msg: 'Código de recuperación inválido'
            });
            return;
        }
        res.json({
            msg: 'Código verificado correctamente'
        });
    }
    catch (error) {
        console.error('Error en verificarCodigo:', error);
        res.status(500).json({
            msg: 'Error al verificar el código'
        });
    }
});
exports.verificarCodigo = verificarCodigo;
const cambiarPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, codigo, nuevaPassword } = req.body;
    try {
        const user = yield user_1.User.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({
                msg: 'No existe un usuario con ese correo electrónico'
            });
            return;
        }
        if (!user.codigoRecuperacion || !user.codigoExpiracion) {
            res.status(400).json({
                msg: 'No hay un código de recuperación activo'
            });
            return;
        }
        if (new Date() > user.codigoExpiracion) {
            res.status(400).json({
                msg: 'El código de recuperación ha expirado'
            });
            return;
        }
        const codigoValido = yield bcrypt_1.default.compare(codigo, user.codigoRecuperacion);
        if (!codigoValido) {
            res.status(400).json({
                msg: 'Código de recuperación inválido'
            });
            return;
        }
        // Actualizar la contraseña
        const passwordHash = yield bcrypt_1.default.hash(nuevaPassword, 10);
        yield user.update({
            password: passwordHash,
            codigoRecuperacion: undefined,
            codigoExpiracion: undefined
        });
        res.json({
            msg: 'Contraseña actualizada correctamente'
        });
    }
    catch (error) {
        console.error('Error en cambiarPassword:', error);
        res.status(500).json({
            msg: 'Error al cambiar la contraseña'
        });
    }
});
exports.cambiarPassword = cambiarPassword;
