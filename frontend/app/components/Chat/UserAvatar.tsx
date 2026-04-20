"use client";

import "../../styles/chat-user-avatar.css";

interface UserAvatarProps {
    username: string;
    avatarColor: string;
    isOnline?: boolean;
    size?: "sm" | "md" | "lg";
    showStatus?: boolean;
}

export default function UserAvatar({
    username,
    avatarColor,
    isOnline = false,
    size = "md",
    showStatus = true,
}: UserAvatarProps) {
    const initials = (username || "?")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);

    return (
        <div className="chat-user-avatar">
            <div
                className={`chat-user-avatar-circle size-${size}`}
                style={{ backgroundColor: avatarColor || "#6C5CE7" }}
            >
                {initials}
            </div>
            {showStatus && (
                <div
                    className={`chat-avatar-status-dot ${size === "sm" ? "size-sm" : ""} ${
                        !isOnline ? "offline" : ""
                    }`}
                />
            )}
        </div>
    );
}
