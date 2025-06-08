"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Horario = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const licencia_1 = require("./licencia");
// Extiende el modelo con los atributos definidos
class Horario extends sequelize_1.Model {
}
exports.Horario = Horario;
// Inicializa el modelo
Horario.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
    hora: { type: sequelize_1.DataTypes.TIME, allowNull: false },
    cupodisponible: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    id_tipoLicencia: { type: sequelize_1.DataTypes.INTEGER, references: { model: licencia_1.Licencia, key: 'id' }, allowNull: false }
}, {
    sequelize: connection_1.default,
    modelName: 'Horario',
    freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
});
licencia_1.Licencia.hasOne(Horario, { foreignKey: 'id_tipoLicencia' });
Horario.belongsTo(licencia_1.Licencia, { foreignKey: 'id_tipoLicencia' });
