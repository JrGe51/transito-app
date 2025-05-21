import { Request, Response, NextFunction } from "express";
import { Solicitud } from "../models/solicitud";
import { Horario } from "../models/horario";
import { Licencia } from "../models/licencia";


export const registerSolicitud = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, fecha, hora } = req.body;

        const id_usuario = (req as any).userId; // <-- Toma el usuario autenticado

        if (!id_usuario) {
            res.status(401).json({ msg: 'Usuario no autenticado' });
            return;
        }

        // Validar que el nombre de la licencia exista en la tabla Licencia
        const licencia = await Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`,
            });
            return;
        }

        // Validar que la fecha y hora existan en la tabla Horario
        const horario = await Horario.findOne({ where: { fecha, hora } });
        if (!horario) {
            res.status(404).json({
                msg: `El horario con la fecha '${fecha}' y hora '${hora}' no existe.`,
            });
            return;
        }

        // Crear la solicitud con la fecha actual
        const nuevaSolicitud = await Solicitud.create({
            fechaSolicitud: new Date(),
            id_usuario,
            id_tipoLicencia: licencia.id,
            id_horario: horario.id,
        });

        res.status(201).json({
            msg: `Solicitud creada exitosamente.`,
            solicitud: {
                fechaSolicitud: nuevaSolicitud.fechaSolicitud,
                name: licencia.name,
                fecha: horario.fecha,
                hora: horario.hora,
            },
        });
    } catch (error) {
        next(error);
    }
};