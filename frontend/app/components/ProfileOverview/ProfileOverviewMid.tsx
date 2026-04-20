"use client";

import React, { useState } from 'react';
import { Search, HelpCircle, Activity, Globe, Phone, Navigation, Mail } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

import "../../styles/ProfileOverviewMid.css";

// --- Mock Data ---
const followersData = [
  { name: '25.02', income: 70000, outcome: 50000 },
  { name: '26.02', income: 120000, outcome: 110000 },
  { name: '27.02', income: 250000, outcome: 60000 },
  { name: '28.02', income: 200000, outcome: 100000 },
  { name: '29.02', income: 80000, outcome: 60000 },
];

const interactionData = [
  { name: '25.02', a: 10, b: 20, c: 5 },
  { name: '26.02', a: 150, b: 100, c: 50 },
  { name: '27.02', a: 80, b: 60, c: 40 },
  { name: '28.02', a: 40, b: 20, c: 10 },
  { name: '29.02', a: 140, b: 120, c: 80 },
];

const bestTimeData = [
  { name: 'Mon', value: 250 },
  { name: 'Tue', value: 60 },
  { name: 'Wed', value: 120 },
  { name: 'Thu', value: 80 },
  { name: 'Fri', value: 300 },
  { name: 'Sat', value: 70 },
  { name: 'Sun', value: 160 },
];

const ageRangeData = [
  { name: '13-17', val1: 150, val2: 80 },
  { name: '18-24', val1: 40, val2: 60 },
  { name: '25-34', val1: 120, val2: 100 },
  { name: '35-44', val1: 100, val2: 120 },
  { name: '45-54', val1: 280, val2: 180 },
  { name: '55-64', val1: 150, val2: 80 },
  { name: '65-74+', val1: 100, val2: 140 },
];

const COLORS = ['#8b5cf6', '#d8b4fe'];
const genderData = [
  { name: 'Men', value: 35 },
  { name: 'Women', value: 45 },
];

// Reusable mini chart components for top stat cards
const MiniLineChart = ({ color, dataKey }: { color: string, dataKey: string }) => (
    <ResponsiveContainer width="99%" height="99%">
        <LineChart data={followersData}>
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
    </ResponsiveContainer>
);

const ProfileOverviewMid = () => {
    return (
        <div className="po-mid-container">
            {/* Header */}
            <div className="po-header">
                <h3 className="po-title">Profile/Profile overview</h3>
                <div className="po-search-bar">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={18} className="search-icon" />
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="po-stats-row">
                <div className="po-card po-stat-card">
                    <div className="po-stat-chart-container">
                        <MiniLineChart color="#8b5cf6" dataKey="income" />
                    </div>
                    <div className="po-stat-info">
                        <div className="po-stat-value">
                            635 <span className="po-stat-percentage text-purple">+21.01%</span>
                        </div>
                        <div className="po-stat-label">Average Likes</div>
                    </div>
                </div>
                <div className="po-card po-stat-card">
                    <div className="po-stat-chart-container">
                        <MiniLineChart color="#10b981" dataKey="outcome" />
                    </div>
                    <div className="po-stat-info">
                        <div className="po-stat-value">
                            123 <span className="po-stat-percentage text-purple">+4.399%</span>
                        </div>
                        <div className="po-stat-label">Comments recived</div>
                    </div>
                </div>
                <div className="po-card po-stat-card">
                    <div className="po-stat-chart-container">
                        <MiniLineChart color="#38bdf8" dataKey="income" />
                    </div>
                    <div className="po-stat-info">
                        <div className="po-stat-value">
                            23% <span className="po-stat-percentage text-red">-7.9%</span>
                        </div>
                        <div className="po-stat-label">Av. Engagement rate</div>
                    </div>
                </div>
            </div>

            {/* Main Center Grid (Followers & Actions) */}
            <div className="po-main-grid">
                <div className="po-card">
                    <div className="po-card-header">
                        <div className="po-card-title">Followers</div>
                        <div className="po-legend">
                            <div className="po-legend-item">
                                <span className="po-legend-dot red"></span> Income
                            </div>
                            <div className="po-legend-item">
                                <span className="po-legend-dot purple"></span> Outcome
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer width="99%" height="99%">
                            <LineChart data={followersData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => val === 0 ? '0' : `${val/1000}k`} />
                                <Tooltip cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5'}} />
                                <Line type="monotone" dataKey="income" stroke="#ef4444" strokeWidth={2} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} isAnimationActive={false} />
                                <Line type="monotone" dataKey="outcome" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="po-card">
                    <div className="po-card-header">
                        <div className="po-card-title">Actions</div>
                        <HelpCircle size={16} color="#94a3b8" />
                    </div>
                    <div className="po-actions-list">
                        <div className="po-action-item">
                            <span>Profile visits</span>
                            <span className="po-action-value">250</span>
                        </div>
                        <div className="po-action-item">
                            <span>Website clicks</span>
                            <span className="po-action-value">115</span>
                        </div>
                        <div className="po-action-item">
                            <span>Calls</span>
                            <span className="po-action-value">67</span>
                        </div>
                        <div className="po-action-item">
                            <span>Getvdirection</span>
                            <span className="po-action-value">164</span>
                        </div>
                        <div className="po-action-item">
                            <span>Emails</span>
                            <span className="po-action-value">170</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Grid (Interaction & Best Time) */}
            <div className="po-secondary-grid">
                <div className="po-card">
                    <div className="po-card-header">
                        <div className="po-card-title">Interaction</div>
                        <HelpCircle size={16} color="#94a3b8" />
                    </div>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer width="99%" height="99%">
                            <LineChart data={interactionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip />
                                <Line type="monotone" dataKey="a" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="b" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="c" stroke="#93c5fd" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="po-card">
                    <div className="po-card-header">
                        <div className="po-card-title">Best time</div>
                        <div className="po-card-tabs">
                            <span className="active">Days</span>
                            <span>Hours</span>
                            <HelpCircle size={16} color="#94a3b8" />
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer width="99%" height="99%">
                            <BarChart data={bestTimeData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#d8b4fe" radius={[4, 4, 0, 0]} activeBar={{ fill: '#8b5cf6' }} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Grid (Gender & Age Range) */}
            <div className="po-bottom-grid">
                <div className="po-card">
                    <div className="po-card-header">
                        <div className="po-card-title">Gender</div>
                        <HelpCircle size={16} color="#94a3b8" />
                    </div>
                    <div style={{ width: '100%', height: 160 }}>
                        <ResponsiveContainer width="99%" height="99%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                    isAnimationActive={false}
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="po-gender-footer">
                        <div className="po-gender-stat">
                            <span className="po-legend-dot purple"></span>
                            <div className="po-gender-stat-val">
                                <p>35%</p>
                                <span>Men</span>
                            </div>
                        </div>
                        <div className="po-gender-stat">
                            <span className="po-legend-dot" style={{backgroundColor: '#d8b4fe'}}></span>
                            <div className="po-gender-stat-val" style={{textAlign: 'right'}}>
                                <p>45%</p>
                                <span>Women</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="po-card">
                    <div className="po-card-header">
                        <div className="po-card-title">Age range</div>
                        <div className="po-card-tabs">
                            <span className="active">All</span>
                            <span>Men</span>
                            <span>Women</span>
                            <HelpCircle size={16} color="#94a3b8" />
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer width="99%" height="99%">
                            <BarChart data={ageRangeData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barGap={2}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={5} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="val1" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={8} isAnimationActive={false} />
                                <Bar dataKey="val2" fill="#d8b4fe" radius={[4, 4, 0, 0]} barSize={8} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default ProfileOverviewMid;
