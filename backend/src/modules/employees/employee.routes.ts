import { Router } from "express";
import { can, requireTenantAdmin } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { PERMISSIONS } from "../../constants/permissions";
import { activityMiddleware } from "../../middleware/activity.middleware";
import { auditMiddleware } from "../../middleware/audit.middleware";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployeeRoles,
  listEmployees,
  updateEmployee,
  updateEmployeeStatus
} from "./employee.controller";
import {
  createEmployeeSchema,
  idParamSchema,
  listEmployeesSchema,
  listRolesSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema
} from "./employee.validation";

const router = Router();

router.get("/", can(PERMISSIONS.EMPLOYEE_MANAGE), validate(listEmployeesSchema), listEmployees);
router.get("/roles", can(PERMISSIONS.EMPLOYEE_MANAGE), validate(listRolesSchema), listEmployeeRoles);
router.get("/:id", can(PERMISSIONS.EMPLOYEE_MANAGE), validate(idParamSchema), getEmployee);
router.post(
  "/",
  requireTenantAdmin,
  can(PERMISSIONS.EMPLOYEE_MANAGE),
  validate(createEmployeeSchema),
  activityMiddleware("create", "employee"),
  auditMiddleware("create", "employee"),
  createEmployee
);
router.put(
  "/:id",
  can(PERMISSIONS.EMPLOYEE_MANAGE),
  validate(updateEmployeeSchema),
  activityMiddleware("update", "employee"),
  auditMiddleware("update", "employee"),
  updateEmployee
);
router.patch(
  "/:id/status",
  can(PERMISSIONS.EMPLOYEE_MANAGE),
  validate(updateEmployeeStatusSchema),
  activityMiddleware("update_status", "employee"),
  auditMiddleware("update_status", "employee"),
  updateEmployeeStatus
);
router.delete(
  "/:id",
  can(PERMISSIONS.EMPLOYEE_MANAGE),
  validate(idParamSchema),
  activityMiddleware("delete", "employee"),
  auditMiddleware("delete", "employee"),
  deleteEmployee
);

export default router;
