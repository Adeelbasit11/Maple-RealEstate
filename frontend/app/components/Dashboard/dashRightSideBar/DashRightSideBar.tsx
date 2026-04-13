"use client";

import { useAuth } from "../../../context/AuthContext";
import { Copy, ChevronRight, Box } from "lucide-react";
import "../../../styles/DashRightSideBar.css";

import {
    BarChart,
    Bar,
    XAxis,
    ResponsiveContainer,
    Cell
} from 'recharts';
import React from "react";

const impressionData = [
    { name: 'Mon', value: 80, color: '#d8b4fe' },
    { name: 'Tue', value: 30, color: '#e9d5ff' },
    { name: 'Wed', value: 60, color: '#7c3aed' },
    { name: 'Thu', value: 40, color: '#e9d5ff' },
];

const DashRightSideBar = () => {
    const { user, logout } = useAuth();

    return (
        <aside className="right-sidebar">
            {/* User Profile / Greeting */}
            <div className="profile-section">
                <div className="greeting">
                    <p>Welcome back,</p>
                    <h3>{user ? user.name : "Kashif"}</h3>
                </div>
                <div className="profile-actions">
                    <button className="logout-btn-small" onClick={logout}>Logout</button>
                </div>
            </div>

            {/* Earnings Card */}
            <div className="earnings-card">
                <h3>Your earning this month</h3>
                <div className="earning-amount">735.2$</div>
                <p className="earning-desc">Update your payout method in Setting</p>
                <button className="withdraw-btn">Withdraw All Earnings</button>
            </div>

            {/* Earnings by Item */}
            <div className="earnings-list">
                <h3>Earnings by item</h3>

                <ListItem
                    icon={<div className="item-icon purple"><Box size={18} /></div>}
                    title="Bento 3D Kit"
                    subtitle="Illustration"
                />
                <ListItem
                    icon={<div className="item-icon green"><Box size={18} /></div>}
                    title="Bento 3D Kit"
                    subtitle="Coded Template"
                />
                <ListItem
                    icon={<div className="item-icon red"><Box size={18} /></div>}
                    title="Bento 3D Kit"
                    subtitle="Illustration"
                />
            </div>

            {/* Impression Chart */}
            <div className="impression-section">
                <h3>Impression</h3>
                <div className="impression-chart" style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={impressionData} barSize={12}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                                {impressionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </aside>
    );
};

interface ListItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

const ListItem: React.FC<ListItemProps> = ({ icon, title, subtitle }) => (
    <div className="list-item">
        {icon}
        <div className="item-info">
            <h4>{title}</h4>
            <p>{subtitle}</p>
        </div>
        <ChevronRight size={16} className="item-arrow" />
    </div>
);

export default DashRightSideBar;
