import { Router } from "express";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/me").get(getMyNotifications);
router.route("/read-all").patch(markAllNotificationsRead);
router.route("/:notificationId/read").patch(markNotificationRead);

export default router;
