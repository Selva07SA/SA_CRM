import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { tenantIsolationMiddleware } from "../../middleware/tenant.middleware";
import { suspendGuardMiddleware } from "../../middleware/suspendGuard.middleware";
import { changePassword, login, logout, me, refresh, register, updateMe } from "./auth.controller";
import { changePasswordSchema, loginSchema, refreshSchema, registerSchema, updateMeSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);

router.use(authMiddleware, tenantIsolationMiddleware, suspendGuardMiddleware);
router.post("/logout", logout);
router.get("/me", me);
router.put("/me", validate(updateMeSchema), updateMe);
router.post("/change-password", validate(changePasswordSchema), changePassword);

export default router;
