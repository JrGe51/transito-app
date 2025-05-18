import { Request, Response } from 'express';
import { Horario } from '../models/horario';

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
