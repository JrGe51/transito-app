"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ msg: 'Token requerido' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY || 'TSE-Dylan-Hernandez', (err, user) => {
        if (err) {
            res.status(403).json({ msg: 'Token inválido' });
            return;
        }
        req.userId = user.id;
        next();
    });
};
exports.authenticateToken = authenticateToken;
