import { Router } from "express";
import {
    getAllTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
} from "../controllers/teamController";
import { authenticate } from "../middleware/auth";
import authorize from "../middleware/roleMiddleware";
import { requireSubscription } from "../middleware/subscriptionMiddleware";

const router = Router();

// All team routes are protected (require login + active subscription)
// And restricted by role

router.get("/", authenticate, requireSubscription, authorize(["Admin", "Editor", "Viewer", "SuperAdmin"]), getAllTeamMembers);

router.post("/", authenticate, requireSubscription, authorize(["Admin", "SuperAdmin"]), createTeamMember);
router.put("/:id", authenticate, requireSubscription, authorize(["Admin", "Editor", "SuperAdmin"]), updateTeamMember);
router.delete("/:id", authenticate, requireSubscription, authorize(["Admin", "SuperAdmin"]), deleteTeamMember);

export default router;
