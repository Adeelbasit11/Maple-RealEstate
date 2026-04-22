import db from "../db/knex";

// ── Seed Default Rooms ──
export const seedRooms = async () => {
    const defaultRooms = [
        { name: "General", description: "General discussion for everyone", icon: "💬" },
        { name: "Random", description: "Random fun conversations", icon: "🎲" },
    ];

    for (const r of defaultRooms) {
        const roomExists = await db("chat_rooms").where("name", r.name).first();
        if (!roomExists) {
            await db("chat_rooms").insert({
                name: r.name,
                description: r.description,
                icon: r.icon,
            });
        }
    }
};

// ── User Status ──
export async function updateUserStatus(userId: string, isOnline: boolean) {
    return await db("auth_users")
        .where("id", userId)
        .update({ is_online: isOnline, last_seen: new Date() });
}

export async function getUserById(userId: string) {
    return await db("auth_users")
        .where("id", userId)
        .select("id", "username", "name", "avatar", "is_online", "last_seen")
        .first();
}

export async function getOnlineUsers() {
    return await db("auth_users")
        .where("is_online", true)
        .where("is_deleted", false)
        .select("id", "username", "name", "avatar", "is_online", "last_seen");
}

// ── Room Functions ──
export async function getAllRooms() {
    const rooms = await db("chat_rooms").select("*");
    const result = [];

    for (const room of rooms) {
        const lastMsg = await db("chat_messages")
            .where("room_id", room.id || room._id)
            .orderBy("created_at", "desc")
            .first();

        const members = await db("chat_room_members")
            .where("room_id", room.id || room._id)
            .select("user_id");

        result.push({
            id: room.id || room._id,
            name: room.name,
            description: room.description,
            icon: room.icon,
            createdAt: room.createdAt || room.created_at,
            lastMessage: lastMsg
                ? {
                      id: lastMsg.id || lastMsg._id,
                      roomId: lastMsg.roomId || lastMsg.room_id,
                      senderId: lastMsg.senderId || lastMsg.sender_id || "system",
                      senderName: lastMsg.senderName || lastMsg.sender_name,
                      senderAvatar: lastMsg.senderAvatar || lastMsg.sender_avatar,
                      content: lastMsg.content,
                      timestamp: lastMsg.timestamp,
                      type: lastMsg.type as "text" | "system",
                  }
                : undefined,
            members: members.map((m: any) => m.userId || m.user_id),
        });
    }
    return result;
}

export async function getRoomById(roomId: string) {
    return await db("chat_rooms").where("id", roomId).first();
}

// ── Message Functions ──
export async function addMessage(
    roomId: string,
    senderId: string | null,
    senderName: string,
    senderAvatar: string,
    content: string,
    type: "text" | "system" | "voice" = "text",
    audioUrl?: string,
    audioDuration?: number
) {
    const insertData: any = {
        room_id: roomId,
        sender_id: type === "system" ? null : senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        content,
        type,
    };
    if (audioUrl) insertData.audio_url = audioUrl;
    if (audioDuration !== undefined) insertData.audio_duration = audioDuration;

    const [message] = await db("chat_messages")
        .insert(insertData)
        .returning("*");

    return {
        id: message.id || message._id,
        roomId: message.room_id,
        senderId: message.sender_id || "system",
        senderName: message.sender_name,
        senderAvatar: message.sender_avatar,
        content: message.content,
        timestamp: message.timestamp,
        type: message.type as "text" | "system" | "voice",
        isEdited: message.is_edited,
        audioUrl: message.audio_url || undefined,
        audioDuration: message.audio_duration || undefined,
    };
}

export async function updateMessage(messageId: string, content: string) {
    const [message] = await db("chat_messages")
        .where("id", messageId)
        .update({ content, is_edited: true })
        .returning("*");

    return {
        id: message.id || message._id,
        roomId: message.room_id,
        senderId: message.sender_id || "system",
        senderName: message.sender_name,
        senderAvatar: message.sender_avatar,
        content: message.content,
        timestamp: message.timestamp,
        type: message.type as "text" | "system",
        isEdited: message.is_edited,
    };
}

export async function deleteMessage(messageId: string) {
    return await db("chat_messages").where("id", messageId).del();
}

export async function getRoomMessages(roomId: string) {
    const messages = await db("chat_messages")
        .where("room_id", roomId)
        .orderBy("created_at", "asc")
        .limit(200);

    return messages.map((m: any) => ({
        id: m.id || m._id,
        roomId: m.roomId || m.room_id,
        senderId: m.senderId || m.sender_id || "system",
        senderName: m.senderName || m.sender_name,
        senderAvatar: m.senderAvatar || m.sender_avatar,
        content: m.content,
        timestamp: m.timestamp,
        type: m.type as "text" | "system" | "voice",
        isEdited: m.isEdited !== undefined ? m.isEdited : m.is_edited,
        audioUrl: m.audio_url || undefined,
        audioDuration: m.audio_duration || undefined,
    }));
}

// ── Unread Message Functions ──
export async function markMessagesAsRead(messageIds: string[], userId: string) {
    try {
        for (const messageId of messageIds) {
            await db("chat_read_messages")
                .insert({ message_id: messageId, user_id: userId })
                .onConflict(["message_id", "user_id"])
                .ignore();
        }
    } catch (error) {
        console.error("Error marking messages as read:", error);
        throw error;
    }
}

export async function markAllRoomMessagesAsRead(roomId: string, userId: string) {
    try {
        const messages = await db("chat_messages")
            .where("room_id", roomId)
            .select("id");

        const messageIds = messages.map((m: any) => m.id || m._id);
        if (messageIds.length === 0) return;

        for (const messageId of messageIds) {
            await db("chat_read_messages")
                .insert({ message_id: messageId, user_id: userId })
                .onConflict(["message_id", "user_id"])
                .ignore();
        }
    } catch (error) {
        console.error("Error marking room messages as read:", error);
        throw error;
    }
}

export async function getUnreadCountForRoom(roomId: string, userId: string) {
    try {
        const totalMessages = await db("chat_messages")
            .where("room_id", roomId)
            .where("type", "text")
            .count("id as count")
            .first();

        const readMessagesCount = await db("chat_messages")
            .where("chat_messages.room_id", roomId)
            .where("chat_messages.type", "text")
            .whereExists(function () {
                this.select("*")
                    .from("chat_read_messages")
                    .whereRaw("chat_read_messages.message_id = chat_messages.id")
                    .where("chat_read_messages.user_id", userId);
            })
            .count("chat_messages.id as count")
            .first();

        const total = parseInt(String(totalMessages?.count || 0));
        const read = parseInt(String(readMessagesCount?.count || 0));
        return total - read;
    } catch (error) {
        console.error("Error getting unread count:", error);
        return 0;
    }
}

export async function getUnreadCountsForAllRooms(userId: string) {
    try {
        const rooms = await db("chat_rooms").select("id");
        const unreadCounts: Record<string, number> = {};

        for (const room of rooms) {
            const roomId = room.id || room._id;
            unreadCounts[roomId] = await getUnreadCountForRoom(roomId, userId);
        }

        return unreadCounts;
    } catch (error) {
        console.error("Error getting unread counts for all rooms:", error);
        return {};
    }
}

export async function getRoomMessagesWithReadStatus(roomId: string, userId: string) {
    try {
        const messages = await db("chat_messages")
            .where("room_id", roomId)
            .orderBy("created_at", "asc")
            .limit(200);

        const result = [];
        for (const m of messages) {
            const msgId = m.id || m._id;
            const readRecord = await db("chat_read_messages")
                .where("message_id", msgId)
                .where("user_id", userId)
                .first();

            result.push({
                id: msgId,
                roomId: m.roomId || m.room_id,
                senderId: m.senderId || m.sender_id || "system",
                senderName: m.senderName || m.sender_name,
                senderAvatar: m.senderAvatar || m.sender_avatar,
                content: m.content,
                timestamp: m.timestamp,
                type: m.type as "text" | "system",
                isEdited: m.isEdited !== undefined ? m.isEdited : m.is_edited,
                isRead: !!readRecord,
            });
        }

        return result;
    } catch (error) {
        console.error("Error getting room messages with read status:", error);
        throw error;
    }
}
