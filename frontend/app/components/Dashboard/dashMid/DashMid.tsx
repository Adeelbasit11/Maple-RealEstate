"use client";

import Link from "next/link";
import { Search, MousePointer2, CreditCard, Crown } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell
} from 'recharts';
import "../../../styles/DashMid.css";
import React from "react";

const activeUsersData = [
    { name: '1', value: 30 },
    { name: '2', value: 50 },
    { name: '3', value: 35 },
    { name: '4', value: 60 },
    { name: '5', value: 40 },
    { name: '6', value: 55 },
    { name: '7', value: 30 },
    { name: '8', value: 45 },
    { name: '9', value: 35 },
    { name: '10', value: 50 },
    { name: '11', value: 25 },
];

const salesByAgeData = [
    { age: '10', sales: 15 },
    { age: '20', sales: 25 },
    { age: '30', sales: 20 },
    { age: '40', sales: 60 },
    { age: '50', sales: 45 },
    { age: '60', sales: 80 },
    { age: '70', sales: 45 },
    { age: '80', sales: 55 },
    { age: '90', sales: 35 },
    { age: '100', sales: 25 },
    { age: '200', sales: 55 },
    { age: '300', sales: 15 },
    { age: '400', sales: 0 },
    { age: '500', sales: 0 },
];


const DashMid = () => {
    const { user } = useAuth();
    return (
        <main className="dash-mid">
            {/* Header */}
            <header className="mid-header">
                <div className="header-title-section">
                    <h2>DashBoard</h2>
                    {user && (
                        <div className={`plan-badge plan-${user.subscriptionPlan?.toLowerCase()}`}>
                            {user.subscriptionPlan === "Free" ? <CreditCard size={14} /> : <Crown size={14} />}
                            <span>{user.subscriptionPlan || "Free"} Plan</span>
                        </div>
                    )}
                </div>

                <div className="search-bar">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={18} className="search-icon" />
                </div>
            </header>

            {/* Top Section: Active Users + Chart + Stats Grid */}
            <section className="stats-main">
                <div className="active-users-card">

                    {/* Top part of card: Info & Bar Chart */}
                    <div className="active-users-top">
                        <div className="active-users-info">
                            <h3>Active users right now</h3>
                            <div className="active-count">300</div>
                            <div className="page-views">
                                <span className="icon-box"><FileTextIcon /></span>
                                <div>
                                    <span className="label">Page views per minute</span>
                                </div>
                            </div>

                            <div className="mini-chart">
                                <ResponsiveContainer width="100%" height={40}>
                                    <AreaChart data={[{ v: 10 }, { v: 30 }, { v: 15 }, { v: 40 }, { v: 20 }, { v: 50 }, { v: 30 }]}>
                                        <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="none" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <p className="subtext">Upgrade your payout<br />method in setting</p>
                        </div>

                        <div className="main-bar-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activeUsersData} barSize={6}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                                    <XAxis hide />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                        contentStyle={{ background: '#fff', borderRadius: '8px', border: 'none' }}
                                    />
                                    <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                                        {activeUsersData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index % 2 === 0 ? 'rgba(255,255,255,0.5)' : '#ffffff'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom part of card: Stats Grid */}
                    <div className="stats-grid">
                        <StatCard
                            href="/userreport"
                            label="Users Report"
                            value="35k"
                            icon={<div className="icon-bg purple"><UserIcon /></div>}
                            barColor="purple-bar"
                        />

                        <StatCard
                            href="/analytics"
                            label="Analytics"
                            value="1m"
                            icon={<div className="icon-bg green"><MousePointer2 size={16} /></div>}
                            barColor="blue-bar"
                        />

                        <StatCard
                            href="/profile"
                            label="Profile Overview"
                            value="345$"
                            icon={<div className="icon-bg orange"><TagIcon /></div>}
                            barColor="orange-bar"
                        />

                        <StatCard
                            href="/calendar"
                            label="Calendar"
                            value="68"
                            icon={<div className="icon-bg cyan"><BoxIcon /></div>}
                            barColor="cyan-bar"
                        />

                    </div>
                </div>
            </section>

            {/* Bottom Chart: Sales by Age */}
            <section className="sales-chart-card">
                <div className="card-header">
                    <h3>Sales by Age</h3>
                    <span className="tag-sales">● Sales</span>
                </div>

                <div className="chart-body">
                    <div className="y-axis-labels">
                        {['35 to 40', '30 to 35', '25 to 30', '20 to 25', '15 to 20', '10 to 15'].map(label => (
                            <span key={label}>{label}</span>
                        ))}
                    </div>

                    <div className="smooth-chart-container" style={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={salesByAgeData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="age"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#7c3aed"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

        </main>
    );
};

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    barColor: string;
    href: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, barColor, href }) => (
    <Link href={href} className="stat-box stat-link">
        <div className="stat-header">
            {icon}
            <span className="stat-label">{label}</span>
        </div>
        <div className="stat-value">{value}</div>
        <div className={`progress-bar ${barColor}`}></div>
    </Link>
);


// Simple SVG Icons
const FileTextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
)
const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
)
const TagIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
)
const BoxIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
)

export default DashMid;
