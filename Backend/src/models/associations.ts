import { Horario } from './horario';
import { Licencia } from './licencia';

export const defineAssociations = () => {
    Licencia.hasMany(Horario, { foreignKey: 'id_tipoLicencia' });
    Horario.belongsTo(Licencia, { foreignKey: 'id_tipoLicencia' });
}; 