import { Request, Response } from 'express';
import { Licencia } from '../models/licencia';

export const registerLicencia = async (req: Request, res: Response) => {

    const { name, description } = req.body;
    
    Licencia.create({
        name: name,
        description: description,
    })

    res.json({
        msg: `Licencia ${name}  creada exitosamente.`,
    })

}

