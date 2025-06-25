import express, { Application, Request, Response, NextFunction } from 'express';
import RUser from '../routes/user';
import RLicencia from '../routes/licencia';
import RHorario from '../routes/horario';
import RSolicitud from '../routes/solicitud';
import RAdmin from '../routes/admin';
import { User } from './user';
import { Licencia } from './licencia';
import { Horario } from './horario';
import { Solicitud } from './solicitud';
import { Admin } from './admin';
import cors from 'cors';
import { defineAssociations } from './associations';
import { eliminarHorariosPasados } from '../controllers/horario';


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
        this.app.use(RSolicitud)
        this.app.use(RAdmin)
    }

    midlewares() {
        // Configuración para permitir payloads más grandes (archivos Base64)
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));

        // Configuración CORS explícita
        this.app.use(cors({
            origin: 'http://localhost:4200', // Solo permite solicitudes desde tu frontend de Angular
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
            credentials: true, // Permite el envío de cookies de origen cruzado
            optionsSuccessStatus: 204 // Para pre-vuelos OPTIONS
        }));

        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            console.error(err.stack); 
            res.status(500).json({
                msg: "Ocurrió un error en el servidor",
                error: err.message,
            });
        });
    }

    async DBconnet() {
        try {
            defineAssociations();

            await User.sync();
            await Licencia.sync();
            await Horario.sync();
            await Solicitud.sync();
            await Admin.sync();
            
            console.log("Base de datos conectada correctamente")
            // Eliminar horarios pasados automáticamente
            await eliminarHorariosPasados({} as any, { json: (msg: any) => console.log(msg) } as any);
        } catch (error) {
            console.log("Error de conexion", error);

        }
    }
}

export default Server;