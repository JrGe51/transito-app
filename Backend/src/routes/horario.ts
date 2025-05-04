import { Router } from "express";
import { registerHorario } from "../controllers/horario";


const router = Router();

router.post("/api/horario/register", registerHorario)

export default router