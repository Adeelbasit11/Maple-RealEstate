"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import EmojiPicker from "./EmojiPicker";
import "../../styles/chat-input.css";

export default function ChatInput() {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { sendMessage, startTyping, currentRoom } = useChat();

    const handleSend = () => {
        if (!message.trim()) return;
        sendMessage(message.trim());
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "48px";
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        startTyping();

        // Auto resize
        const textarea = e.target;
        textarea.style.height = "48px";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    };

    const handleEmojiSelect = (emoji: string) => {
        const newMessage = message + emoji;
        setMessage(newMessage);

        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = "48px";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
    };

    return (
        <div className="chat-input-bar">
            <div className="chat-input-wrapper">
                <textarea
                    ref={textareaRef}
                    className="chat-input"
                    placeholder={
                        currentRoom
                            ? `Message #${currentRoom.name}...`
                            : "Select a room to start chatting..."
                    }
                    value={message}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={!currentRoom}
                />
            </div>
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            <button
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!message.trim() || !currentRoom}
                title="Send message"
            >
                <Send />
            </button>
        </div>
    );
}
