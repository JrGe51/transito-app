"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetCode = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
exports.ResetCode = connection_1.default.define('ResetCode', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    code: { type: sequelize_1.DataTypes.STRING(6), allowNull: false },
    expiresAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    used: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false }
}, {
    freezeTableName: true,
});
