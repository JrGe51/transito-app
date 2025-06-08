"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarRut = void 0;
const axios_1 = __importStar(require("axios"));
const validarRut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { rut } = req.body;
        if (!rut) {
            return res.status(400).json({
                ok: false,
                msg: 'El RUT es requerido'
            });
        }
        // Validar formato del RUT
        if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(rut)) {
            return res.status(400).json({
                ok: false,
                msg: 'Formato de RUT inválido'
            });
        }
        try {
            // Llamada a la API del Registro Civil
            const response = yield axios_1.default.get(`${process.env.API_URL}/personas/${rut}`, {
                timeout: 5000,
                headers: {
                    'Authorization': `Bearer ${process.env.API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            // Verificar la respuesta de la API
            if (!response.data.ok) {
                return res.status(400).json({
                    ok: false,
                    msg: response.data.msg || 'Error al validar el RUT'
                });
            }
            // Calcular la edad basada en la fecha de nacimiento
            if (response.data.fechaNacimiento) {
                const fechaNacimiento = new Date(response.data.fechaNacimiento);
                const hoy = new Date();
                let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const mesActual = hoy.getMonth();
                const mesNacimiento = fechaNacimiento.getMonth();
                if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }
                if (edad < 18) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'No cumples con la edad mínima requerida',
                        edad
                    });
                }
                return res.json({
                    ok: true,
                    msg: 'RUT válido y cumple con la edad requerida',
                    edad
                });
            }
            return res.status(400).json({
                ok: false,
                msg: 'No se pudo obtener la fecha de nacimiento'
            });
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError) {
                if (error.code === 'ECONNABORTED') {
                    return res.status(504).json({
                        ok: false,
                        msg: 'Tiempo de espera agotado al validar el RUT'
                    });
                }
                if (error.response) {
                    // Manejar errores específicos de la API
                    switch (error.response.status) {
                        case 401:
                            return res.status(401).json({
                                ok: false,
                                msg: 'Error de autenticación con el servicio de validación'
                            });
                        case 404:
                            return res.status(404).json({
                                ok: false,
                                msg: 'RUT no encontrado en el Registro Civil'
                            });
                        default:
                            return res.status(error.response.status).json({
                                ok: false,
                                msg: ((_a = error.response.data) === null || _a === void 0 ? void 0 : _a.msg) || 'Error al validar el RUT'
                            });
                    }
                }
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Error al validar RUT:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al validar el RUT'
        });
    }
});
exports.validarRut = validarRut;
