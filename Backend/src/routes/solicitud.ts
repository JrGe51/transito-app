import { Router } from "express";
import { registerSolicitud } from "../controllers/solicitud";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticateToken } from "../middlewares/auth";


const router = Router();

router.post("/api/solicitud/register", authenticateToken, asyncHandler(registerSolicitud));

export default router