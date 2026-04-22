"use client";

import { useState } from "react";
import { Search, Menu } from "lucide-react";
import { ChatProvider, useChat } from "../../context/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import UserAvatar from "./UserAvatar";
import "../../styles/chat-globals.css";
import "../../styles/chat-page.css";

function ChatPageInner() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeHeaderTab, setActiveHeaderTab] = useState<"app" | "message" | "setting">("app");
    const { currentUser } = useChat();

    return (
        <div className="chat-layout">
            {/* Top Header Bar — Two Rows */}
            <header className="chat-top-header">
                {/* Row 1: Chat title + Search */}
                <div className="chat-top-row1">
                    <button
                        className="chat-mobile-menu-btn"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu size={20} />
                    </button>
                    <h1 className="chat-top-title">Chat</h1>
                    <div className="chat-top-search">
                        <input type="text" placeholder="Search anything here..." />
                        <Search size={16} className="chat-top-search-icon" />
                    </div>
                </div>
                {/* Row 2: User info (left) + Tabs (right) */}
                <div className="chat-top-row2">
                    {currentUser && (
                        <div className="chat-top-user-info">
                            <UserAvatar
                                username={currentUser.username || "User"}
                                avatarColor={currentUser.avatar}
                                isOnline={true}
                                size="md"
                                showStatus={false}
                            />
                            <div className="chat-top-user-details">
                                <span className="chat-top-user-name">{currentUser.username || "User"}</span>
                                <span className="chat-top-user-email">{currentUser.email || currentUser.name || ""}</span>
                            </div>
                        </div>
                    )}
                    <div className="chat-top-tabs">
                        <button
                            className={`chat-top-tab ${activeHeaderTab === "app" ? "active" : ""}`}
                            onClick={() => setActiveHeaderTab("app")}
                        >App</button>
                        <button
                            className={`chat-top-tab ${activeHeaderTab === "message" ? "active" : ""}`}
                            onClick={() => setActiveHeaderTab("message")}
                        >Message</button>
                        <button
                            className={`chat-top-tab ${activeHeaderTab === "setting" ? "active" : ""}`}
                            onClick={() => setActiveHeaderTab("setting")}
                        >Setting</button>
                    </div>
                </div>
            </header>

            {/* Chat Body */}
            <div className="chat-body">
                <ChatSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <ChatWindow />
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <ChatProvider>
            <ChatPageInner />
        </ChatProvider>
    );
}
