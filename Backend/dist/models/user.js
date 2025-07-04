"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
exports.User = connection_1.default.define('User', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    rut: { type: sequelize_1.DataTypes.STRING(12), allowNull: false, unique: true },
    lastname: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    telefono: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    fechanacimiento: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
    direccion: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    codigoRecuperacion: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    codigoExpiracion: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    licenciaVigente: { type: sequelize_1.DataTypes.JSON, allowNull: true, defaultValue: [] },
    examenMedicoAprobado: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    examenPracticoAprobado: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    examenTeoricoAprobado: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    examenPsicotecnicoAprobado: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
    freezeTableName: true,
});
