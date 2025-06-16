import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
          process.env.DB_NAME || 'railway',
          process.env.DB_USER || 'root',
          process.env.DB_PASSWORD || 'pxZBLdwJcZpssXFiOfaaMPHVPneRwHio',
          {
            host: process.env.DB_HOST || 'centerbeam.proxy.rlwy.net',
            port: parseInt(process.env.DB_PORT || '57990', 10), // Convertir el puerto a número
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