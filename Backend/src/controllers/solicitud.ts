import { Request, Response } from "express";
import { Solicitud } from "../models/solicitud";
import { Horario } from "../models/horario";
import { Licencia } from "../models/licencia";

export const registerSolicitud = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { name, fecha, hora } = req.body;

        const id_usuario = 1; // Usuario genérico o por defecto

        // Validar que el nombre de la licencia exista en la tabla Licencia
        const licencia = await Licencia.findOne({ where: { name } });
        if (!licencia) {
            return res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`,
            });
        }

        // Validar que la fecha y hora existan en la tabla Horario
        const horario = await Horario.findOne({ where: { fecha, hora } });
        if (!horario) {
            return res.status(404).json({
                msg: `El horario con la fecha '${fecha}' y hora '${hora}' no existe.`,
            });
        }

        // Crear la solicitud con la fecha actual
        const nuevaSolicitud = await Solicitud.create({
            fechaSolicitud: new Date(),
            id_usuario,
            id_tipoLicencia: licencia.id,
            id_horario: horario.id,
        });

        return res.status(201).json({
            msg: `Solicitud creada exitosamente.`,
            solicitud: {
                fechaSolicitud: nuevaSolicitud.fechaSolicitud,
                name: licencia.name,
                fecha: horario.fecha,
                hora: horario.hora,
            },
        });
    } catch (error) {
        console.error('Error al crear la solicitud:', error);
        res.status(500).json({
            msg: 'Ocurrió un error al crear la solicitud.',
            error: (error as Error).message,
        });
    }
};