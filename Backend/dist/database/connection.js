"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('api_nodejs', 'transito_user', 'Qwerty12345', {
    host: '192.168.2.102',
    dialect: 'mysql'
});
exports.default = sequelize;
