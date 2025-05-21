"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const solicitud_1 = require("../controllers/solicitud");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/api/solicitud/register", auth_1.authenticateToken, (0, asyncHandler_1.asyncHandler)(solicitud_1.registerSolicitud));
exports.default = router;
