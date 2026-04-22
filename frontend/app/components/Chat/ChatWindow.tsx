"use client";

import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import "../../styles/chat-window.css";

function formatDateSeparator(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: undefined });
}

function shouldShowDateSeparator(currentTimestamp: string, prevTimestamp?: string): boolean {
    if (!prevTimestamp) return true;
    const curr = new Date(currentTimestamp).toDateString();
    const prev = new Date(prevTimestamp).toDateString();
    return curr !== prev;
}

export default function ChatWindow() {
    const {
        currentRoom,
        messages,
        typingUsers,
        currentUser,
    } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!currentRoom) {
        return (
            <div className="chat-no-room-selected">
                <div className="chat-no-room-icon">💬</div>
                <div className="chat-no-room-title">Select a channel</div>
                <div className="chat-no-room-subtitle">Choose a group from the sidebar to start chatting</div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <div className="chat-empty-icon">💬</div>
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
                        const showDate = shouldShowDateSeparator(
                            msg.timestamp,
                            prevMsg?.timestamp
                        );

                        return (
                            <div key={msg.id}>
                                {showDate && (
                                    <div className="chat-date-separator">
                                        <div className="chat-date-line" />
                                        <span className="chat-date-text">
                                            {formatDateSeparator(msg.timestamp)}
                                        </span>
                                        <div className="chat-date-line" />
                                    </div>
                                )}
                                <MessageBubble
                                    message={msg}
                                    isSent={msg.senderId === currentUser?.id}
                                    showSender={showSender}
                                />
                            </div>
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
