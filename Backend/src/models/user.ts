import { DataTypes } from "sequelize";
import sequelize from "../database/connection"; 

export const User = sequelize.define(
    'User',
    {
        Uid: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
        Uname: {type:DataTypes.STRING, allowNull: false},
        Urut: {type: DataTypes.STRING(12), allowNull: false, unique: true},
        Ulastname: {type:DataTypes.STRING, allowNull: false},
        Uemail: {type:DataTypes.STRING, allowNull: false, unique:true},
        Upassword: {type:DataTypes.STRING, allowNull: false},
        Utelefono: {type:DataTypes.STRING, allowNull: false},
        Ufechanacimiento: {type:DataTypes.DATEONLY, allowNull: false},
        Udireccion: {type:DataTypes.STRING, allowNull: false},
    }
)