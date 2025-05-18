import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";

// Define los atributos del modelo
interface LicenciaAttributes {
    Lid: number;
    Lname: string;
    Ldescription: string;
}

// Define los atributos opcionales para la creación
interface LicenciaCreationAttributes extends Optional<LicenciaAttributes, 'Lid'> {}

// Extiende el modelo con los atributos definidos
export class Licencia extends Model<LicenciaAttributes, LicenciaCreationAttributes> implements LicenciaAttributes {
    public Lid!: number;
    public Lname!: string;
    public Ldescription!: string;
}

// Inicializa el modelo
Licencia.init(
    {
        Lid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        Lname: { type: DataTypes.STRING, allowNull: false },
        Ldescription: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize,
        modelName: 'Licencia',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
);