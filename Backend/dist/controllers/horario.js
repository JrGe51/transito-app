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
exports.deleteHorario = exports.getAllHorarios = exports.liberarHorario = exports.getHorasPorFecha = exports.getFechasDisponibles = exports.registerHorario = void 0;
const horario_1 = require("../models/horario");
const licencia_1 = require("../models/licencia");
const connection_1 = __importDefault(require("../database/connection"));
const registerHorario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield connection_1.default.transaction();
    try {
        const { fecha, hora, name } = req.body;
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
        // --- NUEVA VALIDACIÓN: Rango de horas ---
        const [horasStr, minutosStr] = hora.split(':');
        const horas = parseInt(horasStr, 10);
        if (horas < 9 || horas > 18) {
            res.status(400).json({
                msg: "Solo se pueden crear horarios entre las 09:00 y las 18:00 horas."
            });
            return;
        }
        // --- FIN NUEVA VALIDACIÓN ---
        // Verificar que la fecha sea mañana o posterior
        // Parsear la fecha de entrada para que sea la medianoche local
        const partesFecha = fecha.split('-').map(Number);
        const fechaObj = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]); // Mes es 0-indexado
        fechaObj.setHours(0, 0, 0, 0); // Asegurarse de que es la medianoche local de ese día
        const ahora = new Date();
        const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
        manana.setHours(0, 0, 0, 0); // Ya es la medianoche local de mañana
        // Ahora, compara los valores numéricos de las fechas (milisegundos desde la época)
        if (fechaObj.getTime() < manana.getTime()) {
            res.status(400).json({
                msg: "Solo se pueden crear horarios a partir de mañana"
            });
            return;
        }
        // --- NUEVA VALIDACIÓN: Días de la semana ---
        const diaSemana = fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        if (diaSemana === 0 || diaSemana === 6) { // Si es Domingo o Sábado
            res.status(400).json({
                msg: "Solo se pueden crear horarios de lunes a viernes."
            });
            return;
        }
        // --- FIN NUEVA VALIDACIÓN ---
        // Verificar si la licencia existe (búsqueda insensible a mayúsculas/minúsculas)
        const licencia = yield licencia_1.Licencia.findOne({
            where: connection_1.default.where(connection_1.default.fn('LOWER', connection_1.default.col('name')), name.toLowerCase())
        });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia '${name}' no existe. Por favor, créela primero antes de asignar horarios.`,
                type: 'warning'
            });
            return;
        }
        // Verificar si ya existe un horario con la misma fecha y hora
        const horarioExistente = yield horario_1.Horario.findOne({
            where: {
                fecha,
                hora,
                id_tipoLicencia: licencia.id,
                cupodisponible: true
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
        // Verificar si la licencia existe (búsqueda insensible a mayúsculas/minúsculas)
        const licencia = yield licencia_1.Licencia.findOne({
            where: connection_1.default.where(connection_1.default.fn('LOWER', connection_1.default.col('name')), name.toLowerCase())
        });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia '${name}' no existe. Por favor, créela primero antes de consultar horarios.`,
                type: 'warning'
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
        // Obtener la fecha actual sin la hora
        const ahora = new Date();
        const fechaActual = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        // Filtrar fechas futuras, incluyendo hoy
        const fechasFiltradas = fechas
            .map(f => f.fecha)
            .filter(fecha => {
            const fechaComparar = new Date(fecha);
            fechaComparar.setHours(0, 0, 0, 0);
            return fechaComparar >= fechaActual;
        });
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
        // Verificar que la fecha sea mañana o posterior
        // Parsear la fecha de entrada para que sea la medianoche local
        const partesFecha = fechaStr.split('-').map(Number);
        const fechaObj = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]); // Mes es 0-indexado
        fechaObj.setHours(0, 0, 0, 0); // Asegurarse de que es la medianoche local de ese día
        const ahora = new Date();
        const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
        manana.setHours(0, 0, 0, 0); // Ya es la medianoche local de mañana
        // Ahora, compara los valores numéricos de las fechas (milisegundos desde la época)
        if (fechaObj.getTime() < manana.getTime()) {
            res.status(400).json({
                msg: "Solo se pueden consultar horarios a partir de mañana"
            });
            return;
        }
        // Encontrar la licencia por nombre (búsqueda insensible a mayúsculas/minúsculas)
        const licencia = yield licencia_1.Licencia.findOne({
            where: connection_1.default.where(connection_1.default.fn('LOWER', connection_1.default.col('name')), name.toLowerCase())
        });
        if (!licencia) {
            res.status(404).json({
                msg: `La licencia '${name}' no existe. Por favor, créela primero antes de consultar horarios.`,
                type: 'warning'
            });
            return;
        }
        const horas = yield horario_1.Horario.findAll({
            where: {
                fecha: fechaStr,
                cupodisponible: true,
                id_tipoLicencia: licencia.id
            },
            attributes: ['hora'],
            order: [['hora', 'ASC']]
        });
        // Formatear las horas a HH:mm
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
const getAllHorarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const horarios = yield horario_1.Horario.findAll({
            include: [{
                    model: licencia_1.Licencia,
                    attributes: ['name'], // Incluir solo el nombre de la licencia
                    required: false // Cambiado a false para LEFT OUTER JOIN
                }],
            attributes: ['id', 'fecha', 'hora', 'cupodisponible'], // Seleccionar solo los campos relevantes
            order: [['fecha', 'ASC'], ['hora', 'ASC']],
            raw: true // Añadir raw: true para obtener objetos planos
        });
        // Mapear los resultados para incluir el nombre de la licencia directamente
        const formattedHorarios = horarios.map(horario => {
            return {
                id: horario.id,
                fecha: horario.fecha,
                hora: horario.hora.substring(0, 5),
                cupodisponible: horario.cupodisponible,
                licenciaName: horario['Licencium.name'] ? horario['Licencium.name'] : 'N/A'
            };
        });
        res.json(formattedHorarios);
    }
    catch (error) {
        console.error('Error al obtener todos los horarios:', error);
        res.status(500).json({
            msg: "Error al obtener todos los horarios",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.getAllHorarios = getAllHorarios;
const deleteHorario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const horario = yield horario_1.Horario.findByPk(id);
        if (!horario) {
            res.status(404).json({
                msg: `No existe un horario con el id ${id}`
            });
            return; // Terminar la ejecución de la función aquí
        }
        yield horario.destroy();
        res.json({
            msg: 'Horario eliminado con éxito!'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Upps hubo un error, comuníquese con soporte',
            error
        });
    }
});
exports.deleteHorario = deleteHorario;
