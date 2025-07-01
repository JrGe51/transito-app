"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solicitud = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
const licencia_1 = require("./licencia");
const horario_1 = require("./horario");
// Extiende el modelo con los atributos definidos
class Solicitud extends sequelize_1.Model {
}
exports.Solicitud = Solicitud;
// Inicializa el modelo
Solicitud.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fechaSolicitud: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
    tipoTramite: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    id_usuario: { type: sequelize_1.DataTypes.INTEGER, references: { model: user_1.User, key: 'id' }, allowNull: false },
    id_tipoLicencia: { type: sequelize_1.DataTypes.INTEGER, references: { model: licencia_1.Licencia, key: 'id' }, allowNull: false },
    id_horario: { type: sequelize_1.DataTypes.INTEGER, references: { model: horario_1.Horario, key: 'id' }, allowNull: false },
    documentos: { type: sequelize_1.DataTypes.JSON, allowNull: true, defaultValue: [] }, // Campo para almacenar documentos como JSON
    claseAnterior: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    claseNueva: { type: sequelize_1.DataTypes.STRING, allowNull: true },
}, {
    sequelize: connection_1.default,
    modelName: 'Solicitud',
    freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
});
// Define las relaciones
user_1.User.hasMany(Solicitud, { foreignKey: 'id_usuario', as: 'usuarios' });
Solicitud.belongsTo(user_1.User, { foreignKey: 'id_usuario', as: 'Usolicitudes' });
licencia_1.Licencia.hasMany(Solicitud, { foreignKey: 'id_tipoLicencia', as: 'licencias' });
Solicitud.belongsTo(licencia_1.Licencia, { foreignKey: 'id_tipoLicencia', as: 'Lsolicitudes' });
horario_1.Horario.hasOne(Solicitud, { foreignKey: 'id_horario', as: 'horario' });
Solicitud.belongsTo(horario_1.Horario, { foreignKey: 'id_horario', as: 'solicitud' });
