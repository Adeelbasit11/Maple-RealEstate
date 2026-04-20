import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import {
    updateUserStatus,
    getOnlineUsers,
    addMessage,
    getAllRooms,
    getRoomMessages,
    seedRooms,
    updateMessage,
    deleteMessage,
    getUnreadCountsForAllRooms,
} from "../services/chatService";
import jwt from "jsonwebtoken";
import db from "../db/knex";
import * as cookie from "cookie";

let io: Server;
const connectedUsers = new Map<string, { userId: string; username: string; socketId: string }>();

export function initializeSocket(httpServer: HttpServer): void {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    io = new Server(httpServer, {
        cors: {
            origin: frontendUrl,
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    // Seed default rooms
    seedRooms();

    // Socket.IO middleware for JWT authentication
    io.use(async (socket, next) => {
        try {
            const cookies = socket.handshake.headers.cookie;
            if (!cookies) return next(new Error("Authentication error: No cookies found"));

            const parsedCookies = cookie.parse(cookies);
            const token = parsedCookies.token;

            if (!token) return next(new Error("Authentication error: No token found"));

            const jwtSecret = process.env.JWT_SECRET as string;
            const decoded: any = jwt.verify(token, jwtSecret);
            const user = await db("auth_users")
                .where("id", decoded.id)
                .where("is_deleted", false)
                .select("id", "username", "name", "avatar")
                .first();

            if (!user) return next(new Error("Authentication error: User not found"));

            (socket as any).user = {
                id: user.id || user._id,
                username: user.username || user.name,
                avatar: user.avatar || "",
            };
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", async (socket: Socket) => {
        const user = (socket as any).user;
        if (!user) return;

        console.log(`Socket connected: ${socket.id} (${user.username})`);

        // Add user to connected users map
        connectedUsers.set(user.id, {
            userId: user.id,
            username: user.username,
            socketId: socket.id,
        });

        // Add user to personal room for targeted broadcasts
        socket.join(`user:${user.id}`);

        // Update user status to online
        await updateUserStatus(user.id, true);

        // Find general room for initial state and auto-join
        const rooms = await getAllRooms();
        const generalRoom = rooms.find((r: any) => r.name === "General");

        if (generalRoom) {
            socket.join(generalRoom.id);
        }

        // Broadcast updated online users
        io.emit("users:online", await getOnlineUsers());

        // Send initial data to the user
        socket.emit("init", {
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
            },
            rooms,
            messages: generalRoom ? await getRoomMessages(generalRoom.id) : [],
        });

        // Send initial unread counts
        const unreadCounts = await getUnreadCountsForAllRooms(user.id);
        socket.emit("chat:unread-counts-updated", unreadCounts);

        // ── User joins a specific room ──
        socket.on("chat:join-room", async (data: { roomId: string }, callback?: (res: unknown) => void) => {
            const { roomId } = data;

            // Leave all rooms except default socket room and personal room
            const currentRooms = Array.from(socket.rooms);
            for (const room of currentRooms) {
                if (room !== socket.id && !room.startsWith("user:") && !room.startsWith("chat:")) {
                    socket.leave(room);
                }
            }

            socket.join(roomId);

            if (callback) {
                callback({
                    success: true,
                    messages: await getRoomMessages(roomId),
                });
            }
        });

        // ── User sends a message ──
        socket.on("chat:message", async (data: { roomId: string; content: string }) => {
            const { roomId, content } = data;
            if (!content || content.trim().length === 0) return;

            const message = await addMessage(
                roomId,
                user.id,
                user.username,
                user.avatar,
                content.trim()
            );

            // Mark this message as read for the sender immediately
            await db("chat_read_messages")
                .insert({ message_id: message.id, user_id: user.id })
                .onConflict(["message_id", "user_id"])
                .ignore();

            io.to(roomId).emit("chat:message", message);

            // Broadcast updated unread counts to ALL CONNECTED USERS
            for (const connectedUser of connectedUsers.values()) {
                const counts = await getUnreadCountsForAllRooms(connectedUser.userId);
                io.to(`user:${connectedUser.userId}`).emit("chat:unread-counts-updated", counts);
            }

            // Then send rooms update
            io.emit("rooms:update", await getAllRooms());
        });

        // ── User edits a message ──
        socket.on("chat:edit-message", async (data: { messageId: string; content: string }) => {
            const { messageId, content } = data;
            if (!content || content.trim().length === 0) return;

            const updatedMessage = await updateMessage(messageId, content.trim());
            io.to(updatedMessage.roomId).emit("chat:message-edited", updatedMessage);
        });

        // ── User deletes a message ──
        socket.on("chat:delete-message", async (data: { messageId: string; roomId: string }) => {
            const { messageId, roomId } = data;
            await deleteMessage(messageId);
            io.to(roomId).emit("chat:message-deleted", { messageId, roomId });
        });

        // ── Typing indicators ──
        socket.on("chat:typing", (data: { roomId: string }) => {
            socket.to(data.roomId).emit("chat:typing", {
                userId: user.id,
                username: user.username,
            });
        });

        socket.on("chat:stop-typing", (data: { roomId: string }) => {
            socket.to(data.roomId).emit("chat:stop-typing", {
                userId: user.id,
            });
        });

        // ── Mark messages as read ──
        socket.on("chat:messages-read", async (data: { roomId: string }) => {
            const counts = await getUnreadCountsForAllRooms(user.id);
            io.to(`user:${user.id}`).emit("chat:unread-counts-updated", counts);
        });

        // ── Direct message events ──
        socket.on("direct:join-chat", async (data: { chatId: string }, callback?: (res: unknown) => void) => {
            const { chatId } = data;
            socket.join(`chat:${chatId}`);

            if (callback) {
                callback({
                    success: true,
                    message: "Joined direct chat room",
                });
            }
        });

        socket.on("direct:leave-chat", async (data: { chatId: string }) => {
            const { chatId } = data;
            socket.leave(`chat:${chatId}`);
        });

        socket.on("direct:message", async (data: { chatId: string; content: string }) => {
            const { chatId, content } = data;
            if (!content || content.trim().length === 0) return;

            try {
                // Verify user is part of this chat
                const chat = await db("chat_direct_chats").where("id", chatId).first();
                const u1Id = chat?.user1Id || chat?.user1_id;
                const u2Id = chat?.user2Id || chat?.user2_id;

                if (!chat || (u1Id !== user.id && u2Id !== user.id)) {
                    console.error(`Unauthorized direct message attempt by ${user.username}`);
                    return;
                }

                // Save message to database
                const [message] = await db("chat_direct_messages")
                    .insert({
                        chat_id: chatId,
                        sender_id: user.id,
                        sender_name: user.username,
                        sender_avatar: user.avatar,
                        content: content.trim(),
                    })
                    .returning("*");

                // Update DirectChat updatedAt timestamp
                await db("chat_direct_chats")
                    .where("id", chatId)
                    .update({ updated_at: new Date() });

                const formattedMessage = {
                    id: message.id || message._id,
                    chatId: message.chat_id,
                    senderId: message.sender_id,
                    senderName: message.sender_name,
                    senderAvatar: message.sender_avatar,
                    content: message.content,
                    timestamp: message.timestamp,
                };

                // Emit to both users in the chat
                io.to(`chat:${chatId}`).emit("direct:message", formattedMessage);

                // Notify both users about updated chat list
                io.to(`user:${u1Id}`).emit("direct:chats-updated");
                io.to(`user:${u2Id}`).emit("direct:chats-updated");
            } catch (error) {
                console.error(`Error sending direct message:`, error);
            }
        });

        socket.on("direct:typing", (data: { chatId: string }) => {
            socket.to(`chat:${data.chatId}`).emit("direct:typing", {
                userId: user.id,
                username: user.username,
            });
        });

        socket.on("direct:stop-typing", (data: { chatId: string }) => {
            socket.to(`chat:${data.chatId}`).emit("direct:stop-typing", {
                userId: user.id,
            });
        });

        socket.on("friend:request-sent", (data: { receiverId: string }) => {
            io.to(`user:${data.receiverId}`).emit("friend:new-request", {
                senderId: user.id,
                senderName: user.username,
                senderAvatar: user.avatar,
            });
        });

        socket.on("friend:request-accepted", (data: { senderId: string; chatId: string }) => {
            io.to(`user:${data.senderId}`).emit("friend:request-accepted-notification", {
                userId: user.id,
                username: user.username,
                avatar: user.avatar,
                chatId: data.chatId,
            });

            io.to(`user:${user.id}`).emit("direct:chats-updated");
            io.to(`user:${data.senderId}`).emit("direct:chats-updated");
        });

        // ── Disconnect ──
        socket.on("disconnect", async () => {
            console.log(`User disconnected: ${user.username}`);

            connectedUsers.delete(user.id);
            await updateUserStatus(user.id, false);

            io.emit("users:online", await getOnlineUsers());
            io.emit("rooms:update", await getAllRooms());
        });
    });

    console.log("Socket.IO initialized");
}

export function getIO(): Server {
    return io;
}
