import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { can } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { activityMiddleware } from "../../middleware/activity.middleware";
import { auditMiddleware } from "../../middleware/audit.middleware";
import { createInvoice, getInvoice, listInvoices } from "./invoice.controller";
import { createInvoiceSchema, invoiceIdSchema, listInvoicesSchema } from "./billing.validation";

const router = Router();

router.get("/", can(PERMISSIONS.INVOICE_VIEW), validate(listInvoicesSchema), listInvoices);
router.get("/:id", can(PERMISSIONS.INVOICE_VIEW), validate(invoiceIdSchema), getInvoice);
router.post(
  "/",
  can(PERMISSIONS.INVOICE_CREATE),
  validate(createInvoiceSchema),
  activityMiddleware("create", "invoice"),
  auditMiddleware("create", "invoice"),
  createInvoice
);

export default router;
