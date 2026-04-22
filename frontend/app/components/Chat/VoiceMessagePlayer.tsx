"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import "../../styles/chat-voice-player.css";

interface VoiceMessagePlayerProps {
    audioUrl: string;
    duration?: number;
}

export default function VoiceMessagePlayer({ audioUrl, duration }: VoiceMessagePlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration || 0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setTotalDuration(audio.duration);
            }
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

    // Generate waveform bars
    const barCount = 28;
    const bars = Array.from({ length: barCount }, (_, i) => {
        const seed = (i * 7 + 3) % 11;
        return 20 + seed * 7;
    });

    const backendUrl = "http://localhost:5000";
    const fullAudioUrl = audioUrl.startsWith("http") ? audioUrl : `${backendUrl}${audioUrl}`;

    return (
        <div className="voice-player">
            <audio ref={audioRef} src={fullAudioUrl} preload="metadata" />
            <button className="voice-player-btn" onClick={togglePlay}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="voice-player-waveform">
                {bars.map((height, i) => (
                    <div
                        key={i}
                        className={`voice-wave-bar ${(i / barCount) * 100 <= progress ? "active" : ""}`}
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div>
            <span className="voice-player-time">
                {isPlaying ? formatTime(currentTime) : formatTime(totalDuration)}
            </span>
        </div>
    );
}
