import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { activityMiddleware } from "../../middleware/activity.middleware";
import { auditMiddleware } from "../../middleware/audit.middleware";
import { can } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  addClientNote,
  createClient,
  deleteClient,
  getClient,
  listClientNotes,
  listClients,
  listClientSubscriptions,
  updateClient
} from "./client.controller";
import { addClientNoteSchema, createClientSchema, idSchema, listClientsSchema, updateClientSchema } from "./client.validation";

const router = Router();

router.get("/", can(PERMISSIONS.CLIENT_VIEW), validate(listClientsSchema), listClients);
router.get("/:id", can(PERMISSIONS.CLIENT_VIEW), validate(idSchema), getClient);
router.post(
  "/",
  can(PERMISSIONS.CLIENT_CREATE),
  validate(createClientSchema),
  activityMiddleware("create", "client"),
  auditMiddleware("create", "client"),
  createClient
);
router.put(
  "/:id",
  can(PERMISSIONS.CLIENT_UPDATE),
  validate(updateClientSchema),
  activityMiddleware("update", "client"),
  auditMiddleware("update", "client"),
  updateClient
);
router.delete(
  "/:id",
  can(PERMISSIONS.CLIENT_UPDATE),
  validate(idSchema),
  activityMiddleware("delete", "client"),
  auditMiddleware("delete", "client"),
  deleteClient
);

router.get("/:id/notes", can(PERMISSIONS.CLIENT_VIEW), validate(idSchema), listClientNotes);
router.post(
  "/:id/notes",
  can(PERMISSIONS.CLIENT_UPDATE),
  validate(addClientNoteSchema),
  activityMiddleware("add_note", "client"),
  auditMiddleware("add_note", "client"),
  addClientNote
);
router.get("/:id/subscriptions", can(PERMISSIONS.CLIENT_VIEW), validate(idSchema), listClientSubscriptions);

export default router;
