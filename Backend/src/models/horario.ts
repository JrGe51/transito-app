import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";

// Define los atributos del modelo
interface HorarioAttributes {
    id: number;
    fecha: string;
    hora: string;
    cupodisponible: number;
}

// Define los atributos opcionales para la creación
interface HorarioCreationAttributes extends Optional<HorarioAttributes, 'id'> {}

// Extiende el modelo con los atributos definidos
export class Horario extends Model<HorarioAttributes, HorarioCreationAttributes> implements HorarioAttributes {
    public id!: number;
    public fecha!: string;
    public hora!: string;
    public cupodisponible!: number;
}

// Inicializa el modelo
Horario.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        fecha: { type: DataTypes.DATEONLY, allowNull: false },
        hora: { type: DataTypes.TIME, allowNull: false },
        cupodisponible: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    {
        sequelize,
        modelName: 'Horario',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
);