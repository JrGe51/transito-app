"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Licencia = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
// Extiende el modelo con los atributos definidos
class Licencia extends sequelize_1.Model {
}
exports.Licencia = Licencia;
// Inicializa el modelo
Licencia.init({
    Lid: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Lname: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    Ldescription: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, {
    sequelize: connection_1.default,
    modelName: 'Licencia',
    freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
});
