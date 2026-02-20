import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { can } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { activityMiddleware } from "../../middleware/activity.middleware";
import { auditMiddleware } from "../../middleware/audit.middleware";
import {
  addLeadNote,
  assignLead,
  convertLead,
  createLead,
  deleteLead,
  getLead,
  listLeadNotes,
  listLeads,
  patchLeadStatus,
  updateLead
} from "./lead.controller";
import {
  addLeadNoteSchema,
  assignLeadSchema,
  createLeadSchema,
  idOnlySchema,
  listLeadsSchema,
  updateLeadSchema,
  updateLeadStatusSchema
} from "./lead.validation";

const router = Router();

router.get("/", can(PERMISSIONS.LEAD_VIEW), validate(listLeadsSchema), listLeads);
router.get("/:id", can(PERMISSIONS.LEAD_VIEW), validate(idOnlySchema), getLead);
router.post(
  "/",
  can(PERMISSIONS.LEAD_CREATE),
  validate(createLeadSchema),
  activityMiddleware("create", "lead"),
  auditMiddleware("create", "lead"),
  createLead
);
router.put(
  "/:id",
  can(PERMISSIONS.LEAD_CREATE),
  validate(updateLeadSchema),
  activityMiddleware("update", "lead"),
  auditMiddleware("update", "lead"),
  updateLead
);
router.patch(
  "/:id/status",
  can(PERMISSIONS.LEAD_ASSIGN),
  validate(updateLeadStatusSchema),
  activityMiddleware("status", "lead"),
  auditMiddleware("status", "lead"),
  patchLeadStatus
);
router.post(
  "/:id/assign",
  can(PERMISSIONS.LEAD_ASSIGN),
  validate(assignLeadSchema),
  activityMiddleware("assign", "lead"),
  auditMiddleware("assign", "lead"),
  assignLead
);
router.post(
  "/:id/convert",
  can(PERMISSIONS.LEAD_CONVERT),
  validate(idOnlySchema),
  activityMiddleware("convert", "lead"),
  auditMiddleware("convert", "lead"),
  convertLead
);
router.delete(
  "/:id",
  can(PERMISSIONS.LEAD_CREATE),
  validate(idOnlySchema),
  activityMiddleware("delete", "lead"),
  auditMiddleware("delete", "lead"),
  deleteLead
);

router.get("/:id/notes", can(PERMISSIONS.LEAD_VIEW), validate(idOnlySchema), listLeadNotes);
router.post(
  "/:id/notes",
  can(PERMISSIONS.LEAD_VIEW),
  validate(addLeadNoteSchema),
  activityMiddleware("add_note", "lead"),
  auditMiddleware("add_note", "lead"),
  addLeadNote
);

export default router;
