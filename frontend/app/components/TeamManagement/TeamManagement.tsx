"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search, Plus, Edit2, Trash2, X, User,
    Mail, Phone, Shield, Eye, EyeOff,
    ChevronLeft, ChevronRight, Filter,
    CheckCircle, XCircle, AlertCircle,
    MapPin, Globe, Hash, FileText, Clock, Loader2
} from "lucide-react";
import { useTeam } from "../../context/TeamContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Users.css"; // Reuse existing styles
import "../../styles/TeamManagement.css";
import React from 'react';

const ROLES = ["Admin", "Editor", "Viewer"];
const ROWS_PER_PAGE = 5;

const roleColors = {
    SuperAdmin: "role-admin",
    Admin: "role-admin",
    Editor: "role-editor",
    Viewer: "role-viewer",
};

const avatarColors = [
    "#7c3aed", "#2563eb", "#059669", "#d97706",
    "#dc2626", "#db2777", "#0891b2", "#65a30d",
    "#7c3aed", "#ea580c", "#6d28d9", "#0284c7",
];

const emptyForm = {
    name: "", email: "", phone: "", username: "",
    city: "", country: "", zipCode: "", bio: "",
    timezone: "", role: "Viewer", password: "",
};

const getAvatarColor = (id: string | null | undefined): string => {
    if (!id) return avatarColors[0];
    const index = parseInt(id.slice(-4), 16) % avatarColors.length;
    return avatarColors[index] || avatarColors[0];
};

const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const TeamManagement = () => {
    const { teamMembers, loading, error, fetchTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, searchTeamMembers } = useTeam();
    const { user: currentUser } = useAuth();

    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("All");
    const [page, setPage] = useState(1);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [form, setForm] = useState(emptyForm);
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);

    useEffect(() => {
        if (!search.trim()) {
            setSearchResults(null);
            setSearchLoading(false);
            fetchTeamMembers(); // Fetch all team members when search is cleared
            return;
        }
        setSearchLoading(true);
        const timer = setTimeout(async () => {
            const result = await searchTeamMembers(search.trim());
            setSearchResults(result.data || []);
            setSearchLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, searchTeamMembers, fetchTeamMembers]);



    const baseList = searchResults !== null ? searchResults : teamMembers;
    const filtered = baseList.filter((m: any) => {
        return filterRole === "All" || m.role === filterRole;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

    const validate = (isCreate = false) => {
        const e: any = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
        // Password not strictly required for team members as per simple CRUD, 
        // but can be added if backend needs it. Backend model doesn't have it.
        return e;
    };

    const handleCreate = async () => {
        const e = validate(true);
        if (Object.keys(e).length) { setErrors(e); return; }
        setSubmitting(true);
        const result = await createTeamMember(form);
        setSubmitting(false);
        if (result.success) {
            setShowCreate(false);
            setForm(emptyForm);
            setErrors({});

        } else {
            if (result.field === "email") {
                setErrors({ email: result.message });
            } else {

            }
        }
    };

    const handleEdit = async () => {
        const e = validate(false);
        if (Object.keys(e).length) { setErrors(e); return; }
        setSubmitting(true);
        const result = await updateTeamMember(selectedMember._id, form);
        setSubmitting(false);
        if (result.success) {
            setShowEdit(false);
            setErrors({});

        } else {
            if (result.field === "email") {
                setErrors({ email: result.message });
            } else {

            }
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        const result = await deleteTeamMember(selectedMember._id);
        setSubmitting(false);
        setShowDelete(false);

    };

    const openCreate = () => {
        setForm(emptyForm);
        setErrors({});
        setShowCreate(true);
    };

    const openEdit = (m: any) => {
        setSelectedMember(m);
        setForm({
            name: m.name || "",
            email: m.email || "",
            phone: m.phone || "",
            username: m.username || "",
            city: m.city || "",
            country: m.country || "",
            zipCode: m.zipCode || "",
            bio: m.bio || "",
            timezone: m.timezone || "",
            role: m.role || "Viewer",
            password: "",
        });
        setErrors({});
        setShowEdit(true);
    };

    const openDelete = (m: any) => {
        setSelectedMember(m);
        setShowDelete(true);
    };

    const closeAll = () => {
        setShowCreate(false);
        setShowEdit(false);
        setShowDelete(false);
        setErrors({});
    };

    const handleChange = (field: string, val: string) => {
        setForm((f) => ({ ...f, [field]: val }));
        if (errors[field]) setErrors((e: any) => { const n = { ...e }; delete n[field]; return n; });
    };

    const stats = {
        total: teamMembers.length,
        verified: teamMembers.filter((m: any) => m.isVerified).length,
        admins: teamMembers.filter((m: any) => m.role === "Admin" || m.role === "SuperAdmin").length,
        others: teamMembers.filter((m: any) => m.role !== "Admin" && m.role !== "SuperAdmin").length,
    };

    // Check if subscription error exists
    if (error && error.includes("subscription")) {
        return (
            <div className="users-page">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    <AlertCircle size={64} style={{ color: '#f59e0b', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                        Premium Feature
                    </h2>
                    <p style={{ fontSize: '1rem', color: '#666', marginBottom: '24px', maxWidth: '400px' }}>
                        {error}
                    </p>
                    <Link href="/pricing" style={{
                        padding: '12px 24px',
                        background: '#111',
                        color: '#fff',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        display: 'inline-block'
                    }}>
                        View Pricing Plans
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="users-page team-page">


            <div className="users-header team-header">
                <div>
                    <h1 className="users-title team-title">Team Management</h1>
                    <p className="users-subtitle team-subtitle">Create and manage your team members directly</p>
                </div>
                {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
                    <button className="btn-create" onClick={openCreate}>
                        <Plus size={18} /> New Team Member
                    </button>
                )}
            </div>

            {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
                <div className="users-stats team-stats">
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-purple"><User size={20} /></div>
                        <div>
                            <p className="stat-label">Total Members</p>
                            <p className="stat-value">{stats.total}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-green"><CheckCircle size={20} /></div>
                        <div>
                            <p className="stat-label">Joined</p>
                            <p className="stat-value">{stats.verified}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-blue"><Shield size={20} /></div>
                        <div>
                            <p className="stat-label">Admins</p>
                            <p className="stat-value">{stats.admins}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-yellow"><AlertCircle size={20} /></div>
                        <div>
                            <p className="stat-label">Others</p>
                            <p className="stat-value">{stats.others}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="users-toolbar team-toolbar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search team members…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    {searchLoading && <Loader2 size={16} className="spin-icon" style={{ marginRight: "8px", color: "#7c3aed" }} />}
                </div>
            </div>

            <div className="users-table-wrap team-table-wrap">
                <table className="users-table team-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Contact</th>
                            <th>Location</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="table-empty">
                                    <Loader2 size={36} className="spin-icon" />
                                    <p>Loading members…</p>
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="table-empty">
                                    <User size={40} />
                                    <p>No members found</p>
                                </td>
                            </tr>
                        ) : paginated.map((m: any) => (
                            <tr key={m._id} className="table-row">
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar" style={{ background: getAvatarColor(m._id) }}>
                                            {getInitials(m.name)}
                                        </div>
                                        <div>
                                            <p className="user-name">{m.name}</p>
                                            {m.username && <p className="user-id">@{m.username}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span><Mail size={13} />{m.email}</span>
                                        {m.phone && <span><Phone size={13} />{m.phone}</span>}
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        {m.city && <span><MapPin size={13} />{m.city}{m.country ? `, ${m.country}` : ""}</span>}
                                        {!m.city && m.country && <span><Globe size={13} />{m.country}</span>}
                                        {!m.city && !m.country && <span className="muted-cell">—</span>}
                                    </div>
                                </td>
                                <td className="joined-cell">
                                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
                                </td>
                                <td>
                                    <div className="action-btns">
                                        {(currentUser?.role === "Admin" || currentUser?.role === "Editor" || currentUser?.role === "SuperAdmin") && (
                                            <button className="action-btn edit-btn" onClick={() => openEdit(m)}>
                                                <Edit2 size={15} />
                                            </button>
                                        )}
                                        {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
                                            <button className="action-btn del-btn" onClick={() => openDelete(m)}>
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                        {currentUser?.role === "Viewer" && <span className="muted-cell">No Actions</span>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="users-pagination team-pagination">
                <p className="page-info">
                    Showing {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} members
                </p>
                <div className="page-btns">
                    <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} className={`page-btn ${p === page ? "page-active" : ""}`} onClick={() => setPage(p)}>
                            {p}
                        </button>
                    ))}
                    <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* CREATE MODAL */}
            {showCreate && (
                <div className="modal-overlay" onClick={closeAll}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-icon-wrap"><Plus size={20} /></div>
                                <div>
                                    <h2>Create Team Member</h2>
                                    <p>Fill in details to add a new member</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeAll}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <MemberForm form={form} errors={errors} onChange={handleChange} isCreate={true} currentUser={currentUser} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeAll}>Cancel</button>
                            <button className="btn-submit" onClick={handleCreate} disabled={submitting}>
                                {submitting ? <Loader2 size={16} className="spin-icon" /> : <Plus size={16} />}
                                Create Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEdit && selectedMember && (
                <div className="modal-overlay" onClick={closeAll}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-icon-wrap modal-icon-edit"><Edit2 size={20} /></div>
                                <div>
                                    <h2>Edit Member</h2>
                                    <p>Update information for {selectedMember.name}</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeAll}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <MemberForm form={form} errors={errors} onChange={handleChange} isCreate={false} currentUser={currentUser} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeAll}>Cancel</button>
                            <button className="btn-submit" onClick={handleEdit} disabled={submitting}>
                                {submitting ? <Loader2 size={16} className="spin-icon" /> : <Edit2 size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDelete && selectedMember && (
                <div className="modal-overlay" onClick={closeAll}>
                    <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-icon-wrap modal-icon-del"><Trash2 size={20} /></div>
                                <div>
                                    <h2>Delete Member</h2>
                                    <p>Are you sure?</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeAll}><X size={20} /></button>
                        </div>
                        <div className="modal-body delete-body" style={{ textAlign: "center" }}>
                            <p>Are you sure you want to remove <strong>{selectedMember.name}</strong>?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeAll}>Cancel</button>
                            <button className="btn-danger" style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "10px", padding: "11px 22px", fontWeight: "600", cursor: "pointer" }} onClick={handleDelete} disabled={submitting}>
                                {submitting ? <Loader2 size={16} className="spin-icon" /> : <Trash2 size={16} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MemberForm = ({ form, errors, onChange, isCreate, currentUser }: any) => (
    <div className="form-grid">
        <div className="form-group">
            <label><User size={14} /> Full Name *</label>
            <input type="text" placeholder="John Doe"
                value={form.name} onChange={(e) => onChange("name", e.target.value)}
                className={errors.name ? "input-error" : ""} />
            {errors.name && <span className="err-msg">{errors.name}</span>}
        </div>
        <div className="form-group">
            <label><Hash size={14} /> Username</label>
            <input type="text" placeholder="johndoe"
                value={form.username} onChange={(e) => onChange("username", e.target.value)} />
        </div>
        <div className="form-group">
            <label><Mail size={14} /> Email Address *</label>
            <input type="email" placeholder="john@example.com"
                value={form.email} onChange={(e) => onChange("email", e.target.value)}
                className={errors.email ? "input-error" : ""} />
            {errors.email && <span className="err-msg">{errors.email}</span>}
        </div>
        <div className="form-group">
            <label><Phone size={14} /> Phone Number</label>
            <input type="tel" placeholder="+1 (555) 000-0000"
                value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
        </div>

        <div className="form-group">
            <label><MapPin size={14} /> City</label>
            <input type="text" placeholder="New York"
                value={form.city} onChange={(e) => onChange("city", e.target.value)} />
        </div>
        <div className="form-group">
            <label><Globe size={14} /> Country</label>
            <input type="text" placeholder="United States"
                value={form.country} onChange={(e) => onChange("country", e.target.value)} />
        </div>
        <div className="form-group">
            <label><Clock size={14} /> Timezone</label>
            <input type="text" placeholder="UTC-5 / Asia/Karachi"
                value={form.timezone} onChange={(e) => onChange("timezone", e.target.value)} />
        </div>
        {/* <div className="form-group form-group-full">
            <label><FileText size={14} /> Bio</label>
            <textarea rows={3} placeholder="Short bio about the member…"
                value={form.bio} onChange={(e) => onChange("bio", e.target.value)} />
        </div> */}
    </div>
);

export default TeamManagement;
