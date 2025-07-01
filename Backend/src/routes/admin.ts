import { Router } from "express";
import { checkMasterCredentials, registerAdmin, loginAdmin, sendBulkEmail } from "../controllers/admin";

const router = Router();

router.post("/api/admin/check-master", checkMasterCredentials as any);
router.post("/api/admin/register", registerAdmin as any);
router.post("/api/admin/login", loginAdmin as any);
router.post("/api/admin/send-bulk-email", sendBulkEmail as any);

export default router 