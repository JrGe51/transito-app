"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarRutMiddleware = exports.validarRut = exports.calcularDigitoVerificador = exports.limpiarRut = exports.validarFormatoRut = void 0;
// Función para validar el formato del RUT
const validarFormatoRut = (rut) => {
    // Validar formato básico: números-puntos-números-puntos-números-guión-dígito
    const formatoRut = /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$/;
    return formatoRut.test(rut);
};
exports.validarFormatoRut = validarFormatoRut;
// Función para limpiar el RUT (quitar puntos y guión)
const limpiarRut = (rut) => {
    return rut.replace(/[.-]/g, '');
};
exports.limpiarRut = limpiarRut;
// Función para calcular el dígito verificador
const calcularDigitoVerificador = (rut) => {
    // Eliminar el dígito verificador y el guión si existen
    const rutLimpio = rut.split('-')[0].replace(/\./g, '');
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    // Para cada dígito del RUT
    for (let i = rutLimpio.length - 1; i >= 0; i--) {
        suma += parseInt(rutLimpio[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    // Calcular dígito verificador
    const dv = 11 - (suma % 11);
    // Convertir a string según el resultado
    if (dv === 11)
        return '0';
    if (dv === 10)
        return 'K';
    return dv.toString();
};
exports.calcularDigitoVerificador = calcularDigitoVerificador;
// Función para validar el RUT completo
const validarRut = (rut) => {
    // Validar que no esté vacío
    if (!rut || rut.trim() === '') {
        return {
            esValido: false,
            mensaje: 'El RUT es obligatorio'
        };
    }
    // Validar formato
    if (!(0, exports.validarFormatoRut)(rut)) {
        return {
            esValido: false,
            mensaje: 'El formato del RUT no es válido. Debe ser como: 12.345.678-9'
        };
    }
    // Extraer partes del RUT
    const partes = rut.split('-');
    const rutLimpio = partes[0].replace(/\./g, '');
    const dvIngresado = partes[1].toUpperCase();
    // Validar longitud del RUT
    if (rutLimpio.length < 7 || rutLimpio.length > 8) {
        return {
            esValido: false,
            mensaje: 'El RUT debe tener entre 7 y 8 dígitos antes del guión'
        };
    }
    // Calcular dígito verificador
    const dvCalculado = (0, exports.calcularDigitoVerificador)(rutLimpio);
    // Comparar dígitos verificadores
    if (dvIngresado !== dvCalculado) {
        return {
            esValido: false,
            mensaje: `El dígito verificador es incorrecto. Debería ser: ${dvCalculado}`
        };
    }
    return {
        esValido: true,
        mensaje: 'RUT válido'
    };
};
exports.validarRut = validarRut;
// Middleware para validar RUT en las rutas
const validarRutMiddleware = (req, res, next) => {
    const { rut } = req.body;
    if (!rut) {
        return res.status(400).json({
            msg: 'El RUT es obligatorio'
        });
    }
    const validacion = (0, exports.validarRut)(rut);
    if (!validacion.esValido) {
        return res.status(400).json({
            msg: validacion.mensaje
        });
    }
    next();
};
exports.validarRutMiddleware = validarRutMiddleware;
