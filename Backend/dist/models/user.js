"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
exports.User = connection_1.default.define('User', {
    Uid: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Uname: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    Urut: { type: sequelize_1.DataTypes.STRING(12), allowNull: false, unique: true },
    Ulastname: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    Uemail: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    Upassword: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    Utelefono: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    Ufechanacimiento: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
    Udireccion: { type: sequelize_1.DataTypes.STRING, allowNull: false },
});
