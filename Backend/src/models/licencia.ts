import { DataTypes } from "sequelize";
import sequelize from "../database/connection"; 

export const Licencia = sequelize.define(
    'Licencia',
    {
        id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
        name: {type:DataTypes.STRING, allowNull: false},
        description: {type:DataTypes.STRING, allowNull: false},
    }
)