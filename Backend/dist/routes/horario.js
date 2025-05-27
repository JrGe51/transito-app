"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const horario_1 = require("../controllers/horario");
const router = (0, express_1.Router)();
router.post("/api/horario/register", horario_1.registerHorario);
router.get("/api/horario/fechas", horario_1.getFechasDisponibles);
router.get("/api/horario/horas", horario_1.getHorasPorFecha);
exports.default = router;
