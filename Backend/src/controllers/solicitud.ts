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
        // Verificar si el usuario ya tiene una reserva activa (para la regla de una reserva por usuario)
        const reservaExistente = await Solicitud.findOne({
            where: { id_usuario } // Buscar cualquier reserva existente
        });

        if (reservaExistente) {
            res.status(400).json({
                msg: 'Ya tienes una reserva activa. No puedes crear más reservas hasta que tu reserva actual sea procesada.',
                type: 'warning'
            });
            return;
        }

        let licencia;
        // Si el tipo de trámite es Renovación y no se especificó una clase de licencia (name es 'Renovación'),
        // asignamos una licencia por defecto (ej. 'Clase B') para que la solicitud pueda crearse.
        if (tipoTramite === 'Renovación' && name === 'Renovación') {
            licencia = await Licencia.findOne({ where: { name: 'Clase B' } }); // Usar una licencia existente como predeterminada
            if (!licencia) {
                res.status(500).json({ msg: 'Error interno: Licencia por defecto para Renovación no encontrada.' });
                return;
            }
        } else {
            // Validar que el nombre de la licencia exista en la tabla Licencia para otros trámites o si se especificó una clase
            licencia = await Licencia.findOne({ where: { name } });
            if (!licencia) {
                res.status(404).json({
                    msg: `La licencia con el nombre '${name}' no existe.`,
                });
                return;
            }
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

export const getSolicitudesByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_usuario = (req as any).userId; // Asumiendo que el ID del usuario está en req.userId del middleware de autenticación
        console.log(`[getSolicitudesByUser] Intentando obtener solicitudes para el usuario ID: ${id_usuario}`);

        if (!id_usuario) {
            console.warn('[getSolicitudesByUser] Usuario no autenticado: id_usuario es nulo o indefinido.');
            res.status(401).json({ msg: 'Usuario no autenticado.' });
            return; // Añadir return aquí para que la función termine con void
        }

        console.log('[getSolicitudesByUser] Construyendo consulta Sequelize...');
        const solicitudes = await Solicitud.findAll({
            where: { id_usuario: id_usuario },
            include: [
                { model: Horario, as: 'horario' },
                { model: Licencia, as: 'tipoLicencia' },
                { model: User, as: 'usuario', attributes: ['name', 'lastname', 'email'] } // Incluir solo algunos atributos del usuario
            ]
        });

        console.log(`[getSolicitudesByUser] Solicitudes encontradas: ${solicitudes.length}`);
        if (solicitudes.length === 0) {
            res.status(404).json({
                msg: 'No se encontraron solicitudes para este usuario.'
            });
            console.log('[getSolicitudesByUser] No se encontraron solicitudes para este usuario.');
            return; // Añadir return aquí para que la función termine con void
        }

        res.status(200).json({
            solicitudes
        });
        console.log('[getSolicitudesByUser] Solicitudes enviadas exitosamente.');

    } catch (error) {
        console.error('[getSolicitudesByUser] Error al obtener solicitudes por usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al obtener las solicitudes.',
            error
        });
    }
};

export const getAllSolicitudes = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('[getAllSolicitudes] Intentando obtener todas las solicitudes...');

        const solicitudes = await Solicitud.findAll({
            attributes: { exclude: ['documentos'] }, // Excluir el campo documentos
            include: [
                { 
                    model: User, 
                    as: 'usuario',
                    attributes: ['name', 'lastname', 'email', 'rut', 'telefono']
                },
                { 
                    model: Licencia, 
                    as: 'tipoLicencia',
                    attributes: ['name', 'description']
                },
                { 
                    model: Horario, 
                    as: 'horario',
                    attributes: ['fecha', 'hora', 'cupodisponible']
                }
            ],
            order: [['fechaSolicitud', 'DESC']]
        });

        console.log(`[getAllSolicitudes] Solicitudes encontradas: ${solicitudes.length}`);

        res.status(200).json({
            solicitudes
        });
        console.log('[getAllSolicitudes] Solicitudes enviadas exitosamente.');

    } catch (error) {
        console.error('Error al obtener todas las solicitudes:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al obtener las solicitudes.',
            error
        });
    }
};

export const getSolicitudById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Obtener el ID de los parámetros de la URL

        if (!id) {
            res.status(400).json({ msg: 'ID de solicitud es requerido.' });
            return;
        }

        const solicitud = await Solicitud.findByPk(id, {
            include: [
                { 
                    model: User, 
                    as: 'usuario',
                    attributes: ['name', 'lastname', 'email', 'rut', 'telefono']
                },
                { 
                    model: Licencia, 
                    as: 'tipoLicencia',
                    attributes: ['name', 'description']
                },
                { 
                    model: Horario, 
                    as: 'horario',
                    attributes: ['fecha', 'hora', 'cupodisponible']
                }
            ]
        });

        if (!solicitud) {
            res.status(404).json({ msg: 'Solicitud no encontrada.' });
            return;
        }

        res.status(200).json({ solicitud });

    } catch (error) {
        console.error('Error al obtener solicitud por ID:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al obtener la solicitud.',
            error
        });
    }
};

export const deleteSolicitud = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const solicitud = await Solicitud.findByPk(id, {
            include: [
                { model: Horario, as: 'horario' },
                { model: User, as: 'usuario' },
                { model: Licencia, as: 'tipoLicencia' }
            ]
        });

        if (!solicitud) {
            res.status(404).json({
                msg: 'Solicitud no encontrada'
            });
            return;
        }

        // Liberar el cupo del horario
        if (solicitud.horario) {
            await solicitud.horario.update({ cupodisponible: true });
        }

        // Preparar el correo de cancelación
        const emailContent = `
            <h1>Cancelación de Solicitud</h1>
            <p>Estimado/a ${solicitud.usuario?.name} ${solicitud.usuario?.lastname},</p>
            <p>Su solicitud ha sido cancelada exitosamente con los siguientes detalles:</p>
            <ul>
                <li><strong>Tipo de Licencia:</strong> ${solicitud.tipoLicencia?.name}</li>
                <li><strong>Fecha de Cita:</strong> ${solicitud.horario?.fecha}</li>
                <li><strong>Hora de Cita:</strong> ${solicitud.horario?.hora}</li>
                <li><strong>Tipo de Trámite:</strong> ${solicitud.tipoTramite}</li>
            </ul>
            <p>Si necesita realizar una nueva solicitud, puede hacerlo a través de nuestra plataforma.</p>
            <p>Saludos cordiales,<br>Equipo de Tránsito</p>
        `;

        // Enviar correo de cancelación
        try {
            await sendEmail({
                to: solicitud.usuario?.email || '',
                subject: 'Cancelación de Solicitud - Cita Licencia Conducir',
                html: emailContent
            });
        } catch (emailError) {
            console.error('Error al enviar el correo de cancelación:', emailError);
        }

        // Eliminar la solicitud
        await solicitud.destroy();

        res.json({
            msg: 'Solicitud eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar la solicitud:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al eliminar la solicitud',
            error
        });
    }
};