import { Router } from "express";
import { registerSolicitud, getSolicitudesByUser, getAllSolicitudes, deleteSolicitud, getSolicitudById, getSolicitudesByUserId, rescheduleSolicitud } from "../controllers/solicitud";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/api/solicitud/register", authenticateToken, asyncHandler(registerSolicitud));
router.get("/api/solicitud/byUser", authenticateToken, asyncHandler(getSolicitudesByUser));
router.get("/api/solicitud/all", authenticateToken, asyncHandler(getAllSolicitudes));
router.delete("/api/solicitud/delete/:id", authenticateToken, asyncHandler(deleteSolicitud));
router.get("/api/solicitud/:id", authenticateToken, asyncHandler(getSolicitudById));
router.get("/api/solicitud/byUserId/:id", asyncHandler(getSolicitudesByUserId));
router.put("/api/solicitud/reschedule/:id", authenticateToken, asyncHandler(rescheduleSolicitud));

export default router