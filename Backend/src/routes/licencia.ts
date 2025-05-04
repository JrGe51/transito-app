import { Router } from "express";
import { registerLicencia } from "../controllers/licencia";


const router = Router();

router.post("/api/licencia/register", registerLicencia)

export default router