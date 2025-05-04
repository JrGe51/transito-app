import { DataTypes } from "sequelize";
import sequelize from "../database/connection"; 

export const Horario = sequelize.define(
    'Horario',
    {
        id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
        fecha: {type:DataTypes.STRING, allowNull: false},
        horainicio: {type:DataTypes.TIME, allowNull: false},
        horafin: {type:DataTypes.TIME, allowNull: false},
        cuposdisponibles: {type:DataTypes.INTEGER, allowNull: false},
    }
)