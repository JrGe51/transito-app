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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.liberarHorario = exports.getHorasPorFecha = exports.getFechasDisponibles = exports.registerHorario = void 0;
const horario_1 = require("../models/horario");
const licencia_1 = require("../models/licencia");
const connection_1 = __importDefault(require("../database/connection"));
const registerHorario = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield connection_1.default.transaction();
    try {
        const { fecha, hora, cupodisponible, name } = req.body;
        // Validar formato de fecha (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            res.status(400).json({
                msg: "Formato de fecha inválido. Use YYYY-MM-DD"
            });
            return;
        }
        // Validar formato de hora (HH:mm)
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
            res.status(400).json({
                msg: "Formato de hora inválido. Use HH:mm"
            });
            return;
        }
        // Verificar si la licencia existe
        const licencia = yield licencia_1.Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`
            });
            return;
        }
        // Verificar si ya existe un horario con la misma fecha y hora
        const horarioExistente = yield horario_1.Horario.findOne({
            where: {
                fecha,
                hora,
                id_tipoLicencia: licencia.id
            }
        });
        if (horarioExistente) {
            res.status(400).json({
                msg: `Ya existe un horario para la fecha ${fecha} y hora ${hora} para la licencia ${name}`
            });
            return;
        }
        // Crear el nuevo horario
        yield horario_1.Horario.create({
            fecha,
            hora,
            cupodisponible: true,
            id_tipoLicencia: licencia.id
        }, { transaction: t });
        yield t.commit();
        res.status(201).json({
            msg: `Horario para ${fecha} a las ${hora} creado exitosamente.`
        });
    }
    catch (error) {
        yield t.rollback();
        console.error('Error al registrar horario:', error);
        res.status(500).json({
            msg: "Error al registrar el horario",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.registerHorario = registerHorario;
const getFechasDisponibles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.query; // Obtener el nombre de la licencia de los query params
        if (!name || typeof name !== 'string') {
            res.status(400).json({
                msg: "Nombre de licencia es requerido como query parameter"
            });
            return;
        }
        // Verificar si la licencia existe
        const licencia = yield licencia_1.Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`
            });
            return;
        }
        // Busca fechas con cupo disponible para la licencia especificada
        const fechas = yield horario_1.Horario.findAll({
            where: {
                cupodisponible: true,
                id_tipoLicencia: licencia.id // Filtrar por ID de licencia
            },
            attributes: ['fecha'],
            group: ['fecha'],
            order: [['fecha', 'ASC']]
        });
        // Filtrar fechas futuras, con esto las fechas pasadas no se muestran
        const hoy = new Date();
        // Ajustar hoy al inicio del día para comparar correctamente con fechas (YYYY-MM-DD)
        hoy.setHours(0, 0, 0, 0);
        const fechasFiltradas = fechas
            .map(f => f.fecha)
            .filter(fecha => new Date(fecha).setHours(0, 0, 0, 0) >= hoy.getTime()); // Comparar timestamps al inicio del día
        res.json(fechasFiltradas);
    }
    catch (error) {
        console.error('Error al obtener fechas:', error);
        res.status(500).json({
            msg: "Error al obtener fechas",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.getFechasDisponibles = getFechasDisponibles;
const getHorasPorFecha = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Asegúrate de que fecha y name sean strings
        let fechaStr;
        let name;
        if (typeof req.query.fecha === 'string') {
            fechaStr = req.query.fecha;
        }
        else if (Array.isArray(req.query.fecha) && req.query.fecha.length > 0 && typeof req.query.fecha[0] === 'string') {
            fechaStr = req.query.fecha[0];
        }
        if (typeof req.query.name === 'string') {
            name = req.query.name;
        }
        else if (Array.isArray(req.query.name) && req.query.name.length > 0 && typeof req.query.name[0] === 'string') {
            name = req.query.name[0];
        }
        if (!fechaStr || !name) {
            res.status(400).json({ msg: "Fecha y nombre de licencia son requeridos como query parameters" });
            return;
        }
        // Validar formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
            res.status(400).json({
                msg: "Formato de fecha inválido. Use YYYY-MM-DD"
            });
            return;
        }
        // Verificar que la fecha no sea en el pasado (solo para horas de fechas pasadas completas)
        const fechaObj = new Date(fechaStr);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Ajustar hoy al inicio del día
        if (fechaObj.setHours(0, 0, 0, 0) < hoy.getTime()) { // Comparar timestamps al inicio del día
            res.status(400).json({
                msg: "No se pueden consultar horarios de fechas pasadas completas"
            });
            return;
        }
        // Encontrar la licencia por nombre
        const licencia = yield licencia_1.Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`
            });
            return;
        }
        const horas = yield horario_1.Horario.findAll({
            where: {
                fecha: fechaStr,
                cupodisponible: true,
                id_tipoLicencia: licencia.id // Filtrar por ID de licencia
            },
            attributes: ['hora'],
            order: [['hora', 'ASC']]
        });
        // Formatear las horas a HH:mm antes de enviarlas
        res.json(horas.map(h => h.hora.substring(0, 5)));
    }
    catch (error) {
        console.error('Error al obtener horas:', error);
        res.status(500).json({
            msg: "Error al obtener horas",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.getHorasPorFecha = getHorasPorFecha;
const liberarHorario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield connection_1.default.transaction();
    try {
        const { fecha, hora, name } = req.body;
        // Validar datos de entrada
        if (!fecha || !hora || !name) {
            res.status(400).json({ msg: "Fecha, hora y nombre de licencia son requeridos" });
            return;
        }
        // Validar formato de fecha (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            res.status(400).json({
                msg: "Formato de fecha inválido. Use YYYY-MM-DD"
            });
            return;
        }
        // Validar formato de hora (HH:mm)
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
            res.status(400).json({
                msg: "Formato de hora inválido. Use HH:mm"
            });
            return;
        }
        // Encontrar la licencia por nombre
        const licencia = yield licencia_1.Licencia.findOne({ where: { name } });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia con el nombre '${name}' no existe.`
            });
            return;
        }
        // Encontrar el horario específico que NO esté disponible (false)
        const horario = yield horario_1.Horario.findOne({
            where: {
                fecha,
                hora,
                id_tipoLicencia: licencia.id,
                cupodisponible: false // Solo liberar horarios que ya están ocupados
            }
        });
        if (!horario) {
            res.status(404).json({
                msg: `No se encontró un horario ocupado para la fecha ${fecha}, hora ${hora} y licencia ${name}.`
            });
            return;
        }
        // Actualizar cupodisponible a true
        horario.cupodisponible = true;
        yield horario.save({ transaction: t });
        yield t.commit();
        res.json({
            msg: `Horario para ${fecha} a las ${hora} (Licencia: ${name}) liberado exitosamente.`
        });
    }
    catch (error) {
        yield t.rollback();
        console.error('Error al liberar horario:', error);
        res.status(500).json({
            msg: "Error al liberar el horario",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.liberarHorario = liberarHorario;
