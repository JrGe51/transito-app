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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../routes/user"));
const licencia_1 = __importDefault(require("../routes/licencia"));
const horario_1 = __importDefault(require("../routes/horario"));
const user_2 = require("./user");
const licencia_2 = require("./licencia");
const horario_2 = require("./horario");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3017';
        this.listen();
        this.midlewares();
        this.router();
        this.DBconnet();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`El servidor se esta ejecutando en el port ${this.port}`);
        });
    }
    router() {
        this.app.use(user_1.default);
        this.app.use(licencia_1.default);
        this.app.use(horario_1.default);
    }
    midlewares() {
        this.app.use(express_1.default.json());
    }
    DBconnet() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield user_2.User.sync();
                yield licencia_2.Licencia.sync();
                yield horario_2.Horario.sync();
                console.log("Se a creado la tabla de forma exitosa");
                console.log("Base de datos conectada correctamente");
            }
            catch (error) {
                console.log("Error de conexion", error);
            }
        });
    }
}
exports.default = Server;
