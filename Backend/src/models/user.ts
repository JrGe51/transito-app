import { DataTypes } from "sequelize";
import sequelize from "../database/connection"; 

export const User = sequelize.define(
    'User',
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING, allowNull: false},
        rut: {type: DataTypes.STRING(12), allowNull: false, unique: true},
        lastname: {type: DataTypes.STRING, allowNull: false},
        email: {type: DataTypes.STRING, allowNull: false, unique: true},
        password: {type: DataTypes.STRING, allowNull: false},
        telefono: {type: DataTypes.STRING, allowNull: false},
        fechanacimiento: {type: DataTypes.DATEONLY, allowNull: false},
        direccion: {type: DataTypes.STRING, allowNull: false},
        codigoRecuperacion: {type: DataTypes.STRING, allowNull: true},
        codigoExpiracion: {type: DataTypes.DATE, allowNull: true},
        licenciaVigente: {type: DataTypes.JSON, allowNull: true, defaultValue: []},
        examenMedicoAprobado: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        examenPracticoAprobado: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        examenTeoricoAprobado: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        examenPsicotecnicoAprobado: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    },
    {
        freezeTableName: true,
    }
)