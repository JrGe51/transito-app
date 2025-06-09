"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAssociations = void 0;
const horario_1 = require("./horario");
const licencia_1 = require("./licencia");
const defineAssociations = () => {
    licencia_1.Licencia.hasMany(horario_1.Horario, { foreignKey: 'id_tipoLicencia' });
    horario_1.Horario.belongsTo(licencia_1.Licencia, { foreignKey: 'id_tipoLicencia' });
};
exports.defineAssociations = defineAssociations;
