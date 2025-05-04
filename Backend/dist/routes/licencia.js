"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const licencia_1 = require("../controllers/licencia");
const router = (0, express_1.Router)();
router.post("/api/licencia/register", licencia_1.registerLicencia);
exports.default = router;
