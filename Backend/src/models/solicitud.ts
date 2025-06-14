import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../database/connection";
import { User } from "./user";
import { Licencia } from "./licencia";
import { Horario, HorarioAttributes } from "./horario";
import { LicenciaAttributes } from "./licencia";

// Definir la interfaz para UserAttributes, ya que no está exportada en user.ts
interface UserAttributes {
    id: number;
    name: string;
    lastname: string;
    email: string;
    rut: string;
    password: string;
    telefono: string;
    fechanacimiento: Date;
    direccion: string;
}

// Define los atributos del modelo
interface SolicitudAttributes {
    id: number; 
    fechaSolicitud: Date; 
    tipoTramite: string;
    id_usuario: number; 
    id_tipoLicencia: number; 
    id_horario: number;
    documentos: any;
    horario?: Horario;
    tipoLicencia?: LicenciaAttributes;
    usuario?: UserAttributes;
}

// Define los atributos opcionales para la creación
interface SolicitudCreationAttributes extends Optional<SolicitudAttributes, 'id'> {}

// Extiende el modelo con los atributos definidos
export class Solicitud extends Model<SolicitudAttributes, SolicitudCreationAttributes> implements SolicitudAttributes {
    public id!: number;
    public fechaSolicitud!: Date;
    public tipoTramite!: string;
    public id_usuario!: number;
    public id_tipoLicencia!: number;
    public id_horario!: number;
    public documentos!: any;
    public horario?: Horario;
    public tipoLicencia?: LicenciaAttributes;
    public usuario?: UserAttributes;
}

// Inicializa el modelo
Solicitud.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        fechaSolicitud: { type: DataTypes.DATEONLY, allowNull: false },
        tipoTramite: { type: DataTypes.STRING, allowNull: false },
        id_usuario: { type: DataTypes.INTEGER, references: { model: User, key: 'id' }, allowNull: false },
        id_tipoLicencia: { type: DataTypes.INTEGER, references: { model: Licencia, key: 'id' }, allowNull: false },
        id_horario: { type: DataTypes.INTEGER, references: { model: Horario, key: 'id' }, allowNull: false },
        documentos: { type: DataTypes.JSON, allowNull: true, defaultValue: [] }, // Campo para almacenar documentos como JSON
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