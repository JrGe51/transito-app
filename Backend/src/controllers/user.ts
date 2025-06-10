import { Request, Response } from "express"
import bcrypt from 'bcrypt'
import { User } from "../models/user"
import { Op } from "sequelize"
import jwt from "jsonwebtoken"


export const register = async (req: Request, res: Response) => {
    const { name, rut, lastname, email, password, telefono, fechanacimiento, direccion } = req.body

    const user = await User.findOne({where: { [Op.or]: { email: email, rut: rut }}})

    if(user){
        res.status(400).json({
            msg: `El usuario ya existe con el email ${email} o rut ${rut}.`
        })
        return
    }

    console.log("Estoy por aqui");

    const passwordHash = await bcrypt.hash(password, 10)

    try {
        await User.create({
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
    } catch (error) {
        res.status(400).json({
            msg: `Existe un error al crear el usuario ${name} ${lastname}.`
        })   
    }
}

export const login = async (req: Request, res: Response) => {
    
    const {email, password} = req.body
    const user:any = await User.findOne({where: {email: email}})

    if(!user){
        res.status(400).json({
            msg: `El usuario no existe con el email ${email}.`
        })
        return
    }

    const passwordValid = await bcrypt.compare(password, user.password)

    if(!passwordValid){
        res.status(400).json({
            msg: `Contraseña Incorrecta ${password}.`
        })
        return
    }

    const token = jwt.sign({
        id: user.id,
        email: user.email,
    },  process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', {
        expiresIn: '1h'
    });

    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            rut: user.rut,
            telefono: user.telefono,
            fechanacimiento: user.fechanacimiento,
            direccion: user.direccion
        }
    })
}

