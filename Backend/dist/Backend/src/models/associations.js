"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAssociations = void 0;
const horario_1 = require("./horario");
const licencia_1 = require("./licencia");
const solicitud_1 = require("./solicitud");
const user_1 = require("./user");
const defineAssociations = () => {
    licencia_1.Licencia.hasMany(horario_1.Horario, { foreignKey: 'id_tipoLicencia' });
    horario_1.Horario.belongsTo(licencia_1.Licencia, { foreignKey: 'id_tipoLicencia' });
    user_1.User.hasMany(solicitud_1.Solicitud, { foreignKey: 'id_usuario' });
    solicitud_1.Solicitud.belongsTo(user_1.User, { foreignKey: 'id_usuario', as: 'usuario' });
    horario_1.Horario.hasMany(solicitud_1.Solicitud, { foreignKey: 'id_horario' });
    solicitud_1.Solicitud.belongsTo(horario_1.Horario, { foreignKey: 'id_horario', as: 'horario' });
    licencia_1.Licencia.hasMany(solicitud_1.Solicitud, { foreignKey: 'id_tipoLicencia' });
    solicitud_1.Solicitud.belongsTo(licencia_1.Licencia, { foreignKey: 'id_tipoLicencia', as: 'tipoLicencia' });
};
exports.defineAssociations = defineAssociations;
