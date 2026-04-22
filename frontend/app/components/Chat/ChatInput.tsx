"use client";

import { useState, useRef, KeyboardEvent, useCallback } from "react";
import { Send, Mic, Square } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import "../../styles/chat-input.css";

export default function ChatInput() {
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { sendMessage, sendVoiceMessage, startTyping, currentRoom } = useChat();

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = () => {
        if (!message.trim()) return;
        sendMessage(message.trim());
        setMessage("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        startTyping();
    };

    // Voice recording
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                if (audioBlob.size > 0) {
                    await sendVoiceMessage(audioBlob, recordingDuration);
                }
                setRecordingDuration(0);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Microphone access denied:", error);
            alert("Please allow microphone access to send voice messages.");
        }
    }, [sendVoiceMessage, recordingDuration]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    }, [isRecording]);

    const formatRecordTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="chat-input-bar">
            {isRecording ? (
                <div className="chat-recording-bar">
                    <div className="chat-recording-indicator">
                        <div className="chat-recording-dot" />
                        <span>Recording</span>
                    </div>
                    <span className="chat-recording-time">{formatRecordTime(recordingDuration)}</span>
                    <button
                        className="chat-stop-record-btn"
                        onClick={stopRecording}
                        title="Stop recording & send"
                    >
                        <Square size={14} />
                        <span>Send</span>
                    </button>
                </div>
            ) : (
                <>
                    <input
                        ref={inputRef}
                        type="text"
                        className="chat-input"
                        placeholder="Write a message..."
                        value={message}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        disabled={!currentRoom}
                    />
                    {message.trim() ? (
                        <button
                            className="chat-send-btn"
                            onClick={handleSend}
                            disabled={!currentRoom}
                            title="Send message"
                        >
                            <Send size={18} />
                        </button>
                    ) : (
                        <button
                            className="chat-mic-btn"
                            onClick={startRecording}
                            disabled={!currentRoom}
                            title="Record voice message"
                        >
                            <Mic size={18} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
