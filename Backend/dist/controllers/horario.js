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
exports.registerHorario = void 0;
const horario_1 = require("../models/horario");
const registerHorario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fecha, horainicio, horafin, cuposdisponibles } = req.body;
    horario_1.Horario.create({
        fecha: fecha,
        horainicio: horainicio,
        horafin: horafin,
        cuposdisponibles: cuposdisponibles,
    });
    res.json({
        msg: `Fecha ${fecha}  create succes..`,
    });
});
exports.registerHorario = registerHorario;
