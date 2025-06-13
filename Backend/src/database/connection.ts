import { Sequelize } from "sequelize";

const sequelize = new Sequelize ('api_nodejs', 'root', 'Koke_5104',{
    host: 'localhost',
    dialect: 'mysql'
})

export default sequelize;