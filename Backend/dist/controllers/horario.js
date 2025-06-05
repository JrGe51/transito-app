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
exports.getHorasPorFecha = exports.getFechasDisponibles = exports.registerHorario = void 0;
const horario_1 = require("../models/horario");
const sequelize_1 = require("sequelize");
const registerHorario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fecha, hora, cupodisponible } = req.body;
    horario_1.Horario.create({
        fecha: fecha,
        hora: hora,
        cupodisponible: cupodisponible,
    });
    res.json({
        msg: `Fecha ${fecha}  create succes..`,
    });
});
exports.registerHorario = registerHorario;
const getFechasDisponibles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Busca fechas con al menos un cupo disponible
        const fechas = yield horario_1.Horario.findAll({
            where: { cupodisponible: { [sequelize_1.Op.gt]: 0 } },
            attributes: ['fecha'],
            group: ['fecha'],
            order: [['fecha', 'ASC']]
        });
        // Devuelve solo el array de fechas
        res.json(fechas.map(f => f.fecha));
    }
    catch (error) {
        res.status(500).json({ msg: "Error al obtener fechas", error });
    }
});
exports.getFechasDisponibles = getFechasDisponibles;
const getHorasPorFecha = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Asegúrate de que fecha sea string
        const fecha = typeof req.query.fecha === 'string'
            ? req.query.fecha
            : Array.isArray(req.query.fecha)
                ? req.query.fecha[0]
                : undefined;
        if (!fecha) {
            res.status(400).json({ msg: "Fecha requerida" });
            return;
        }
        const horas = yield horario_1.Horario.findAll({
            where: { fecha, cupodisponible: { [sequelize_1.Op.gt]: 0 } },
            attributes: ['hora'],
            order: [['hora', 'ASC']]
        });
        res.json(horas.map(h => h.hora));
    }
    catch (error) {
        res.status(500).json({ msg: "Error al obtener horas", error });
    }
});
exports.getHorasPorFecha = getHorasPorFecha;
