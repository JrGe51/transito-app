"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'railway', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'MPvEQqIxGRDFzVZFvdtmCjgLCOTjURcR', {
    host: process.env.DB_HOST || 'switchyard.proxy.rlwy.net',
    port: parseInt(process.env.DB_PORT || '29972', 10), // Convertir el puerto a número
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});
exports.default = sequelize;
