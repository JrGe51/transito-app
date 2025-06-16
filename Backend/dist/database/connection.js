"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'railway', // Usar la variable de entorno o un valor por defecto
process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'pxZBLdwJcZpssXFiOfaaMPHVPneRwHio', {
    host: process.env.DB_HOST || 'centerbeam.proxy.rlwy.net',
    port: parseInt(process.env.DB_PORT || '57990', 10), // Convertir el puerto a número
    dialect: 'mysql',
    logging: false,
    // Si Railway requiere SSL/TLS, añade esto:
    dialectOptions: {
        ssl: {
            require: true, // Esto es crucial para conexiones SSL
            rejectUnauthorized: false // Puede ser necesario si no se usa un certificado CA específico
        }
    }
});
exports.default = sequelize;
