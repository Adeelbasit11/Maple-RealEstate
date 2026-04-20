import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
    getAllUsers,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getDirectChats,
    getDirectMessages,
    getOrCreateDirectChat,
} from "../controllers/directMessageController";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users
router.get("/users", getAllUsers);

// Friend requests
router.post("/requests/send", sendFriendRequest);
router.get("/requests", getFriendRequests);
router.post("/requests/accept", acceptFriendRequest);
router.post("/requests/reject", rejectFriendRequest);

// Direct chats
router.get("/chats", getDirectChats);
router.get("/chats/:chatId/messages", getDirectMessages);
router.post("/chats/get-or-create", getOrCreateDirectChat);

export default router;
