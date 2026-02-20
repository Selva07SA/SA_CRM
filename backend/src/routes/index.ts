import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import employeeRoutes from "../modules/employees/employee.routes";
import leadRoutes from "../modules/leads/lead.routes";
import clientRoutes from "../modules/clients/client.routes";
import planRoutes from "../modules/subscription-plans/plan.routes";
import subscriptionRoutes from "../modules/subscriptions/subscription.routes";
import invoiceRoutes from "../modules/billing/invoice.routes";
import paymentRoutes from "../modules/billing/payment.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import { authMiddleware } from "../middleware/auth.middleware";
import { tenantIsolationMiddleware } from "../middleware/tenant.middleware";
import { suspendGuardMiddleware } from "../middleware/suspendGuard.middleware";
import { requireSystemAdmin } from "../middleware/systemRole.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/subscription-plans", authMiddleware, requireSystemAdmin, planRoutes);

router.use(authMiddleware, tenantIsolationMiddleware, suspendGuardMiddleware);
router.use("/employees", employeeRoutes);
router.use("/leads", leadRoutes);
router.use("/clients", clientRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/payments", paymentRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
