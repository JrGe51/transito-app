import express, { Application } from 'express';
import sequelize from '../database/connection';
import RUser from '../routes/user';
import RLicencia from '../routes/licencia';
import RHorario from '../routes/horario';
import { User } from './user';
import { Licencia } from './licencia';
import { Horario } from './horario';
import cors from 'cors';


class Server {

    private app: Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3017';
        this.listen();
        this.midlewares();
        this.router();
        this.DBconnet();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`El servidor se esta ejecutando en el port ${this.port}`);
        });
    }

    router() {
        this.app.use(RUser)
        this.app.use(RLicencia)
        this.app.use(RHorario)
    }

    midlewares() {
        this.app.use(express.json())
        this.app.use(cors())
    }

    async DBconnet() {
        try {
            await User.sync();
            await Licencia.sync();
            await Horario.sync();
            
            console.log("Base de datos conectada correctamente")
        } catch (error) {
            console.log("Error de conexion", error);

        }
    }
}

export default Server;