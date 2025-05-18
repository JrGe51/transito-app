import { Request, Response } from 'express';
import { Licencia } from '../models/licencia';

export const registerLicencia = async (req: Request, res: Response) => {

    const { Lname, Ldescription } = req.body;
    
    Licencia.create({
        Lname: Lname,
        Ldescription: Ldescription,
    })

    res.json({
        msg: `Licencia ${name}  create succes..`,
    })

}

