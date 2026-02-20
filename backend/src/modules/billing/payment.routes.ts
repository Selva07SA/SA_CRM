import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { can } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { activityMiddleware } from "../../middleware/activity.middleware";
import { auditMiddleware } from "../../middleware/audit.middleware";
import { recordPayment } from "./payment.controller";
import { recordPaymentSchema } from "./billing.validation";

const router = Router();

router.post(
  "/",
  can(PERMISSIONS.PAYMENT_RECORD),
  validate(recordPaymentSchema),
  activityMiddleware("record", "payment"),
  auditMiddleware("record", "payment"),
  recordPayment
);

export default router;
