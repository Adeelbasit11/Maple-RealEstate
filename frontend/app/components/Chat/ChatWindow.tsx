"use client";

import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import DirectMessageWindow from "./DirectMessageWindow";
import "../../styles/chat-window.css";

export default function ChatWindow() {
    const {
        currentRoom,
        currentDirectChat,
        messages,
        typingUsers,
        currentUser,
        isConnected,
        onlineUsers,
    } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // If in direct message mode, show DirectMessageWindow
    if (currentDirectChat) {
        return <DirectMessageWindow />;
    }

    if (!currentRoom) {
        return (
            <div className="chat-no-room-selected">
                <div className="chat-no-room-icon">💬</div>
                <div className="chat-no-room-title">Welcome to Chat</div>
                <div className="chat-no-room-subtitle">Select a channel to start chatting</div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-icon">{currentRoom.icon}</div>
                <div className="chat-header-info">
                    <div className="chat-header-name">{currentRoom.name}</div>
                    <div className="chat-header-desc">{currentRoom.description}</div>
                </div>
                <div className="chat-header-online">
                    <div className={`chat-connection-status ${isConnected ? "online" : "offline"}`}>
                        <div className="chat-connection-dot" />
                        <span>{isConnected ? "Connected" : "Disconnected"}</span>
                    </div>
                    <div className="chat-online-count">
                        {onlineUsers.length} online
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <div className="chat-empty-icon">🎉</div>
                        <div className="chat-empty-text">No messages yet</div>
                        <div className="chat-empty-sub">Be the first to send a message!</div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const showSender =
                            !prevMsg ||
                            prevMsg.senderId !== msg.senderId ||
                            prevMsg.type === "system";

                        return (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isSent={msg.senderId === currentUser?.id}
                                showSender={showSender}
                            />
                        );
                    })
                )}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="chat-typing-indicator">
                        <div className="chat-typing-dots">
                            <div className="chat-typing-dot" />
                            <div className="chat-typing-dot" />
                            <div className="chat-typing-dot" />
                        </div>
                        <span>
                            {typingUsers.map((u) => u.username).join(", ")}{" "}
                            {typingUsers.length === 1 ? "is" : "are"} typing...
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput />
        </div>
    );
}
