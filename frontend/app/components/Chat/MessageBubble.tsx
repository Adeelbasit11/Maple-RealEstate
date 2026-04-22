"use client";

import { useState } from "react";
import { ChatMessage } from "../../types/chat";
import { useChat } from "../../context/ChatContext";
import UserAvatar from "./UserAvatar";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import { Pencil, Trash2, X, Check } from "lucide-react";
import "../../styles/chat-message-bubble.css";

interface MessageBubbleProps {
    message: ChatMessage;
    isSent: boolean;
    showSender: boolean;
}

export default function MessageBubble({
    message,
    isSent,
    showSender,
}: MessageBubbleProps) {
    const { editMessage, deleteMessage } = useChat();
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, "0");
        const ampm = h >= 12 ? "pm" : "am";
        const hour12 = h % 12 || 12;
        return `${hour12.toString().padStart(2, "0")}:${m} ${ampm}`;
    };

    const handleEdit = () => {
        if (editContent.trim() && editContent !== message.content) {
            editMessage(message.id, editContent);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(message.content);
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteMessage(message.id);
        setShowConfirmDelete(false);
    };

    // System messages
    if (message.type === "system") {
        return (
            <div className="chat-system-message">
                <span className="chat-system-message-content">{message.content}</span>
            </div>
        );
    }

    const isVoice = message.type === "voice" && message.audioUrl;

    return (
        <div
            className={`chat-message-wrapper ${isSent ? "sent" : "received"} ${
                showSender ? "message-group-gap" : ""
            }`}
        >
            {/* Inner group — limits max-width, holds avatar + bubble */}
            <div className="chat-message-inner">
            {/* Avatar on LEFT for received messages */}
            {!isSent && showSender && (
                <UserAvatar
                    username={message.senderName}
                    avatarColor={message.senderAvatar}
                    isOnline={false}
                    size="sm"
                    showStatus={false}
                />
            )}
            {!isSent && !showSender && <div className="chat-avatar-spacer" />}

            <div className={`chat-message-bubble-container ${isSent ? "sent" : "received"}`}>
                <div className={`chat-message-bubble ${isSent ? "sent" : "received"} ${isEditing ? "editing" : ""}`}>
                    {isEditing ? (
                        <div className="chat-edit-input-wrapper">
                            <textarea
                                className="chat-edit-textarea"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEdit();
                                    } else if (e.key === "Escape") {
                                        handleCancelEdit();
                                    }
                                }}
                            />
                            <div className="chat-edit-actions">
                                <button onClick={handleCancelEdit} className="chat-edit-action-btn cancel" title="Cancel">
                                    <X size={14} />
                                </button>
                                <button onClick={handleEdit} className="chat-edit-action-btn save" title="Save">
                                    <Check size={14} />
                                </button>
                            </div>
                        </div>
                    ) : isVoice ? (
                        <VoiceMessagePlayer
                            audioUrl={message.audioUrl!}
                            duration={message.audioDuration}
                        />
                    ) : (
                        <div className="chat-msg-content">{message.content}</div>
                    )}

                    {/* Action buttons (only for sender) */}
                    {isSent && !isEditing && !showConfirmDelete && !isVoice && (
                        <div className="chat-message-actions-overlay">
                            <button onClick={() => setIsEditing(true)} className="chat-msg-action-btn" title="Edit">
                                <Pencil size={12} />
                            </button>
                            <button onClick={() => setShowConfirmDelete(true)} className="chat-msg-action-btn delete" title="Delete">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Time + edited label */}
                <div className="chat-msg-footer">
                    {message.isEdited && <span className="chat-edited-label">(edited)</span>}
                    <span className="chat-msg-time">{formatTime(message.timestamp)}</span>
                </div>

                {/* Delete confirmation */}
                {showConfirmDelete && (
                    <div className="chat-delete-confirm-popup">
                        <span>Delete message?</span>
                        <div className="chat-delete-confirm-actions">
                            <button onClick={() => setShowConfirmDelete(false)} className="chat-confirm-btn-cancel">No</button>
                            <button onClick={handleDelete} className="chat-confirm-btn-delete">Yes</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Avatar on right for sent */}
            {isSent && showSender && (
                <UserAvatar
                    username={message.senderName}
                    avatarColor={message.senderAvatar}
                    isOnline={true}
                    size="sm"
                    showStatus={false}
                />
            )}
            {isSent && !showSender && <div className="chat-avatar-spacer" />}
            </div>{/* end chat-message-inner */}
        </div>
    );
}
