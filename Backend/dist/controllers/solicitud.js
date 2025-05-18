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
const registerSolicitud = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Lname, Hfecha, Hhora } = req.body;
        const id_usuario = 1; // Usuario genérico o por defecto
        // Validar que el nombre de la licencia exista en la tabla Licencia
        const licencia = yield licencia_1.Licencia.findOne({ where: { Lname } });
        if (!licencia) {
            return res.status(404).json({
                msg: `La licencia con el nombre '${Lname}' no existe.`,
            });
        }
        // Validar que la fecha y hora existan en la tabla Horario
        const horario = yield horario_1.Horario.findOne({ where: { Hfecha, Hhora } });
        if (!horario) {
            return res.status(404).json({
                msg: `El horario con la fecha '${Hfecha}' y hora '${Hhora}' no existe.`,
            });
        }
        // Crear la solicitud con la fecha actual
        const nuevaSolicitud = yield solicitud_1.Solicitud.create({
            SfechaSolicitud: new Date(),
            id_usuario,
            id_tipoLicencia: licencia.Lid,
            id_horario: horario.Hid,
        });
        return res.status(201).json({
            msg: `Solicitud creada exitosamente.`,
            solicitud: {
                SfechaSolicitud: nuevaSolicitud.SfechaSolicitud,
                Lname: licencia.Lname,
                Hfecha: horario.Hfecha,
                Hhora: horario.Hhora,
            },
        });
    }
    catch (error) {
        console.error('Error al crear la solicitud:', error);
        res.status(500).json({
            msg: 'Ocurrió un error al crear la solicitud.',
            error: error.message,
        });
    }
});
exports.registerSolicitud = registerSolicitud;
