import { Router } from "express";
import { registerSolicitud } from "../controllers/solicitud";
import { asyncHandler } from "../utils/asyncHandler";


const router = Router();

router.post("/api/solicitud/register", asyncHandler(registerSolicitud));

export default router