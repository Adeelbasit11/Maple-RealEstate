export interface ChatUser {
    id: string;
    username: string;
    name?: string;
    avatar: string;
    isOnline?: boolean;
    lastSeen?: string;
}

export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
    type: "text" | "system";
    isEdited?: boolean;
    isRead?: boolean;
}

export interface ChatRoom {
    id: string;
    name: string;
    description: string;
    icon: string;
    createdAt: string;
    lastMessage?: ChatMessage;
    members: string[];
    unreadCount?: number;
}

export interface TypingUser {
    userId: string;
    username: string;
}

export interface DirectChat {
    id: string;
    user1Id: string;
    user2Id: string;
    user1: ChatUser;
    user2: ChatUser;
    messages: DirectMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface DirectMessage {
    id: string;
    chatId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
    sender?: ChatUser;
}

export interface FriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: "pending" | "accepted" | "rejected";
    sender: ChatUser;
    createdAt: string;
}
