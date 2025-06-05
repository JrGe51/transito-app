import { Router } from "express";
import { registerHorario, getFechasDisponibles, getHorasPorFecha } from "../controllers/horario";


const router = Router();

router.post("/api/horario/register", registerHorario);
router.get("/api/horario/fechas", getFechasDisponibles);
router.get("/api/horario/horas", getHorasPorFecha);

export default router;