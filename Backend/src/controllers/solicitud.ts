import { Request, Response, NextFunction } from "express";
import { Solicitud } from "../models/solicitud";
import { Horario } from "../models/horario";
import { Licencia } from "../models/licencia";


export const registerSolicitud = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, fecha, hora, tipoTramite, documentos } = req.body;

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

        // Validar que la fecha, hora y tipo de licencia existan en la tabla Horario y que el cupo esté disponible
        const horario = await Horario.findOne({ 
            where: { 
                fecha, 
                hora,
                id_tipoLicencia: licencia.id // <-- Filtrar por tipo de licencia
            } 
        });
        
        if (!horario) {
            res.status(404).json({
                msg: `El horario con la fecha '${fecha}', hora '${hora}' y licencia '${name}' no existe o no tiene cupo disponible.`,
            });
            return;
        }

        // Verificar si el cupo está disponible
        if (!horario.cupodisponible) {
            res.status(400).json({
                msg: `Lo sentimos, el horario seleccionado ya no está disponible.`,
            });
            return;
        }

        // Crear la solicitud con la fecha actual
        const nuevaSolicitud = await Solicitud.create({
            fechaSolicitud: new Date(),
            id_usuario,
            tipoTramite,
            id_tipoLicencia: licencia.id,
            id_horario: horario.id,
            documentos: documentos || [], // Asegurarse de que sea un array, incluso si está vacío
        });

        // Actualizar el cupo disponible a false
        await horario.update({ cupodisponible: false });

        res.status(201).json({
            msg: `Solicitud creada exitosamente.`,
            solicitud: {
                fechaSolicitud: nuevaSolicitud.fechaSolicitud,
                name: licencia.name,
                fecha: horario.fecha,
                hora: horario.hora,
                tipoTramite: nuevaSolicitud.tipoTramite,
                documentos: nuevaSolicitud.documentos,
            },
        });
    } catch (error) {
        next(error);
    }
};