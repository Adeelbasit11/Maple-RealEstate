import { Router } from "express";
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    inviteUser,
} from "../controllers/usersController";
import { authenticate } from "../middleware/auth";
import authorize from "../middleware/roleMiddleware";
import { requireSubscription } from "../middleware/subscriptionMiddleware";

const router = Router();

// All routes are protected by authentication first
// Then by subscription requirement
// Then by role-based authorization

router.get("/", authenticate, requireSubscription, authorize(["Admin", "Editor", "Viewer"]), getAllUsers);

router.post("/", authenticate, requireSubscription, authorize(["Admin"]), createUser);
router.post("/invite", authenticate, requireSubscription, authorize(["Admin"]), inviteUser);

router.put("/:id", authenticate, requireSubscription, authorize(["Admin", "Editor"]), updateUser);

router.delete("/:id", authenticate, requireSubscription, authorize(["Admin"]), deleteUser);

export default router;
