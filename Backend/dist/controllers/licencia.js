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
exports.deleteLicencia = exports.getAllLicencias = exports.registerLicencia = void 0;
const licencia_1 = require("../models/licencia");
const registerLicencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        // Validar campos requeridos
        if (!name || !description) {
            res.status(400).json({ msg: 'Todos los campos son obligatorios (name, description).' });
            return;
        }
        // Verificar duplicados
        const existe = yield licencia_1.Licencia.findOne({ where: { name } });
        if (existe) {
            res.status(409).json({ msg: `Ya existe una licencia con el nombre '${name}'.` });
            return;
        }
        yield licencia_1.Licencia.create({ name, description });
        res.json({ msg: `Licencia ${name} creada exitosamente.` });
    }
    catch (error) {
        res.status(500).json({ msg: 'Error al crear la licencia', error });
    }
});
exports.registerLicencia = registerLicencia;
const getAllLicencias = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const licencias = yield licencia_1.Licencia.findAll();
        res.json(licencias);
    }
    catch (error) {
        res.status(500).json({ msg: 'Error al obtener licencias', error });
    }
});
exports.getAllLicencias = getAllLicencias;
const deleteLicencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const licencia = yield licencia_1.Licencia.findByPk(id);
        if (!licencia) {
            res.status(404).json({ msg: `No existe una licencia con el id ${id}` });
            return;
        }
        yield licencia.destroy();
        res.json({ msg: 'Licencia eliminada con éxito!' });
    }
    catch (error) {
        res.status(500).json({ msg: 'Error al eliminar licencia', error });
    }
});
exports.deleteLicencia = deleteLicencia;
