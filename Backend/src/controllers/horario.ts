import { Request, Response } from 'express';
import { Horario } from '../models/horario';

export const registerHorario = async (req: Request, res: Response) => {

    const { fecha, horainicio, horafin, cuposdisponibles } = req.body;

    Horario.create({
        fecha: fecha,
        horainicio: horainicio,
        horafin: horafin,
        cuposdisponibles: cuposdisponibles,
    })

    res.json({
        msg: `Fecha ${fecha}  create succes..`,
    })

}
