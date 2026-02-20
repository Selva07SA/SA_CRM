import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { createPlan, deletePlan, getPlan, listPlans, updatePlan } from "./plan.controller";
import { createPlanSchema, idSchema, listPlansSchema, updatePlanSchema } from "./plan.validation";

const router = Router();

router.get("/", validate(listPlansSchema), listPlans);
router.get("/:id", validate(idSchema), getPlan);
router.post("/", validate(createPlanSchema), createPlan);
router.put("/:id", validate(updatePlanSchema), updatePlan);
router.delete("/:id", validate(idSchema), deletePlan);

export default router;
