import { Router } from "express";
import { registerSolicitud, getSolicitudesByUser, getAllSolicitudes, deleteSolicitud } from "../controllers/solicitud";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/api/solicitud/register", authenticateToken, asyncHandler(registerSolicitud));
router.get("/api/solicitud/byUser", authenticateToken, asyncHandler(getSolicitudesByUser));
router.get("/api/solicitud/all", authenticateToken, asyncHandler(getAllSolicitudes));
router.delete("/api/solicitud/delete/:id", authenticateToken, asyncHandler(deleteSolicitud));

export default router