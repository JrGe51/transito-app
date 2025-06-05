"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../controllers/admin");
const router = (0, express_1.Router)();
router.post("/api/admin/check-master", admin_1.checkMasterCredentials);
router.post("/api/admin/register", admin_1.registerAdmin);
router.post("/api/admin/login", admin_1.loginAdmin);
exports.default = router;
