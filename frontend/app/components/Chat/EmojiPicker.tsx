"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import "../../styles/chat-emoji-picker.css";

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const emojis = [
        "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
        "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
        "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜",
        "🤪", "😌", "😔", "😑", "😐", "😏", "🥱", "😓",
        "👍", "👎", "👏", "🙌", "👐", "🤝", "🤲", "🤜",
        "🤛", "✊", "👊", "☝️", "👆", "👇", "👉", "👈",
        "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
        "🤎", "💔", "💕", "💞", "💓", "💗", "💖", "💘",
        "🎉", "🎊", "🎈", "🎁", "🔥", "💯", "✨", "⭐",
        "👌", "🤔", "🤷", "🤨", "😬", "🤐", "🤫", "😱",
        "🤯", "😤", "😠", "😡", "🤬", "😈", "💀", "☠️",
        "🚀", "🎮", "🎯", "🎲", "🎪", "🎭", "🎨", "🎬",
        "🎤", "🎧", "🎸", "🎹", "🥁", "📱", "💻", "⌨️",
    ];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEmojiClick = (emoji: string) => {
        onEmojiSelect(emoji);
        setIsOpen(false);
    };

    return (
        <div className="chat-emoji-picker-container" ref={pickerRef}>
            <button
                className="chat-emoji-picker-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="Add emoji"
                type="button"
            >
                <Smile size={20} />
            </button>

            {isOpen && (
                <div className="chat-emoji-picker-grid">
                    {emojis.map((emoji, index) => (
                        <button
                            key={index}
                            className="chat-emoji-btn"
                            onClick={() => handleEmojiClick(emoji)}
                            title={emoji}
                            type="button"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
