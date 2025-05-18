import { Sequelize } from "sequelize";

const sequelize = new Sequelize ('api_nodejs', 'root', 'alfredonHD2004',{
    host: '127.0.0.1',
    dialect: 'mysql'
})

export default sequelize;