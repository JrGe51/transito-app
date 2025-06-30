import { Request, Response } from "express"
import bcrypt from 'bcrypt'
import { Admin } from "../models/admin"
import jwt from "jsonwebtoken"
import { generarEmailUnico } from "../utils/adminUtils" 
import { User } from "../models/user"
import { sendEmail } from "../utils/emailService"
import { Op } from "sequelize"

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

export const sendBulkEmail = async (req: Request, res: Response) => {
    try {
        const { asunto, mensaje } = req.body;
        if (!asunto || !mensaje) {
            return res.status(400).json({ error: 'Asunto y mensaje son requeridos.' });
        }

        // Solo permitir admins (ajusta según tu lógica de autenticación)
        // Aquí se asume que el admin está autenticado y autorizado

        // Obtener todos los correos de usuarios
        const users = await User.findAll({ attributes: ['email'], where: { email: { [Op.ne]: null } } });
        const emails = users.map((u: any) => u.email);

        // Enviar correo masivo (BCC)
        const html = `
          <h1 style="color:#d32f2f; font-size:2em; margin-bottom:20px;">Información del Departamento de Tránsito</h1>
          <p>${mensaje}</p>
          <hr>
          <p style="margin-top:30px;">
            Para cualquier consulta, no dude en contactarnos al <b>+569 73146125</b>.<br>
            Saludos cordiales,<br>
            Equipo de Tránsito
          </p>
        `;
        await sendEmail({
            to: '', // destinatario principal vacío
            bcc: emails,
            subject: asunto,
            html
        });

        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error enviando correos.' });
    }
}; 