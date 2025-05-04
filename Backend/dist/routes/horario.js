"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const horario_1 = require("../controllers/horario");
const router = (0, express_1.Router)();
router.post("/api/horario/register", horario_1.registerHorario);
exports.default = router;
