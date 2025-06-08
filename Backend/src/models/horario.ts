import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";
import { Licencia } from "./licencia";
// Define los atributos del modelo
interface HorarioAttributes {
    id: number;
    fecha: string;
    hora: string;
    cupodisponible: boolean;
    id_tipoLicencia: number;
}

// Define los atributos opcionales para la creación
interface HorarioCreationAttributes extends Optional<HorarioAttributes, 'id'> {}

// Extiende el modelo con los atributos definidos
export class Horario extends Model<HorarioAttributes, HorarioCreationAttributes> implements HorarioAttributes {
    public id!: number;
    public fecha!: string;
    public hora!: string;
    public cupodisponible!: boolean;
    public id_tipoLicencia!: number;
}

// Inicializa el modelo
Horario.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        fecha: { type: DataTypes.DATEONLY, allowNull: false },
        hora: { type: DataTypes.TIME, allowNull: false },
        cupodisponible: { type: DataTypes.BOOLEAN, allowNull: false },
        id_tipoLicencia: { type: DataTypes.INTEGER, references: { model: Licencia, key: 'id' }, allowNull: false }
    },
    {
        sequelize,
        modelName: 'Horario',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
);

Licencia.hasOne(Horario, { foreignKey: 'id_tipoLicencia' });
Horario.belongsTo(Licencia, { foreignKey: 'id_tipoLicencia' });
