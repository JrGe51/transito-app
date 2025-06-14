import { Router } from "express";
import { login, register, updateUser, getAllUsers, deleteUser } from "../controllers/user";

const router: Router = Router();

router.post("/api/user/register", register)
router.post("/api/user/login", login)
router.put("/api/user/updateUser/:id", updateUser)
router.get("/api/user/all", getAllUsers)
router.delete("/api/user/delete/:id", deleteUser)

export default router