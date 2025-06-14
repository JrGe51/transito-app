import { Horario } from './horario';
import { Licencia } from './licencia';
import { Solicitud } from './solicitud';
import { User } from './user';

export const defineAssociations = () => {
    Licencia.hasMany(Horario, { foreignKey: 'id_tipoLicencia' });
    Horario.belongsTo(Licencia, { foreignKey: 'id_tipoLicencia' });

    User.hasMany(Solicitud, { foreignKey: 'id_usuario' });
    Solicitud.belongsTo(User, { foreignKey: 'id_usuario', as: 'usuario' });

    Horario.hasMany(Solicitud, { foreignKey: 'id_horario' });
    Solicitud.belongsTo(Horario, { foreignKey: 'id_horario', as: 'horario' });

    Licencia.hasMany(Solicitud, { foreignKey: 'id_tipoLicencia' });
    Solicitud.belongsTo(Licencia, { foreignKey: 'id_tipoLicencia', as: 'tipoLicencia' });
}; 