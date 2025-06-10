import { Router } from "express";
import { registerLicencia, getAllLicencias, deleteLicencia } from "../controllers/licencia";
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post("/api/licencia/register", registerLicencia);
router.get("/api/licencia/all", authenticateToken, getAllLicencias);
router.delete("/api/licencia/:id", authenticateToken, deleteLicencia);

export default router;