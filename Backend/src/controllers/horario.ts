import { Request, Response } from 'express';
import { Horario } from '../models/horario';
import { Op } from 'sequelize';

export const registerHorario = async (req: Request, res: Response) => {

    const { fecha, hora, cuposdisponibles } = req.body;

    Horario.create({
        fecha: fecha,
        hora: hora,
        cuposdisponibles: cuposdisponibles,
    })

    res.json({
        msg: `Fecha ${fecha}  create succes..`,
    })

}

export const getFechasDisponibles = async (req: Request, res: Response) => {
    try {
        // Busca fechas con al menos un cupo disponible
        const fechas = await Horario.findAll({
            where: { cuposdisponibles: { [Op.gt]: 0 } },
            attributes: ['fecha'],
            group: ['fecha'],
            order: [['fecha', 'ASC']]
        });
        // Devuelve solo el array de fechas
        res.json(fechas.map(f => f.fecha));
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener fechas", error });
    }
};

export const getHorasPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
        // Asegúrate de que fecha sea string
        const fecha = typeof req.query.fecha === 'string'
            ? req.query.fecha
            : Array.isArray(req.query.fecha)
                ? req.query.fecha[0]
                : undefined;

        if (!fecha) 
            res.status(400).json({ msg: "Fecha requerida" });
            return;

        const horas = await Horario.findAll({
            where: { fecha, cuposdisponibles: { [Op.gt]: 0 } },
            attributes: ['hora'],
            order: [['hora', 'ASC']]
        });
        res.json(horas.map(h => h.hora));
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener horas", error });
    }
};