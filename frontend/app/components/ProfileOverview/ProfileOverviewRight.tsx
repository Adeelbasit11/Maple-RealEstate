"use client";

import React, { useState } from 'react';
import { Users, Settings, ChevronDown, ChevronUp, Mail, Phone, MapPin, Globe, FileText, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import "../../styles/ProfileOverviewRight.css";

const hashtagsData = [
    { id: 'sport', title: 'Sport & Health', tags: '#sport #fit #health', open: true },
    { id: 'animals', title: 'Animals', tags: '#animal #nature #health', open: false },
    { id: 'beauty', title: 'Beauty', tags: '#beauty #makeup #fashion', open: false },
    { id: 'art', title: 'Art', tags: '#art #artist #love', open: false },
];

const ProfileOverviewRight = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [accordions, setAccordions] = useState(hashtagsData);

    const toggleAccordion = (id: string) => {
        setAccordions(
            accordions.map((acc) =>
                acc.id === id ? { ...acc, open: !acc.open } : acc
            )
        );
    };

    const displayName = user
        ? [user.name, user.lastName].filter(Boolean).join(" ")
        : "User";

    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="po-right-sidebar">
            {/* Header */}
            <div className="po-right-header">
                <div className="po-right-title">My profile</div>
                <div className="po-right-icons">
                    <Users size={18} cursor="pointer" />
                    <Settings
                        size={18}
                        cursor="pointer"
                        onClick={() => router.push("/pages/account/setting")}
                    />
                </div>
            </div>

            {/* Avatar block */}
            <div className="po-avatar-container">
                <div className="po-avatar" style={{ backgroundColor: '#ff8a65', overflow: 'hidden' }}>
                    {user?.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={displayName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff8a65&color=fff&size=128`}
                            alt={displayName}
                        />
                    )}
                </div>
                <div className="po-avatar-name">{displayName}</div>
            </div>

            {/* Profile Details */}
            {user && (
                <div className="po-profile-details">
                    {user.email && (
                        <div className="po-detail-row">
                            <Mail size={14} className="po-detail-icon" />
                            <span className="po-detail-text">{user.email}</span>
                        </div>
                    )}
                    {user.username && (
                        <div className="po-detail-row">
                            <Users size={14} className="po-detail-icon" />
                            <span className="po-detail-text">@{user.username}</span>
                        </div>
                    )}
                    {user.phone && (
                        <div className="po-detail-row">
                            <Phone size={14} className="po-detail-icon" />
                            <span className="po-detail-text">{user.phone}</span>
                        </div>
                    )}
                    {(user.city || user.country) && (
                        <div className="po-detail-row">
                            <MapPin size={14} className="po-detail-icon" />
                            <span className="po-detail-text">
                                {[user.city, user.country].filter(Boolean).join(", ")}
                            </span>
                        </div>
                    )}
                    {user.zipCode && (
                        <div className="po-detail-row">
                            <Globe size={14} className="po-detail-icon" />
                            <span className="po-detail-text">ZIP: {user.zipCode}</span>
                        </div>
                    )}
                    {user.timezone && (
                        <div className="po-detail-row">
                            <Clock size={14} className="po-detail-icon" />
                            <span className="po-detail-text">{user.timezone}</span>
                        </div>
                    )}
                    {user.bio && (
                        <div className="po-detail-row po-bio-row">
                            <FileText size={14} className="po-detail-icon" />
                            <span className="po-detail-text po-bio-text">{user.bio}</span>
                        </div>
                    )}
                </div>
            )}

            {/* VIP Course */}
            <div className="po-vip-section">
                <div className="po-vip-title">VIP Training Course</div>
                <div className="po-vip-bar-container">
                    <span className="po-vip-percent">10%</span>
                    <div className="po-vip-track">
                        <div className="po-vip-fill"></div>
                    </div>
                </div>
            </div>

            {/* Hashtags sets */}
            <div className="po-hashtags-section">
                <div className="po-hashtags-header">
                    <div className="po-hashtags-title">Hashtags sets</div>
                    <div className="po-settings-icon">
                        <Settings size={16} />
                    </div>
                </div>

                <div className="po-accordion-list">
                    {accordions.map((acc) => (
                        <div
                            key={acc.id}
                            className="po-accordion-item"
                            onClick={() => toggleAccordion(acc.id)}
                        >
                            <div className="po-accordion-content">
                                <span className="po-accordion-name">{acc.title}</span>
                                {acc.open && (
                                    <span className="po-accordion-tags">{acc.tags}</span>
                                )}
                            </div>
                            <div className="po-accordion-arrow">
                                {acc.open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileOverviewRight;
