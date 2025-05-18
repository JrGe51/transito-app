import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";

// Define los atributos del modelo
interface LicenciaAttributes {
    id: number;
    name: string;
    description: string;
}

// Define los atributos opcionales para la creación
interface LicenciaCreationAttributes extends Optional<LicenciaAttributes, 'id'> {}

// Extiende el modelo con los atributos definidos
export class Licencia extends Model<LicenciaAttributes, LicenciaCreationAttributes> implements LicenciaAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
}

// Inicializa el modelo
Licencia.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize,
        modelName: 'Licencia',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
);