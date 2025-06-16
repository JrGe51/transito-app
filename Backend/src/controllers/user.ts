import { Request, Response, NextFunction } from "express"
import bcrypt from 'bcrypt'
import { User } from "../models/user"
import { Admin } from "../models/admin"
import { Op } from "sequelize"
import jwt from "jsonwebtoken"


export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, rut, lastname, email, password, telefono, fechanacimiento, direccion } = req.body


    const existingUserByEmail = await User.findOne({ where: { email: email } });
    if (existingUserByEmail) {
        res.status(400).json({
            msg: `El email ${email} ya se encuentra registrado.`
        });
        return;
    }


    const existingUserByRut = await User.findOne({ where: { rut: rut } });
    if (existingUserByRut) {
        res.status(400).json({
            msg: `El RUT ${rut} ya se encuentra registrado.`
        });
        return;
    }


    const existingAdminByEmail = await Admin.findOne({ where: { email: email } });
    if (existingAdminByEmail) {
        res.status(400).json({
            msg: `El email ${email} ya se encuentra registrado.`
        });
        return;
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
        return
    } catch (error) {
        res.status(400).json({
            msg: `Existe un error al crear el usuario ${name} ${lastname}.`
        })   
        return
    }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    
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
    return
}

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { name, lastname, email, telefono, fechanacimiento, direccion, rut } = req.body;

    try {
        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).json({
                msg: `No se encontró un usuario con el ID ${id}`
            });
            return;
        }


        const existingRutUser = await User.findOne({
            where: {
                rut: rut,
                id: { [Op.ne]: id } 
            }
        });

        if (existingRutUser) {
            res.status(400).json({
                msg: `El RUT '${rut}' ya está en uso por otro usuario.`
            });
            return;
        }


        const existingEmailUser = await User.findOne({
            where: {
                email: email,
                id: { [Op.ne]: id } 
            }
        });

        if (existingEmailUser) {
            res.status(400).json({
                msg: `El email '${email}' ya está en uso por otro usuario.`
            });
            return;
        }

        await user.update({
            name,
            lastname,
            email,
            telefono,
            fechanacimiento,
            direccion,
            rut
        });

        res.json({
            msg: 'Usuario actualizado correctamente',
            user
        });
        return
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al actualizar el usuario.',
            error
        });
        return
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('[getAllUsers] Intentando obtener todos los usuarios...');
        const users = await User.findAll({
            attributes: { exclude: ['password'] } 
        });

        console.log(`[getAllUsers] Usuarios encontrados: ${users.length}`);
        res.status(200).json({
            users
        });
        return;
    } catch (error) {
        console.error('[getAllUsers] Error al obtener usuarios:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al obtener usuarios.',
            error
        });
        return;
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    console.log(`[deleteUser] Intentando eliminar usuario con ID: ${id}`);
    try {
        const user = await User.findByPk(id);

        if (!user) {
            console.warn(`[deleteUser] Usuario con ID ${id} no encontrado.`);
            res.status(404).json({
                msg: `No se encontró un usuario con el ID ${id}`
            });
            return;
        }

        await user.destroy();
        console.log(`[deleteUser] Usuario con ID ${id} eliminado exitosamente.`);

        res.status(200).json({
            msg: 'Usuario eliminado correctamente.'
        });
        return;
    } catch (error) {
        console.error('[deleteUser] Error al eliminar usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al eliminar usuario.',
            error
        });
        return;
    }
};

