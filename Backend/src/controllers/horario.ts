import { Request, Response } from 'express';
import { Horario } from '../models/horario';

export const registerHorario = async (req: Request, res: Response) => {

    const { Hfecha, Hhora, Hcuposdisponibles } = req.body;

    Horario.create({
        Hfecha: Hfecha,
        Hhora: Hhora,
        Hcuposdisponibles: Hcuposdisponibles,
    })

    res.json({
        msg: `Fecha ${Hfecha}  create succes..`,
    })

}
