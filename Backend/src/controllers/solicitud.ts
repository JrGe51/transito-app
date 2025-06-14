import { Request, Response, NextFunction } from "express";
import { Solicitud } from "../models/solicitud";
import { Horario } from "../models/horario";
import { Licencia } from "../models/licencia";
import { User } from "../models/user";
import { sendEmail } from "../utils/emailService";

interface UserAttributes {
    id: number;
    name: string;
    lastname: string;
    email: string;
    rut: string;
    password: string;
    telefono: string;
    fechanacimiento: Date;
    direccion: string;
}

export const registerSolicitud = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, fecha, hora, tipoTramite, documentos } = req.body;

        const id_usuario = (req as any).userId; // <-- Toma el usuario autenticado

        if (!id_usuario) {
            res.status(401).json({ msg: 'Usuario no autenticado' });
            return;
        }

        // Obtener el usuario para acceder a su email
        const usuario = await User.findByPk(id_usuario) as unknown as UserAttributes;
        if (!usuario) {
            res.status(404).json({ msg: 'Usuario no encontrado' });
            return;
        }

        // Verificar si el usuario ya tiene una reserva activa
        const reservaExistente = await Solicitud.findOne({
            where: { id_usuario }
        });

        if (reservaExistente) {
            res.status(400).json({
                msg: 'Ya tienes una reserva activa. No puedes crear más reservas hasta que se complete la actual.',
                type: 'warning'
            });
            return;
        }

        // Validar que el nombre de la licencia exista en la tabla Licencia
        const licencia = await Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`,
            });
            return;
        }

        // Validar que la fecha, hora y tipo de licencia existan en la tabla Horario y que el cupo esté disponible
        const horario = await Horario.findOne({ 
            where: { 
                fecha, 
                hora,
                id_tipoLicencia: licencia.id // <-- Filtrar por tipo de licencia
            } 
        });
        
        if (!horario) {
            res.status(404).json({
                msg: `El horario con la fecha '${fecha}', hora '${hora}' y licencia '${name}' no existe o no tiene cupo disponible.`,
            });
            return;
        }

        // Verificar si el cupo está disponible
        if (!horario.cupodisponible) {
            res.status(400).json({
                msg: `Lo sentimos, el horario seleccionado ya no está disponible.`,
            });
            return;
        }

        // Crear la solicitud con la fecha actual
        const nuevaSolicitud = await Solicitud.create({
            fechaSolicitud: new Date(),
            id_usuario,
            tipoTramite,
            id_tipoLicencia: licencia.id,
            id_horario: horario.id,
            documentos: documentos || [], // Asegurarse de que sea un array, incluso si está vacío
        });

        // Actualizar el cupo disponible a false
        await horario.update({ cupodisponible: false });

        console.log('Intentando enviar correo a:', usuario.email);
        
        // Enviar correo de confirmación
        const emailContent = `
            <h1>¡Reserva Confirmada!</h1>
            <p>Estimado/a ${usuario.name} ${usuario.lastname},</p>
            <p>Su reserva ha sido confirmada exitosamente con los siguientes detalles:</p>
            <ul>
                <li><strong>Tipo de Licencia:</strong> ${name}</li>
                <li><strong>Fecha:</strong> ${fecha}</li>
                <li><strong>Hora:</strong> ${hora}</li>
                <li><strong>Tipo de Trámite:</strong> ${tipoTramite}</li>
            </ul>

            <p>Por favor, asegúrese de traer todos los documentos necesarios el día de su cita.</p>
            <p>Si necesita realizar algún cambio o cancelar su reserva, por favor contáctenos.</p>
            <p>Saludos cordiales,<br>Equipo de Tránsito</p>
        `;

        try {
            console.log('Iniciando envío de correo...');
            const emailResult = await sendEmail({
                to: usuario.email,
                subject: 'Confirmación de Reserva - Cita Licencia Conducir',
                html: emailContent
            });
            console.log('Resultado del envío:', emailResult);
        } catch (emailError) {
            console.error('Error al enviar el correo:', emailError);
        }

        res.status(201).json({
            msg: `Solicitud creada exitosamente.`,
            solicitud: {
                fechaSolicitud: nuevaSolicitud.fechaSolicitud,
                name: licencia.name,
                fecha: horario.fecha,
                hora: horario.hora,
                tipoTramite: nuevaSolicitud.tipoTramite,
                documentos: nuevaSolicitud.documentos,
            },
        });
    } catch (error) {
        next(error);
    }
};