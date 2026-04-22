"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import UserAvatar from "./UserAvatar";
import "../../styles/chat-sidebar.css";

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

// Predefined avatar colors for rooms
const roomColors = ["#7c3aed", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"];

function getTimeAgo(dateStr?: string): string {
    if (!dateStr) return "";
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
    const {
        rooms,
        currentRoom,
        joinRoom,
        currentDirectChat,
    } = useChat();

    const [searchQuery, setSearchQuery] = useState("");

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className={`chat-sidebar ${isOpen ? "open" : ""}`}>
                {/* Search */}
                <div className="chat-sidebar-search-wrapper">
                    <div className="chat-sidebar-search">
                        <Search size={15} className="chat-sidebar-search-icon" />
                        <input
                            className="chat-sidebar-search-input"
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Channel List */}
                <div className="chat-sidebar-list">
                    {filteredRooms.map((room, index) => {
                        const isActive = currentRoom?.id === room.id && !currentDirectChat;
                        const lastMsg = room.lastMessage;
                        const color = roomColors[index % roomColors.length];

                        return (
                            <div
                                key={room.id}
                                className={`chat-contact-item ${isActive ? "active" : ""}`}
                                onClick={() => {
                                    joinRoom(room.id);
                                    onClose();
                                }}
                            >
                                <div
                                    className="chat-contact-avatar"
                                    style={{ backgroundColor: color }}
                                >
                                    {room.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="chat-contact-info">
                                    <div className="chat-contact-header-row">
                                        <span className="chat-contact-name">{room.name}</span>
                                        <span className="chat-contact-time">
                                            {getTimeAgo(lastMsg?.timestamp)}
                                        </span>
                                    </div>
                                    <div className="chat-contact-subtitle">{room.description}</div>
                                    <div className="chat-contact-preview">
                                        {lastMsg
                                            ? lastMsg.content
                                            : "No messages yet"}
                                    </div>
                                </div>
                                {(room.unreadCount || 0) > 0 && (
                                    <div className="chat-contact-badge">{room.unreadCount}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile backdrop */}
            <div
                className={`chat-sidebar-backdrop ${isOpen ? "open" : ""}`}
                onClick={onClose}
            />
        </>
    );
}
