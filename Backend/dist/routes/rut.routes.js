"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rut_controller_1 = require("../controllers/rut.controller");
const router = (0, express_1.Router)();
router.post('/validar', rut_controller_1.validarRut);
exports.default = router;
