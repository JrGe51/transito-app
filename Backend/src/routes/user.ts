import { Router } from "express";
import { login, register, updateUser, getAllUsers, deleteUser, recuperarPassword, verificarCodigo, cambiarPassword, agregarLicencia, quitarLicencia } from "../controllers/user";

const router: Router = Router();

router.post("/api/user/register", register)
router.post("/api/user/login", login)
router.put("/api/user/updateUser/:id", updateUser)
router.get("/api/user/all", getAllUsers)
router.delete("/api/user/delete/:id", deleteUser)
router.post("/api/user/recuperar-password", recuperarPassword)
router.post("/api/user/verificar-codigo", verificarCodigo)
router.post("/api/user/cambiar-password", cambiarPassword)
router.post("/api/user/:id/agregar-licencia", agregarLicencia)
router.delete("/api/user/:id/quitar-licencia", quitarLicencia)

export default router