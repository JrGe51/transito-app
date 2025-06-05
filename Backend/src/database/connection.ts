import { Sequelize } from "sequelize";

const sequelize = new Sequelize ('api_nodejs', 'root', 'alfredonHD2004',{
    host: 'localhost',
    dialect: 'mysql'
})

export default sequelize;