import { Request, Response, NextFunction } from "express";
import { Solicitud } from "../models/solicitud";
import { Horario } from "../models/horario";
import { Licencia } from "../models/licencia";
import { User } from "../models/user";
import { sendEmail, formatDate, getRequiredDocuments } from "../utils/emailService";

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
        const { name, fecha, hora, tipoTramite, documentos, claseAnterior, claseNueva } = req.body;

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
            documentos: documentos || [],
            claseAnterior,
            claseNueva
        });

        // Actualizar el cupo disponible a false
        await horario.update({ cupodisponible: false });

        console.log('Intentando enviar correo a:', usuario.email);
        
        // Obtener documentos requeridos según el tipo de trámite y licencia
        const documentosRequeridos = getRequiredDocuments(tipoTramite, name);
        const documentosList = documentosRequeridos.map(doc => `<li>${doc}</li>`).join('');

        // Enviar correo de confirmación
        const emailContent = `
            <h1>¡Reserva Confirmada!</h1>
            <p>Estimado/a ${usuario.name} ${usuario.lastname},</p>
            <p>Su reserva ha sido confirmada exitosamente con los siguientes detalles:</p>
            <ul>
                <li><strong>Tipo de Licencia:</strong> ${name}</li>
                <li><strong>Fecha de Cita:</strong> ${formatDate(fecha)}</li>
                <li><strong>Hora de Cita:</strong> ${hora}</li>
                <li><strong>Tipo de Trámite:</strong> ${tipoTramite}</li>
                <li><strong>Número de Solicitud:</strong> #${nuevaSolicitud.id}</li>
            </ul>

            <h3>Documentos Requeridos para su Cita:</h3>
            <ul>
                ${documentosList}
            </ul>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196f3;">
                <p style="margin: 0; color: #1565c0; font-weight: bold;">📋 Información Importante sobre Documentos:</p>
                <p style="margin: 5px 0 0 0; color: #1565c0;">
                    Si ya subió documentos a través del formulario de reserva, <strong>NO es necesario</strong> llevarlos físicamente el día de su cita. 
                    Nuestro personal ya tiene acceso a los documentos digitales que envió.
                </p>
            </div>

            <h3>Información Importante:</h3>
            <ul>
                <li>Llegue 15 minutos antes de su hora de cita</li>
                <li>Si NO subió documentos digitalmente, traiga todos los documentos originales y sus fotocopias</li>
                <li>Los documentos deben estar vigentes y en buen estado</li>
                <li>Si algún documento no está disponible, contacte con anticipación</li>
            </ul>

            <p>Si necesita realizar algún cambio o cancelar su reserva, por favor contáctenos al <strong>+569 73146125</strong>.</p>
            <p>Saludos cordiales,<br><strong>Equipo de Tránsito</strong></p>
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
        const id_usuario = (req as any).userId; 
        console.log(`[getSolicitudesByUser] Intentando obtener solicitudes para el usuario ID: ${id_usuario}`);

        if (!id_usuario) {
            console.warn('[getSolicitudesByUser] Usuario no autenticado: id_usuario es nulo o indefinido.');
            res.status(401).json({ msg: 'Usuario no autenticado.' });
            return; 
        }

        console.log('[getSolicitudesByUser] Construyendo consulta Sequelize...');
        const solicitudes = await Solicitud.findAll({
            where: { id_usuario: id_usuario },
            include: [
                { model: Horario, as: 'horario' },
                { model: Licencia, as: 'tipoLicencia' },
                { model: User, as: 'usuario', attributes: ['name', 'lastname', 'email'] } 
            ]
        });

        console.log(`[getSolicitudesByUser] Solicitudes encontradas: ${solicitudes.length}`);
        if (solicitudes.length === 0) {
            res.status(404).json({
                msg: 'Usted no cuenta con una reserva activa.'
            });
            console.log('[getSolicitudesByUser] Usted no cuenta con una reserva activa.');
            return; 
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
            attributes: { exclude: ['documentos'] }, 
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
        const { id } = req.params; 

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

        if (solicitud.horario) {
            await solicitud.horario.update({ cupodisponible: true });
        }

        const emailContent = `
            <h1>Cancelación de Solicitud</h1>
            <p>Estimado/a ${solicitud.usuario?.name} ${solicitud.usuario?.lastname},</p>
            <p>Su solicitud ha sido cancelada exitosamente con los siguientes detalles:</p>
            <ul>
                <li><strong>Tipo de Licencia:</strong> ${solicitud.tipoLicencia?.name}</li>
                <li><strong>Fecha de Cita:</strong> ${solicitud.horario?.fecha ? formatDate(solicitud.horario.fecha) : 'No disponible'}</li>
                <li><strong>Hora de Cita:</strong> ${solicitud.horario?.hora}</li>
                <li><strong>Tipo de Trámite:</strong> ${solicitud.tipoTramite}</li>
                <li><strong>Número de Solicitud:</strong> #${solicitud.id}</li>
            </ul>

            <h3>Información Importante:</h3>
            <ul>
                <li>Su cupo ha sido liberado y está disponible para otros usuarios</li>
                <li>Puede realizar una nueva solicitud cuando lo desee</li>
                <li>Si canceló por error, puede contactarnos para verificar disponibilidad</li>
            </ul>

            <p>Si necesita realizar una nueva solicitud, puede hacerlo a través de nuestra plataforma.</p>
            <p>Para cualquier consulta, no dude en contactarnos al <strong>+569 73146125</strong>.</p>
            <p>Saludos cordiales,<br><strong>Equipo de Tránsito</strong></p>
        `;

        try {
            await sendEmail({
                to: solicitud.usuario?.email || '',
                subject: 'Cancelación de Solicitud - Cita Licencia Conducir',
                html: emailContent
            });
        } catch (emailError) {
            console.error('Error al enviar el correo de cancelación:', emailError);
        }

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

export const getSolicitudesByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ msg: 'ID de usuario es requerido.' });
            return;
        }
        const solicitudes = await Solicitud.findAll({
            where: { id_usuario: id },
        });
        if (solicitudes.length === 0) {
            res.status(200).json({ hasActive: false });
            return;
        }
        res.status(200).json({ hasActive: true, solicitudes });
    } catch (error) {
        console.error('[getSolicitudesByUserId] Error al obtener solicitudes por usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor al obtener las solicitudes.',
            error
        });
    }
};

export const rescheduleSolicitud = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { horarioId } = req.body;

    const solicitud = await Solicitud.findByPk(id, {
        include: [
            { model: Horario, as: 'horario' },
            { model: User, as: 'usuario' },
            { model: Licencia, as: 'tipoLicencia' }
        ]
    });
    if (!solicitud) {
        res.status(404).json({ msg: 'Solicitud no encontrada.' });
        return;
    }

    const oldHorario = solicitud.horario;
    const oldHorarioId = solicitud.id_horario;

    const newHorario = await Horario.findByPk(horarioId);
    if (!newHorario || !newHorario.cupodisponible) {
        res.status(400).json({ msg: 'El nuevo horario no está disponible.' });
        return;
    }

    solicitud.id_horario = newHorario.id;
    await solicitud.save();

    await newHorario.update({ cupodisponible: false });
    if (oldHorario) {
        await oldHorario.update({ cupodisponible: true });
    }

    if (!solicitud.tipoLicencia) {
        console.error(`La solicitud ${solicitud.id} no tiene un tipo de licencia asociado.`);
        res.status(500).json({ msg: 'Error interno: No se pudo determinar el tipo de licencia para la notificación.' });
        return; 
    }

    const documentosRequeridos = getRequiredDocuments(solicitud.tipoTramite, solicitud.tipoLicencia.name);
    const documentosList = documentosRequeridos.map(doc => `<li>${doc}</li>`).join('');

    const emailContent = `
        <h1>¡Su Cita ha sido Reagendada!</h1>
        <p>Estimado/a ${solicitud.usuario?.name} ${solicitud.usuario?.lastname},</p>
        <p>Le informamos que su cita ha sido reagendada. A continuación, los detalles:</p>
        
        <h3>Cita Anterior:</h3>
        <ul>
            <li><strong>Fecha:</strong> ${oldHorario ? formatDate(oldHorario.fecha) : 'No disponible'}</li>
            <li><strong>Hora:</strong> ${oldHorario?.hora || 'No disponible'}</li>
        </ul>

        <h3>Nueva Cita:</h3>
        <ul>
            <li><strong>Fecha:</strong> ${formatDate(newHorario.fecha)}</li>
            <li><strong>Hora:</strong> ${newHorario.hora}</li>
        </ul>

        <p><strong>Detalles de la Solicitud:</strong></p>
        <ul>
            <li><strong>Tipo de Licencia:</strong> ${solicitud.tipoLicencia?.name}</li>
            <li><strong>Tipo de Trámite:</strong> ${solicitud.tipoTramite}</li>
            <li><strong>Número de Solicitud:</strong> #${solicitud.id}</li>
        </ul>

        <h3>Documentos Requeridos para su Nueva Cita:</h3>
        <ul>
            ${documentosList}
        </ul>

        <h3>Información Importante:</h3>
        <ul>
            <li>Llegue 15 minutos antes de su nueva hora de cita</li>
            <li>Si NO subió documentos digitalmente, traiga todos los documentos originales y sus fotocopias</li>
            <li>Los documentos deben estar vigentes y en buen estado</li>
        </ul>

        <p>Si tiene alguna consulta sobre este cambio, por favor contáctenos al <strong>+569 73146125</strong>.</p>
        <p>Saludos cordiales,<br><strong>Equipo de Tránsito</strong></p>
    `;

    try {
        await sendEmail({
            to: solicitud.usuario?.email || '',
            subject: 'Notificación de Reagendamiento de Cita',
            html: emailContent
        });
    } catch (emailError) {
        console.error('Error al enviar el correo de reagendamiento:', emailError);
    }

    res.status(200).json({ msg: 'La cita ha sido reagendada correctamente.' });
};