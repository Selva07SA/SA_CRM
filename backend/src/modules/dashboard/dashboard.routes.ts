import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { can } from "../../middleware/rbac.middleware";
import { getOverview, getRevenue, getSales } from "./dashboard.controller";

const router = Router();

router.get("/overview", can(PERMISSIONS.DASHBOARD_VIEW), getOverview);
router.get("/sales", can(PERMISSIONS.DASHBOARD_VIEW), getSales);
router.get("/revenue", can(PERMISSIONS.DASHBOARD_VIEW), getRevenue);

export default router;
