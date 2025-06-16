"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resetPassword_1 = require("../controllers/resetPassword");
const router = (0, express_1.Router)();
router.post('/request-code', resetPassword_1.requestResetCode);
router.post('/reset-password', resetPassword_1.resetPassword);
exports.default = router;
