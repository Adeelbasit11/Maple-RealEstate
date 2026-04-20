import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
    getRooms,
    getMessages,
    markRoomMessagesAsRead,
    getUnreadCounts,
} from "../controllers/chatController2";

const router = Router();

// Get all rooms
router.get("/rooms", getRooms);

// Get messages for a room
router.get("/rooms/:roomId/messages", getMessages);

// Mark room messages as read (protected)
router.post("/rooms/:roomId/mark-read", authenticate, markRoomMessagesAsRead);

// Get unread counts (protected)
router.get("/unread-counts", authenticate, getUnreadCounts);

export default router;
