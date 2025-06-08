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
const registerSolicitud = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, fecha, hora } = req.body;
        const id_usuario = req.userId; // <-- Toma el usuario autenticado
        if (!id_usuario) {
            res.status(401).json({ msg: 'Usuario no autenticado' });
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
            id_tipoLicencia: licencia.id,
            id_horario: horario.id
        });
        // Actualizar el cupo disponible a false
        yield horario.update({ cupodisponible: false });
        res.status(201).json({
            msg: `Solicitud creada exitosamente.`,
            solicitud: {
                fechaSolicitud: nuevaSolicitud.fechaSolicitud,
                name: licencia.name,
                fecha: horario.fecha,
                hora: horario.hora
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.registerSolicitud = registerSolicitud;
