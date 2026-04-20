"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Smile } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import UserAvatar from "./UserAvatar";
import EmojiPicker from "./EmojiPicker";
import "../../styles/chat-direct-window.css";

export default function DirectMessageWindow() {
    const {
        currentDirectChat,
        directMessages,
        currentUser,
        sendDirectMessage,
        startDirectTyping,
        stopDirectTyping,
        directTypingUsers,
    } = useChat();
    const [messageContent, setMessageContent] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [directMessages]);

    if (!currentDirectChat || !currentUser) {
        return (
            <div className="chat-direct-message-window empty">
                <div className="chat-dm-empty-state">
                    <div className="chat-dm-empty-icon">💬</div>
                    <h2>No chat selected</h2>
                    <p>Select a chat from the sidebar to start messaging</p>
                </div>
            </div>
        );
    }

    const otherUser =
        currentDirectChat.user1Id === currentUser.id
            ? currentDirectChat.user2
            : currentDirectChat.user1;

    const handleSendMessage = () => {
        if (messageContent.trim()) {
            sendDirectMessage(messageContent);
            setMessageContent("");
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessageContent(value);

        if (!isTyping && value.trim()) {
            setIsTyping(true);
            startDirectTyping();
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (value.trim()) {
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                stopDirectTyping();
            }, 2000);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setMessageContent((prev) => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-direct-message-window">
            {/* Header */}
            <div className="chat-dm-header">
                <div className="chat-dm-user">
                    <UserAvatar
                        username={otherUser.username || otherUser.name || "User"}
                        avatarColor={otherUser.avatar}
                        isOnline={otherUser.isOnline}
                        size="md"
                    />
                    <div className="chat-dm-user-info">
                        <h2>{otherUser.username || otherUser.name || "User"}</h2>
                        <p className={otherUser.isOnline ? "online" : "offline"}>
                            {otherUser.isOnline ? "Active now" : "Offline"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-dm-messages-container">
                {directMessages.length === 0 ? (
                    <div className="chat-dm-empty-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {directMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chat-dm-message ${
                                    msg.senderId === currentUser.id ? "sent" : "received"
                                }`}
                            >
                                {msg.senderId !== currentUser.id && (
                                    <UserAvatar
                                        username={msg.senderName}
                                        avatarColor={msg.senderAvatar}
                                        isOnline={false}
                                        size="sm"
                                    />
                                )}
                                <div className="chat-dm-bubble">
                                    {msg.senderId !== currentUser.id && (
                                        <div className="chat-dm-msg-sender">{msg.senderName}</div>
                                    )}
                                    <div className="chat-dm-msg-content">{msg.content}</div>
                                    <div className="chat-dm-msg-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {directTypingUsers.length > 0 && (
                            <div className="chat-dm-typing-indicator">
                                <span>
                                    {directTypingUsers.map((u) => u.username).join(", ")} is typing
                                    <span className="chat-dm-dots">
                                        <span>.</span><span>.</span><span>.</span>
                                    </span>
                                </span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="chat-dm-input-container">
                <div className="chat-dm-input-wrapper">
                    <input
                        type="text"
                        className="chat-dm-input"
                        placeholder={`Message ${otherUser.username || otherUser.name || "User"}...`}
                        value={messageContent}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className={`chat-dm-emoji-btn ${showEmojiPicker ? "active" : ""}`}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Emoji"
                    >
                        <Smile size={20} />
                    </button>
                </div>

                {showEmojiPicker && (
                    <div className="chat-dm-emoji-picker-wrapper">
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                )}

                <button
                    className="chat-dm-send-btn"
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                    title="Send"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
