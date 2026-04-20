"use client";

import { useState, useEffect } from "react";
import { Search, Hash, MessageSquare, Users, UserPlus, Check, X, LogOut } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import UserAvatar from "./UserAvatar";
import ChatThemeToggle from "./ChatThemeToggle";
import "../../styles/chat-sidebar.css";

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
    const {
        currentUser,
        isConnected,
        rooms,
        currentRoom,
        joinRoom,
        onlineUsers,
        allUsers,
        directChats,
        currentDirectChat,
        friendRequests,
        fetchAllUsers,
        fetchDirectChats,
        fetchFriendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        joinDirectChat,
        getOrCreateDirectChat,
    } = useChat();

    const [activeTab, setActiveTab] = useState<"channels" | "direct" | "users">("channels");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (currentUser) {
            fetchAllUsers();
            fetchDirectChats();
            fetchFriendRequests();
        }
    }, [currentUser]);

    // Filter rooms by search
    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter direct chats by search
    const filteredDirectChats = directChats.filter((chat) => {
        const otherUser =
            chat.user1Id === currentUser?.id ? chat.user2 : chat.user1;
        const displayName = otherUser?.username || otherUser?.name || "";
        return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Filter users by search
    const filteredUsers = allUsers.filter((user) => {
        const displayName = user.username || user.name || "";
        return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleStartDirectChat = async (userId: string) => {
        const chat = await getOrCreateDirectChat(userId);
        if (chat) {
            await fetchDirectChats();
            joinDirectChat(chat.id);
            setActiveTab("direct");
        }
    };

    return (
        <>
            <div className={`chat-sidebar ${isOpen ? "open" : ""}`}>
                {/* Header */}
                <div className="chat-sidebar-header">
                    <div className="chat-sidebar-brand">
                        <div className="chat-sidebar-logo">💬</div>
                        <div>
                            <div className="chat-sidebar-title">Chat</div>
                            <div className="chat-sidebar-connection">
                                <div className={`chat-sidebar-connection-dot ${!isConnected ? "disconnected" : ""}`} />
                                <span>{isConnected ? "Connected" : "Disconnected"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Search & Theme Toggle */}
                    <div className="chat-sidebar-search-container">
                        <div className="chat-sidebar-search">
                            <Search className="chat-sidebar-search-icon" />
                            <input
                                className="chat-sidebar-search-input"
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <ChatThemeToggle />
                    </div>
                </div>

                {/* Tabs */}
                <div className="chat-sidebar-tabs">
                    <button
                        className={`chat-sidebar-tab ${activeTab === "channels" ? "active" : ""}`}
                        onClick={() => setActiveTab("channels")}
                    >
                        <Hash size={14} />
                        Channels
                    </button>
                    <button
                        className={`chat-sidebar-tab ${activeTab === "direct" ? "active" : ""}`}
                        onClick={() => setActiveTab("direct")}
                    >
                        <MessageSquare size={14} />
                        Direct
                        {friendRequests.length > 0 && (
                            <span className="chat-tab-badge">{friendRequests.length}</span>
                        )}
                    </button>
                    <button
                        className={`chat-sidebar-tab ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        <Users size={14} />
                        Users
                    </button>
                </div>

                {/* Content based on tab */}
                {activeTab === "channels" && (
                    <>
                        <div className="chat-sidebar-section">CHANNELS</div>
                        <div className="chat-sidebar-rooms">
                            {filteredRooms.map((room) => (
                                <div
                                    key={room.id}
                                    className={`chat-room-item ${
                                        currentRoom?.id === room.id && !currentDirectChat ? "active" : ""
                                    }`}
                                    onClick={() => {
                                        joinRoom(room.id);
                                        onClose();
                                    }}
                                >
                                    <div className="chat-room-icon">{room.icon}</div>
                                    <div className="chat-room-info">
                                        <div className="chat-room-name">{room.name}</div>
                                        <div className="chat-room-last-message">
                                            {room.lastMessage
                                                ? `${room.lastMessage.senderName}: ${room.lastMessage.content}`
                                                : room.description}
                                        </div>
                                    </div>
                                    {(room.unreadCount || 0) > 0 && (
                                        <div className="chat-unread-badge">{room.unreadCount}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Online Users */}
                        <div className="chat-sidebar-online-users-section">
                            <div className="chat-sidebar-section">
                                ONLINE — {onlineUsers.length}
                            </div>
                            <div className="chat-sidebar-online-users-list">
                                {onlineUsers.map((user) => (
                                    <div key={user.id} className="chat-online-user-item">
                                        <UserAvatar
                                            username={user.username || user.name || "User"}
                                            avatarColor={user.avatar}
                                            isOnline={true}
                                            size="sm"
                                        />
                                        <span className={`chat-online-user-name ${user.id === currentUser?.id ? "is-you" : ""}`}>
                                            {user.username || user.name || "User"}
                                        </span>
                                        {user.id === currentUser?.id && (
                                            <span className="chat-online-user-tag">you</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "direct" && (
                    <>
                        {/* Friend requests */}
                        {friendRequests.length > 0 && (
                            <>
                                <div className="chat-sidebar-section">
                                    FRIEND REQUESTS — {friendRequests.length}
                                </div>
                                <div className="chat-friendrequests-list">
                                    {friendRequests.map((request) => (
                                        <div key={request.id} className="chat-friend-request-item">
                                            <UserAvatar
                                                username={request.sender?.username || request.sender?.name || "User"}
                                                avatarColor={request.sender?.avatar || "#6C5CE7"}
                                                isOnline={request.sender?.isOnline}
                                                size="sm"
                                            />
                                            <span className="chat-request-username">
                                                {request.sender?.username || request.sender?.name || "User"}
                                            </span>
                                            <div className="chat-request-actions">
                                                <button
                                                    className="chat-request-btn accept"
                                                    onClick={() => acceptFriendRequest(request.id)}
                                                    title="Accept"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    className="chat-request-btn reject"
                                                    onClick={() => rejectFriendRequest(request.id)}
                                                    title="Reject"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="chat-sidebar-section">DIRECT MESSAGES</div>
                        <div className="chat-sidebar-direct-chats">
                            {filteredDirectChats.length === 0 ? (
                                <div className="chat-sidebar-empty">
                                    No direct messages yet
                                </div>
                            ) : (
                                filteredDirectChats.map((chat) => {
                                    const otherUser =
                                        chat.user1Id === currentUser?.id
                                            ? chat.user2
                                            : chat.user1;
                                    const lastMsg =
                                        chat.messages && chat.messages.length > 0
                                            ? chat.messages[chat.messages.length - 1]
                                            : null;

                                    return (
                                        <div
                                            key={chat.id}
                                            className={`chat-direct-chat-item ${
                                                currentDirectChat?.id === chat.id ? "active" : ""
                                            }`}
                                            onClick={() => {
                                                joinDirectChat(chat.id);
                                                onClose();
                                            }}
                                        >
                                            <UserAvatar
                                                username={otherUser?.username || otherUser?.name || "User"}
                                                avatarColor={otherUser?.avatar || "#6C5CE7"}
                                                isOnline={otherUser?.isOnline}
                                                size="md"
                                            />
                                            <div className="chat-direct-chat-info">
                                                <div className="chat-direct-chat-name">
                                                    {otherUser?.username || otherUser?.name || "User"}
                                                </div>
                                                {lastMsg && (
                                                    <div className="chat-direct-chat-last-message">
                                                        {lastMsg.content}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {activeTab === "users" && (
                    <>
                        <div className="chat-sidebar-section">
                            ALL USERS — {filteredUsers.length}
                        </div>
                        <div className="chat-sidebar-users-list">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="chat-available-user-item">
                                    <UserAvatar
                                        username={user.username || user.name || "User"}
                                        avatarColor={user.avatar}
                                        isOnline={user.isOnline}
                                        size="sm"
                                    />
                                    <span className="chat-available-user-name">
                                        {user.username || user.name || "User"}
                                    </span>
                                    <button
                                        className="chat-add-chat-btn"
                                        onClick={() => handleStartDirectChat(user.id)}
                                        title="Start chat"
                                    >
                                        <UserPlus size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Footer */}
                {currentUser && (
                    <div className="chat-sidebar-footer">
                        <div className="chat-sidebar-footer-user">
                            <UserAvatar
                                username={currentUser.username || "User"}
                                avatarColor={currentUser.avatar}
                                isOnline={true}
                                size="sm"
                            />
                            <div>
                                <div className="chat-sidebar-footer-name">{currentUser.username || "User"}</div>
                                <div className="chat-sidebar-footer-status">Online</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile backdrop */}
            <div
                className={`chat-sidebar-backdrop ${isOpen ? "open" : ""}`}
                onClick={onClose}
            />
        </>
    );
}
