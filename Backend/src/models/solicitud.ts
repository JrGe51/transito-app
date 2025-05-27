import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../database/connection";
import { User } from "./user";
import { Licencia } from "./licencia";
import { Horario } from "./horario";

// Define los atributos del modelo
interface SolicitudAttributes {
    id: number; 
    fechaSolicitud: Date; 
    id_usuario: number; 
    id_tipoLicencia: number; 
    id_horario: number; 
}

// Define los atributos opcionales para la creación
interface SolicitudCreationAttributes extends Optional<SolicitudAttributes, 'id'> {}

// Extiende el modelo con los atributos definidos
export class Solicitud extends Model<SolicitudAttributes, SolicitudCreationAttributes> implements SolicitudAttributes {
    public id!: number;
    public fechaSolicitud!: Date;
    public id_usuario!: number;
    public id_tipoLicencia!: number;
    public id_horario!: number;
}

// Inicializa el modelo
Solicitud.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        fechaSolicitud: { type: DataTypes.DATEONLY, allowNull: false },
        id_usuario: { type: DataTypes.INTEGER, references: { model: User, key: 'id' }, allowNull: false },
        id_tipoLicencia: { type: DataTypes.INTEGER, references: { model: Licencia, key: 'id' }, allowNull: false },
        id_horario: { type: DataTypes.INTEGER, references: { model: Horario, key: 'id' }, allowNull: false },
    },
    {
        sequelize,
        modelName: 'Solicitud',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
);

// Define las relaciones
User.hasMany(Solicitud, { foreignKey: 'id_usuario', as: 'usuarios' });
Solicitud.belongsTo(User, { foreignKey: 'id_usuario', as: 'Usolicitudes' });

Licencia.hasMany(Solicitud, { foreignKey: 'id_tipoLicencia', as: 'licencias' });
Solicitud.belongsTo(Licencia, { foreignKey: 'id_tipoLicencia', as: 'Lsolicitudes' });

Horario.hasOne(Solicitud, { foreignKey: 'id_horario', as: 'horario' });
Solicitud.belongsTo(Horario, { foreignKey: 'id_horario', as: 'solicitud' });