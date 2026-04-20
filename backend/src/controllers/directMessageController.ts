import { Request, Response } from "express";
import db from "../db/knex";

// Get all users (excluding current user)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const users = await db("auth_users")
            .where("is_deleted", false)
            .whereNot("id", userId)
            .select("id", "username", "name", "avatar", "is_online", "last_seen");

        return res.json({ success: true, data: users });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Send friend request
export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const senderId = req.user?.id;
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
        }

        // Check if request already exists
        const existing = await db("chat_friend_requests")
            .where(function () {
                this.where({ sender_id: senderId, receiver_id: receiverId });
            })
            .orWhere(function () {
                this.where({ sender_id: receiverId, receiver_id: senderId });
            })
            .first();

        if (existing) {
            return res.status(400).json({ success: false, message: "Friend request already exists" });
        }

        // Check if direct chat already exists
        const existingChat = await db("chat_direct_chats")
            .where(function () {
                this.where({ user1_id: senderId, user2_id: receiverId });
            })
            .orWhere(function () {
                this.where({ user1_id: receiverId, user2_id: senderId });
            })
            .first();

        if (existingChat) {
            return res.status(400).json({ success: false, message: "Chat already exists" });
        }

        const [request] = await db("chat_friend_requests")
            .insert({ sender_id: senderId, receiver_id: receiverId })
            .returning("*");

        return res.status(201).json({ success: true, data: request });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get friend requests for current user
export const getFriendRequests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const requests = await db("chat_friend_requests")
            .where("receiver_id", userId)
            .where("status", "pending")
            .select("*");

        // Attach sender info
        const result = [];
        for (const request of requests) {
            const reqId = request.id || request._id;
            const sId = request.senderId || request.sender_id;
            const sender = await db("auth_users")
                .where("id", sId)
                .select("id", "username", "name", "avatar", "is_online")
                .first();

            result.push({
                id: reqId,
                senderId: sId,
                receiverId: request.receiverId || request.receiver_id,
                status: request.status,
                sender: sender,
                createdAt: request.createdAt || request.created_at,
            });
        }

        return res.json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Accept friend request
export const acceptFriendRequest = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { requestId } = req.body;

        const request = await db("chat_friend_requests").where("id", requestId).first();
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const receiverId = request.receiverId || request.receiver_id;
        if (receiverId !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Update request status
        await db("chat_friend_requests").where("id", requestId).update({ status: "accepted" });

        const senderId = request.senderId || request.sender_id;

        // Create direct chat
        const [chat] = await db("chat_direct_chats")
            .insert({ user1_id: senderId, user2_id: userId })
            .returning("*");

        return res.json({ success: true, data: chat });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Reject friend request
export const rejectFriendRequest = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { requestId } = req.body;

        const request = await db("chat_friend_requests").where("id", requestId).first();
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const receiverId = request.receiverId || request.receiver_id;
        if (receiverId !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await db("chat_friend_requests").where("id", requestId).update({ status: "rejected" });
        return res.json({ success: true, message: "Request rejected" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get direct chats for current user
export const getDirectChats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const chats = await db("chat_direct_chats")
            .where("user1_id", userId)
            .orWhere("user2_id", userId)
            .orderBy("updated_at", "desc");

        const result = [];
        for (const chat of chats) {
            const chatId = chat.id || chat._id;
            const u1Id = chat.user1Id || chat.user1_id;
            const u2Id = chat.user2Id || chat.user2_id;

            const user1 = await db("auth_users")
                .where("id", u1Id)
                .select("id", "username", "name", "avatar", "is_online", "last_seen")
                .first();

            const user2 = await db("auth_users")
                .where("id", u2Id)
                .select("id", "username", "name", "avatar", "is_online", "last_seen")
                .first();

            // Get last few messages
            const messages = await db("chat_direct_messages")
                .where("chat_id", chatId)
                .orderBy("created_at", "desc")
                .limit(1);

            result.push({
                id: chatId,
                user1Id: u1Id,
                user2Id: u2Id,
                user1,
                user2,
                messages: messages.reverse().map((m: any) => ({
                    id: m.id || m._id,
                    chatId: m.chatId || m.chat_id,
                    senderId: m.senderId || m.sender_id,
                    senderName: m.senderName || m.sender_name,
                    senderAvatar: m.senderAvatar || m.sender_avatar,
                    content: m.content,
                    timestamp: m.timestamp,
                })),
                createdAt: chat.createdAt || chat.created_at,
                updatedAt: chat.updatedAt || chat.updated_at,
            });
        }

        return res.json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get messages for a direct chat
export const getDirectMessages = async (req: Request, res: Response) => {
    try {
        const chatId = req.params.chatId as string;

        const messages = await db("chat_direct_messages")
            .where("chat_id", chatId)
            .orderBy("created_at", "asc")
            .limit(200);

        const result = messages.map((m: any) => ({
            id: m.id || m._id,
            chatId: m.chatId || m.chat_id,
            senderId: m.senderId || m.sender_id,
            senderName: m.senderName || m.sender_name,
            senderAvatar: m.senderAvatar || m.sender_avatar,
            content: m.content,
            timestamp: m.timestamp,
        }));

        return res.json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get or create direct chat
export const getOrCreateDirectChat = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { otherUserId } = req.body;

        // Check existing
        let chat = await db("chat_direct_chats")
            .where(function () {
                this.where({ user1_id: userId, user2_id: otherUserId });
            })
            .orWhere(function () {
                this.where({ user1_id: otherUserId, user2_id: userId });
            })
            .first();

        if (!chat) {
            const [newChat] = await db("chat_direct_chats")
                .insert({ user1_id: userId, user2_id: otherUserId })
                .returning("*");
            chat = newChat;
        }

        const chatId = chat.id || chat._id;
        const u1Id = chat.user1Id || chat.user1_id;
        const u2Id = chat.user2Id || chat.user2_id;

        const user1 = await db("auth_users")
            .where("id", u1Id)
            .select("id", "username", "name", "avatar", "is_online", "last_seen")
            .first();

        const user2 = await db("auth_users")
            .where("id", u2Id)
            .select("id", "username", "name", "avatar", "is_online", "last_seen")
            .first();

        return res.json({
            success: true,
            data: {
                id: chatId,
                user1Id: u1Id,
                user2Id: u2Id,
                user1,
                user2,
                messages: [],
                createdAt: chat.createdAt || chat.created_at,
                updatedAt: chat.updatedAt || chat.updated_at,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
