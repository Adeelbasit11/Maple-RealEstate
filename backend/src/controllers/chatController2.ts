import { Request, Response } from "express";
import {
    getAllRooms,
    getRoomMessagesWithReadStatus,
    getRoomMessages,
    markAllRoomMessagesAsRead,
    getUnreadCountsForAllRooms,
} from "../services/chatService";

// Get all rooms
export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await getAllRooms();
        return res.json({ success: true, data: rooms });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get messages for a room
export const getMessages = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId as string;
        const userId = req.user?.id;

        let messages;
        if (userId) {
            messages = await getRoomMessagesWithReadStatus(roomId, userId);
        } else {
            messages = await getRoomMessages(roomId);
        }

        return res.json({ success: true, data: messages });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Mark room messages as read
export const markRoomMessagesAsRead = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId as string;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        await markAllRoomMessagesAsRead(roomId, userId);
        return res.json({ success: true, message: "Messages marked as read" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get unread counts
export const getUnreadCounts = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const unreadCounts = await getUnreadCountsForAllRooms(userId);
        return res.json({ success: true, data: unreadCounts });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
