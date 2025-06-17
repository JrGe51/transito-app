import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
          process.env.DB_NAME || 'railway',
          process.env.DB_USER || 'root',
          process.env.DB_PASSWORD || 'MPvEQqIxGRDFzVZFvdtmCjgLCOTjURcR',
          {
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
          }
        );

export default sequelize;