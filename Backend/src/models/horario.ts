import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";

// Define los atributos del modelo
interface HorarioAttributes {
    Hid: number;
    Hfecha: string;
    Hhora: string;
    Hcuposdisponibles: number;
}

// Define los atributos opcionales para la creación
interface HorarioCreationAttributes extends Optional<HorarioAttributes, 'Hid'> {}

// Extiende el modelo con los atributos definidos
export class Horario extends Model<HorarioAttributes, HorarioCreationAttributes> implements HorarioAttributes {
    public Hid!: number;
    public Hfecha!: string;
    public Hhora!: string;
    public Hcuposdisponibles!: number;
}

// Inicializa el modelo
Horario.init(
    {
        Hid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        Hfecha: { type: DataTypes.DATEONLY, allowNull: false },
        Hhora: { type: DataTypes.TIME, allowNull: false },
        Hcuposdisponibles: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
        sequelize,
        modelName: 'Horario',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
);