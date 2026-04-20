"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
    ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import {
    ChatUser,
    ChatMessage,
    ChatRoom,
    TypingUser,
    DirectChat,
    DirectMessage,
    FriendRequest,
} from "../types/chat";

interface ChatContextType {
    socket: Socket | null;
    isConnected: boolean;
    currentUser: ChatUser | null;
    onlineUsers: ChatUser[];
    rooms: ChatRoom[];
    currentRoom: ChatRoom | null;
    messages: ChatMessage[];
    typingUsers: TypingUser[];
    unreadCounts: Record<string, number>;

    // Direct messaging
    allUsers: ChatUser[];
    directChats: DirectChat[];
    currentDirectChat: DirectChat | null;
    directMessages: DirectMessage[];
    directTypingUsers: TypingUser[];
    friendRequests: FriendRequest[];

    joinRoom: (roomId: string) => void;
    sendMessage: (content: string) => void;
    editMessage: (messageId: string, content: string) => void;
    deleteMessage: (messageId: string) => void;
    startTyping: () => void;
    stopTyping: () => void;
    markRoomMessagesAsRead: (roomId: string) => Promise<void>;

    // Direct messaging functions
    fetchAllUsers: () => Promise<void>;
    sendFriendRequest: (receiverId: string) => Promise<void>;
    fetchFriendRequests: () => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    rejectFriendRequest: (requestId: string) => Promise<void>;
    fetchDirectChats: () => Promise<void>;
    fetchDirectMessages: (chatId: string) => Promise<void>;
    joinDirectChat: (chatId: string) => void;
    sendDirectMessage: (content: string) => void;
    startDirectTyping: () => void;
    stopDirectTyping: () => void;
    getOrCreateDirectChat: (otherUserId: string) => Promise<DirectChat | null>;
}

const ChatContext = createContext<ChatContextType>({
    socket: null,
    isConnected: false,
    currentUser: null,
    onlineUsers: [],
    rooms: [],
    currentRoom: null,
    messages: [],
    typingUsers: [],
    unreadCounts: {},
    allUsers: [],
    directChats: [],
    currentDirectChat: null,
    directMessages: [],
    directTypingUsers: [],
    friendRequests: [],
    joinRoom: () => {},
    sendMessage: () => {},
    editMessage: () => {},
    deleteMessage: () => {},
    startTyping: () => {},
    stopTyping: () => {},
    markRoomMessagesAsRead: async () => {},
    fetchAllUsers: async () => {},
    sendFriendRequest: async () => {},
    fetchFriendRequests: async () => {},
    acceptFriendRequest: async () => {},
    rejectFriendRequest: async () => {},
    fetchDirectChats: async () => {},
    fetchDirectMessages: async () => {},
    joinDirectChat: () => {},
    sendDirectMessage: () => {},
    startDirectTyping: () => {},
    stopDirectTyping: () => {},
    getOrCreateDirectChat: async () => null,
});

export function ChatProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    // Direct messaging states
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [directChats, setDirectChats] = useState<DirectChat[]>([]);
    const [currentDirectChat, setCurrentDirectChat] = useState<DirectChat | null>(null);
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [directTypingUsers, setDirectTypingUsers] = useState<TypingUser[]>([]);

    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const directTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const backendUrl = "http://localhost:5000";

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(backendUrl, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        newSocket.on("connect", () => {
            console.log("Connected to chat server");
            setIsConnected(true);
        });

        newSocket.on("connect_error", (error) => {
            console.log("Chat connection error:", error.message);
            setIsConnected(false);
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
        });

        // Listen for online users updates
        newSocket.on("users:online", (users: ChatUser[]) => {
            setOnlineUsers(users);
        });

        // Listen for incoming messages
        newSocket.on("chat:message", (message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
        });

        // Listen for message edits
        newSocket.on("chat:message-edited", (updatedMessage: ChatMessage) => {
            setMessages((prev) =>
                prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
            );
        });

        // Listen for message deletions
        newSocket.on("chat:message-deleted", (data: { messageId: string }) => {
            setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
        });

        // Listen for room updates
        newSocket.on("rooms:update", (updatedRooms: ChatRoom[]) => {
            setRooms((prevRooms) => {
                return updatedRooms.map((updatedRoom) => {
                    const prevRoom = prevRooms.find((r) => r.id === updatedRoom.id);
                    return {
                        ...updatedRoom,
                        unreadCount: prevRoom?.unreadCount !== undefined ? prevRoom.unreadCount : (updatedRoom.unreadCount || 0),
                    };
                });
            });
        });

        // Listen for typing events
        newSocket.on("chat:typing", (data: TypingUser) => {
            setTypingUsers((prev) => {
                if (prev.find((u) => u.userId === data.userId)) return prev;
                return [...prev, data];
            });
        });

        newSocket.on("chat:stop-typing", (data: { userId: string }) => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        });

        // Listen for initial data
        newSocket.on("init", (data: { user: ChatUser; rooms: ChatRoom[]; messages: ChatMessage[] }) => {
            setCurrentUser(data.user);
            setRooms(data.rooms);
            setMessages(data.messages);
            const generalRoom = data.rooms.find(r => r.name === "General");
            if (generalRoom) setCurrentRoom(generalRoom);

            // Fetch unread counts after initialization
            fetchUnreadCounts();
        });

        // Listen for unread count updates
        newSocket.on("chat:unread-counts-updated", (counts: Record<string, number>) => {
            setUnreadCounts(counts);
            setRooms((prevRooms) => {
                return prevRooms.map((room) => ({
                    ...room,
                    unreadCount: counts[room.id] || 0,
                }));
            });
        });

        // Direct messaging event listeners
        newSocket.on("direct:message", (message: DirectMessage) => {
            setDirectMessages((prev) => [...prev, message]);
        });

        newSocket.on("direct:typing", (data: TypingUser) => {
            setDirectTypingUsers((prev) => {
                if (prev.find((u) => u.userId === data.userId)) return prev;
                return [...prev, data];
            });
        });

        newSocket.on("direct:stop-typing", (data: { userId: string }) => {
            setDirectTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        });

        newSocket.on("direct:chats-updated", () => {
            fetchDirectChats();
        });

        newSocket.on("friend:new-request", () => {
            fetchFriendRequests();
        });

        newSocket.on("friend:request-accepted-notification", () => {
            fetchDirectChats();
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Heartbeat
        const heartbeatInterval = setInterval(async () => {
            try {
                await fetch(`${backendUrl}/health`);
            } catch (error) {
                // silent
            }
        }, 30000);

        return () => {
            newSocket.disconnect();
            socketRef.current = null;
            clearInterval(heartbeatInterval);
        };
    }, []);

    // Fetch unread counts from API
    const fetchUnreadCounts = useCallback(async () => {
        try {
            const response = await fetch(`/api/chat/unread-counts`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setUnreadCounts(data.data);
                    setRooms((prevRooms) =>
                        prevRooms.map((room) => ({
                            ...room,
                            unreadCount: data.data[room.id] || 0,
                        }))
                    );
                }
            }
        } catch (error) {
            console.error("Failed to fetch unread counts:", error);
        }
    }, []);

    // Fetch all users
    const fetchAllUsers = useCallback(async () => {
        try {
            const response = await fetch(`/api/direct/users`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setAllUsers(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    }, []);

    // Send friend request
    const sendFriendRequest = useCallback(async (receiverId: string) => {
        try {
            const response = await fetch(`/api/direct/requests/send`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId }),
            });

            if (response.ok) {
                if (socketRef.current) {
                    socketRef.current.emit("friend:request-sent", { receiverId });
                }
            }
        } catch (error) {
            console.error("Failed to send friend request:", error);
        }
    }, []);

    // Fetch friend requests
    const fetchFriendRequests = useCallback(async () => {
        try {
            const response = await fetch(`/api/direct/requests`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setFriendRequests(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch friend requests:", error);
        }
    }, []);

    // Accept friend request
    const acceptFriendRequest = useCallback(async (requestId: string) => {
        try {
            const response = await fetch(`/api/direct/requests/accept`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId }),
            });

            if (response.ok) {
                const data = await response.json();
                fetchFriendRequests();
                fetchDirectChats();

                if (socketRef.current) {
                    const request = friendRequests.find((r) => r.id === requestId);
                    if (request) {
                        socketRef.current.emit("friend:request-accepted", {
                            senderId: request.senderId,
                            chatId: data.data.id,
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to accept friend request:", error);
        }
    }, [friendRequests]);

    // Reject friend request
    const rejectFriendRequest = useCallback(async (requestId: string) => {
        try {
            const response = await fetch(`/api/direct/requests/reject`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId }),
            });

            if (response.ok) {
                fetchFriendRequests();
            }
        } catch (error) {
            console.error("Failed to reject friend request:", error);
        }
    }, []);

    // Fetch direct chats
    const fetchDirectChats = useCallback(async () => {
        try {
            const response = await fetch(`/api/direct/chats`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setDirectChats(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch direct chats:", error);
        }
    }, []);

    // Fetch messages for a specific direct chat
    const fetchDirectMessages = useCallback(async (chatId: string) => {
        try {
            const response = await fetch(`/api/direct/chats/${chatId}/messages`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setDirectMessages(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch direct messages:", error);
        }
    }, []);

    // Get or create direct chat
    const getOrCreateDirectChat = useCallback(
        async (otherUserId: string): Promise<DirectChat | null> => {
            try {
                const response = await fetch(`/api/direct/chats/get-or-create`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ otherUserId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        return data.data;
                    }
                }
            } catch (error) {
                console.error("Failed to get or create direct chat:", error);
            }
            return null;
        },
        []
    );

    // Mark room messages as read
    const markRoomMessagesAsRead = useCallback(
        async (roomId: string) => {
            try {
                const response = await fetch(`/api/chat/rooms/${roomId}/mark-read`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                if (response.ok) {
                    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
                    setRooms((prevRooms) =>
                        prevRooms.map((room) =>
                            room.id === roomId ? { ...room, unreadCount: 0 } : room
                        )
                    );

                    if (socketRef.current) {
                        socketRef.current.emit("chat:messages-read", { roomId });
                    }
                }
            } catch (error) {
                console.error("Failed to mark messages as read:", error);
            }
        },
        []
    );

    // Join a specific room
    const joinRoom = useCallback(
        (roomId: string) => {
            if (!socketRef.current) return;

            socketRef.current.emit(
                "chat:join-room",
                { roomId },
                (response: { success: boolean; messages?: ChatMessage[] }) => {
                    if (response.success) {
                        setCurrentDirectChat(null);
                        setDirectMessages([]);
                        setDirectTypingUsers([]);

                        setMessages(response.messages || []);
                        setTypingUsers([]);
                        const room = rooms.find((r) => r.id === roomId);
                        if (room) setCurrentRoom(room);

                        markRoomMessagesAsRead(roomId);
                    }
                }
            );
        },
        [rooms, markRoomMessagesAsRead]
    );

    // Send a message
    const sendMessage = useCallback(
        (content: string) => {
            if (!socketRef.current || !currentRoom) return;
            socketRef.current.emit("chat:message", {
                roomId: currentRoom.id,
                content,
            });
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            socketRef.current.emit("chat:stop-typing", { roomId: currentRoom.id });
        },
        [currentRoom]
    );

    // Edit a message
    const editMessage = useCallback(
        (messageId: string, content: string) => {
            if (!socketRef.current) return;
            socketRef.current.emit("chat:edit-message", { messageId, content });
        },
        []
    );

    // Delete a message
    const deleteMessage = useCallback(
        (messageId: string) => {
            if (!socketRef.current || !currentRoom) return;
            socketRef.current.emit("chat:delete-message", {
                messageId,
                roomId: currentRoom.id,
            });
        },
        [currentRoom]
    );

    // Start typing
    const startTyping = useCallback(() => {
        if (!socketRef.current || !currentRoom) return;
        socketRef.current.emit("chat:typing", { roomId: currentRoom.id });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current && currentRoom) {
                socketRef.current.emit("chat:stop-typing", { roomId: currentRoom.id });
            }
        }, 2000);
    }, [currentRoom]);

    // Stop typing
    const stopTyping = useCallback(() => {
        if (!socketRef.current || !currentRoom) return;
        socketRef.current.emit("chat:stop-typing", { roomId: currentRoom.id });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [currentRoom]);

    // Join direct chat
    const joinDirectChat = useCallback(
        (chatId: string) => {
            if (!socketRef.current) return;

            if (currentDirectChat) {
                socketRef.current.emit("direct:leave-chat", { chatId: currentDirectChat.id });
            }

            socketRef.current.emit("direct:join-chat", { chatId }, async (response: { success: boolean }) => {
                if (response.success) {
                    setCurrentRoom(null);
                    setMessages([]);
                    setTypingUsers([]);

                    const chat = directChats.find((c) => c.id === chatId);
                    if (chat) {
                        setCurrentDirectChat(chat);
                        setDirectTypingUsers([]);
                        await fetchDirectMessages(chatId);
                    }
                }
            });
        },
        [directChats, currentDirectChat, fetchDirectMessages]
    );

    // Send direct message
    const sendDirectMessage = useCallback(
        (content: string) => {
            if (!socketRef.current || !currentDirectChat) return;
            socketRef.current.emit("direct:message", {
                chatId: currentDirectChat.id,
                content,
            });
            if (directTypingTimeoutRef.current) {
                clearTimeout(directTypingTimeoutRef.current);
                directTypingTimeoutRef.current = null;
            }
            socketRef.current.emit("direct:stop-typing", { chatId: currentDirectChat.id });
        },
        [currentDirectChat]
    );

    // Start direct typing
    const startDirectTyping = useCallback(() => {
        if (!socketRef.current || !currentDirectChat) return;
        socketRef.current.emit("direct:typing", { chatId: currentDirectChat.id });

        if (directTypingTimeoutRef.current) {
            clearTimeout(directTypingTimeoutRef.current);
        }

        directTypingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current && currentDirectChat) {
                socketRef.current.emit("direct:stop-typing", { chatId: currentDirectChat.id });
            }
        }, 2000);
    }, [currentDirectChat]);

    // Stop direct typing
    const stopDirectTyping = useCallback(() => {
        if (!socketRef.current || !currentDirectChat) return;
        socketRef.current.emit("direct:stop-typing", { chatId: currentDirectChat.id });
        if (directTypingTimeoutRef.current) {
            clearTimeout(directTypingTimeoutRef.current);
            directTypingTimeoutRef.current = null;
        }
    }, [currentDirectChat]);

    return (
        <ChatContext.Provider
            value={{
                socket,
                isConnected,
                currentUser,
                onlineUsers,
                rooms,
                currentRoom,
                messages,
                typingUsers,
                unreadCounts,
                allUsers,
                directChats,
                currentDirectChat,
                directMessages,
                directTypingUsers,
                friendRequests,
                joinRoom,
                sendMessage,
                editMessage,
                deleteMessage,
                startTyping,
                stopTyping,
                markRoomMessagesAsRead,
                fetchAllUsers,
                sendFriendRequest,
                fetchFriendRequests,
                acceptFriendRequest,
                rejectFriendRequest,
                fetchDirectChats,
                fetchDirectMessages,
                joinDirectChat,
                sendDirectMessage,
                startDirectTyping,
                stopDirectTyping,
                getOrCreateDirectChat,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
