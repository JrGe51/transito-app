"use strict";
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
exports.generarEmailUnico = exports.generarEmailAdmin = void 0;
const admin_1 = require("../models/admin");
const generarEmailAdmin = (nombre, apellido) => {
    const inicialesNombre = nombre.substring(0, 3).toLowerCase();
    const ultimasApellido = apellido.substring(apellido.length - 3).toLowerCase();
    return `${inicialesNombre}${ultimasApellido}@loespejoadmin.com`;
};
exports.generarEmailAdmin = generarEmailAdmin;
const generarEmailUnico = (nombre, apellido) => __awaiter(void 0, void 0, void 0, function* () {
    let emailBase = (0, exports.generarEmailAdmin)(nombre, apellido);
    let emailFinal = emailBase;
    let contador = 1;
    while (yield admin_1.Admin.findOne({ where: { email: emailFinal } })) {
        emailFinal = `${emailBase.split('@')[0]}${contador}@loespejoadmin.com`;
        contador++;
    }
    return emailFinal;
});
exports.generarEmailUnico = generarEmailUnico;
