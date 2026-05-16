import { Router } from "express";
import {
  createCheckinWindow,
  createCycle,
  deleteCheckinWindow,
  getCheckinWindows,
  getCycleById,
  getCycles,
  updateCheckinWindow,
  updateCycle,
} from "../controllers/adminCycle.controller.js";
import { authorizeRoles, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles("admin"));

router.route("/cycles").get(getCycles).post(createCycle);

router.route("/cycles/:cycleId").get(getCycleById).patch(updateCycle);

router.route("/cycles/:cycleId/windows").get(getCheckinWindows).post(createCheckinWindow);

router.route("/windows/:windowId").patch(updateCheckinWindow).delete(deleteCheckinWindow);

export default router;
