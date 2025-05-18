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
exports.registerLicencia = void 0;
const licencia_1 = require("../models/licencia");
const registerLicencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    licencia_1.Licencia.create({
        name: name,
        description: description,
    });
    res.json({
        msg: `Licencia ${name}  create succes..`,
    });
});
exports.registerLicencia = registerLicencia;
