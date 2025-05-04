import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user';

export const register = async (req: Request, res: Response) => {

    const { name, rut, lastname, email, password, telefono, fechanacimiento, direccion } = req.body;
    
    const passwordHash = await bcrypt.hash(password, 10)

    User.create({
        name: name,
        rut: rut,
        lastname: lastname,
        email: email,
        password: passwordHash,
        telefono: telefono,
        fechanacimiento: fechanacimiento,
        direccion: direccion,
    })

    res.json({
        msg: `User ${name} ${lastname} create succes..`,
    })

}

