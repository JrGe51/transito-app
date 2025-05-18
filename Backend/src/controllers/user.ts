import { Request, Response } from "express"
import bcrypt from 'bcrypt'
import { User } from "../models/user"
import { Op } from "sequelize"
import jwt from "jsonwebtoken"


export const register = async (req: Request, res: Response) => {
    const { Uname, Urut, Ulastname, Uemail, Upassword, Utelefono, Ufechanacimiento, Udireccion } = req.body

    const user = await User.findOne({where: { [Op.or]: { email: Uemail, rut: Urut }}})

    if(user){
        res.status(400).json({
            msg: `El usuario ya existe con el email ${Uemail} o rut ${Urut}.`
        })
        return
    }

    console.log("Estoy por aqui");

    const passwordHash = await bcrypt.hash(Upassword, 10)

    try {
        await User.create({
            Uname: Uname,
            Urut: Urut,
            Ulastname: Ulastname,
            Uemail: Uemail,
            Upassword: passwordHash,
            Utelefono: Utelefono,
            Ufechanacimiento: Ufechanacimiento,
            Udireccion: Udireccion,
        })
        
        res.json({
            msg: `User ${Uname} ${Ulastname} create succes..`,
        })
    } catch (error) {
        res.status(400).json({
            msg: `Existe un error al crear el usuario ${Uname} ${Ulastname}.`
        })   
    }
}

export const login = async (req: Request, res: Response) => {
    
    const {Uemail, Upassword} = req.body
    const user:any = await User.findOne({where: {email: Uemail}})

    if(!user){
        res.status(400).json({
            msg: `El usuario no existe con el email ${Uemail}.`
        })
        return
    }

    const passwordValid = await bcrypt.compare(Upassword, user.Upassword)

    if(!passwordValid){
        res.status(400).json({
            msg: `Contraseña Incorrecta ${Upassword}.`
        })
        return
    }

    const token = jwt.sign({
        Uemail: Uemail ,
        Upassword: Upassword,
    },  process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', {
        expiresIn: '1h'
    });

    res.json({token})

}

