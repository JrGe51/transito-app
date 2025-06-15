import { Request, Response } from "express"
import bcrypt from 'bcrypt'
import { Admin } from "../models/admin"
import jwt from "jsonwebtoken"
import { generarEmailUnico } from "../utils/adminUtils" 

const MASTER_EMAIL = "admin@loespejo.com"
const MASTER_PASSWORD = "Admin@2024#Secure"

export const checkMasterCredentials = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
        res.json({ isMaster: true })
    } else {
        res.status(401).json({
            msg: "Credenciales inválidas"
        })
    }
}   

export const registerAdmin = async (req: Request, res: Response) => {
    const { name, lastname, password } = req.body

    try {
        const email = await generarEmailUnico(name, lastname)
        const passwordHash = await bcrypt.hash(password, 10)

        await Admin.create({
            name,
            lastname,
            email,
            password: passwordHash
        })
        
        res.json({
            msg: `Administrador ${name} ${lastname} creado exitosamente.`,
            email: email 
        })
    } catch (error) {
        res.status(400).json({
            msg: `Error al crear el administrador ${name} ${lastname}.`
        })   
    }
}

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body

    // Master Admin Login
    if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
        const token = jwt.sign({
            email: MASTER_EMAIL,
            isAdmin: true,
            isMaster: true
        }, process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', {
            expiresIn: '1h'
        })
        return res.json({ 
            token, 
            isAdmin: true,
            user: { // Incluir datos del master admin
                name: "Master", 
                lastname: "Admin", 
                email: MASTER_EMAIL,
                isAdmin: true 
            }
        })
    }

    // Regular Admin Login (from DB)
    if (!email.endsWith('@loespejoadmin.com')) {
        res.status(400).json({
            msg: "Credenciales inválidas"
        })
        return
    }

    const admin: any = await Admin.findOne({ where: { email } })

    if (!admin) {
        res.status(400).json({
            msg: "Credenciales inválidas"
        })
        return
    }

    const passwordValid = await bcrypt.compare(password, admin.getDataValue('password'))

    if (!passwordValid) {
        res.status(400).json({
            msg: "Credenciales inválidas"
        })
        return
    }

    const token = jwt.sign({
        id: admin.getDataValue('id'),
        email: admin.getDataValue('email'),
        isAdmin: true
    }, process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', {
        expiresIn: '1h'
    })

    res.json({ 
        token, 
        isAdmin: true,
        user: { // Incluir datos del admin de la DB
            id: admin.getDataValue('id'),
            name: admin.getDataValue('name'),
            lastname: admin.getDataValue('lastname'),
            email: admin.getDataValue('email'),
            isAdmin: true
        }
    })
} 