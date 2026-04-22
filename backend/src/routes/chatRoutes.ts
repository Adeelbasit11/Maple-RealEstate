import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth";
import {
    getRooms,
    getMessages,
    markRoomMessagesAsRead,
    getUnreadCounts,
} from "../controllers/chatController2";

const router = Router();

// Voice upload storage
const voiceUploadDir = path.join(__dirname, "../../uploads/voice");
if (!fs.existsSync(voiceUploadDir)) {
    fs.mkdirSync(voiceUploadDir, { recursive: true });
}
const voiceStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, voiceUploadDir),
    filename: (_req, file, cb) => cb(null, `voice_${Date.now()}_${Math.random().toString(36).slice(2)}.webm`),
});
const voiceUpload = multer({
    storage: voiceStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav"];
        cb(null, allowed.includes(file.mimetype));
    },
});

// Get all rooms
router.get("/rooms", getRooms);

// Get messages for a room
router.get("/rooms/:roomId/messages", getMessages);

// Mark room messages as read (protected)
router.post("/rooms/:roomId/mark-read", authenticate, markRoomMessagesAsRead);

// Get unread counts (protected)
router.get("/unread-counts", authenticate, getUnreadCounts);

// Upload voice message
router.post("/voice-upload", authenticate, voiceUpload.single("audio"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No audio file uploaded" });
    }
    const audioUrl = `/uploads/voice/${req.file.filename}`;
    res.json({ success: true, audioUrl });
});

export default router;
