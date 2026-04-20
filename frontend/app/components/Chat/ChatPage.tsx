"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { ChatProvider } from "../../context/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import "../../styles/chat-globals.css";
import "../../styles/chat-page.css";

export default function ChatPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <ChatProvider>
            <div className="chat-layout">
                {/* Mobile sidebar toggle */}
                <button
                    className="chat-sidebar-toggle-btn"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu size={20} />
                </button>

                <ChatSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <ChatWindow />
            </div>
        </ChatProvider>
    );
}
