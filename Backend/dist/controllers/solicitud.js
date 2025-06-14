"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSolicitud = void 0;
const solicitud_1 = require("../models/solicitud");
const horario_1 = require("../models/horario");
const licencia_1 = require("../models/licencia");
const user_1 = require("../models/user");
const emailService_1 = require("../utils/emailService");
const registerSolicitud = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, fecha, hora, tipoTramite, documentos } = req.body;
        const id_usuario = req.userId; // <-- Toma el usuario autenticado
        if (!id_usuario) {
            res.status(401).json({ msg: 'Usuario no autenticado' });
            return;
        }
        // Obtener el usuario para acceder a su email
        const usuario = yield user_1.User.findByPk(id_usuario);
        if (!usuario) {
            res.status(404).json({ msg: 'Usuario no encontrado' });
            return;
        }
        // Verificar si el usuario ya tiene una reserva activa
        const reservaExistente = yield solicitud_1.Solicitud.findOne({
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
        const licencia = yield licencia_1.Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`,
            });
            return;
        }
        // Validar que la fecha, hora y tipo de licencia existan en la tabla Horario y que el cupo esté disponible
        const horario = yield horario_1.Horario.findOne({
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
        const nuevaSolicitud = yield solicitud_1.Solicitud.create({
            fechaSolicitud: new Date(),
            id_usuario,
            tipoTramite,
            id_tipoLicencia: licencia.id,
            id_horario: horario.id,
            documentos: documentos || [], // Asegurarse de que sea un array, incluso si está vacío
        });
        // Actualizar el cupo disponible a false
        yield horario.update({ cupodisponible: false });
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
            const emailResult = yield (0, emailService_1.sendEmail)({
                to: usuario.email,
                subject: 'Confirmación de Reserva - Cita Licencia Conducir',
                html: emailContent
            });
            console.log('Resultado del envío:', emailResult);
        }
        catch (emailError) {
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
    }
    catch (error) {
        next(error);
    }
});
exports.registerSolicitud = registerSolicitud;
