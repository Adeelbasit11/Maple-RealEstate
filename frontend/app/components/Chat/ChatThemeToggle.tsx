"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import "../../styles/chat-theme-toggle.css";

type ChatTheme = "dark" | "light";

export default function ChatThemeToggle() {
    const [theme, setTheme] = useState<ChatTheme>("dark");

    useEffect(() => {
        const saved = localStorage.getItem("chat-theme") as ChatTheme | null;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = saved || (prefersDark ? "dark" : "light");
        setTheme(initial);
        applyTheme(initial);
    }, []);

    const applyTheme = (t: ChatTheme) => {
        const chatLayout = document.querySelector(".chat-layout");
        if (chatLayout) {
            chatLayout.setAttribute("data-chat-theme", t);
        }
        localStorage.setItem("chat-theme", t);
    };

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
    };

    return (
        <button
            onClick={toggleTheme}
            className="chat-theme-toggle"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle chat theme"
        >
            {theme === "dark" ? (
                <Sun className="chat-theme-icon" />
            ) : (
                <Moon className="chat-theme-icon" />
            )}
        </button>
    );
}
