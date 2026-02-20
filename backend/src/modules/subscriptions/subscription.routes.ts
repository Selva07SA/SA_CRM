import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { activityMiddleware } from "../../middleware/activity.middleware";
import { auditMiddleware } from "../../middleware/audit.middleware";
import { can } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  cancelSubscription,
  createSubscription,
  listSubscriptions,
  pauseSubscription,
  renewSubscription,
  resumeSubscription
} from "./subscription.controller";
import { createSubscriptionSchema, idSchema, listSubscriptionsSchema } from "./subscription.validation";

const router = Router();

router.get("/", can(PERMISSIONS.SUBSCRIPTION_CREATE), validate(listSubscriptionsSchema), listSubscriptions);
router.post(
  "/",
  can(PERMISSIONS.SUBSCRIPTION_CREATE),
  validate(createSubscriptionSchema),
  activityMiddleware("create", "subscription"),
  auditMiddleware("create", "subscription"),
  createSubscription
);
router.post(
  "/:id/cancel",
  can(PERMISSIONS.SUBSCRIPTION_CANCEL),
  validate(idSchema),
  activityMiddleware("cancel", "subscription"),
  auditMiddleware("cancel", "subscription"),
  cancelSubscription
);
router.post(
  "/:id/renew",
  can(PERMISSIONS.SUBSCRIPTION_RENEW),
  validate(idSchema),
  activityMiddleware("renew", "subscription"),
  auditMiddleware("renew", "subscription"),
  renewSubscription
);
router.post(
  "/:id/pause",
  can(PERMISSIONS.SUBSCRIPTION_CANCEL),
  validate(idSchema),
  activityMiddleware("pause", "subscription"),
  auditMiddleware("pause", "subscription"),
  pauseSubscription
);
router.post(
  "/:id/resume",
  can(PERMISSIONS.SUBSCRIPTION_RENEW),
  validate(idSchema),
  activityMiddleware("resume", "subscription"),
  auditMiddleware("resume", "subscription"),
  resumeSubscription
);

export default router;
