import { Sequelize } from "sequelize";

const sequelize = new Sequelize ('api_nodejs', 'transito_user', 'Qwerty12345',{
    host: '192.168.2.102',
    dialect: 'mysql'
})

export default sequelize;