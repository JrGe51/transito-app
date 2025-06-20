import { Router } from "express";
import { registerHorario, getFechasDisponibles, getHorasPorFecha, liberarHorario, getAllHorarios, deleteHorario } from "../controllers/horario";
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post("/api/horario/register", registerHorario);
router.get("/api/horario/fechas", getFechasDisponibles);
router.get("/api/horario/horas", getHorasPorFecha);
router.put("/api/horario/liberar", authenticateToken, liberarHorario);
router.get("/api/horario/all", authenticateToken, getAllHorarios);
router.delete("/api/horario/:id", authenticateToken, deleteHorario);

export default router;