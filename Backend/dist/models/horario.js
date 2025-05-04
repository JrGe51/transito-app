"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Horario = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
exports.Horario = connection_1.default.define('Horario', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    horainicio: { type: sequelize_1.DataTypes.TIME, allowNull: false },
    horafin: { type: sequelize_1.DataTypes.TIME, allowNull: false },
    cuposdisponibles: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
});
