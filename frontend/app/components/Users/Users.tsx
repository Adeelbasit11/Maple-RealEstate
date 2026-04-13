"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search, Plus, Edit2, Trash2, X, User,
    Mail, Phone, Shield, Eye, EyeOff,
    ChevronLeft, ChevronRight, Filter,
    CheckCircle, XCircle, AlertCircle,
    MapPin, Globe, Hash, FileText, Clock, Loader2, Send, ChevronDown, ChevronUp
} from "lucide-react";
import { useUsers } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Users.css";

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

const Users = () => {
    const {
        users, loading, error, fetchUsers,
        createUser, updateUser, deleteUser, searchUsers, inviteUser
    } = useUsers();
    const { user: currentUser } = useAuth();

    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("All");
    const [page, setPage] = useState(1);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [form, setForm] = useState(emptyForm);
    const [inviteData, setInviteData] = useState({ email: "", role: "Viewer" });
    const [errors, setErrors] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [isInviteRoleOpen, setIsInviteRoleOpen] = useState(false);

    useEffect(() => {
        if (!search.trim()) {
            setSearchResults(null);
            setSearchLoading(false);
            fetchUsers(); // Fetch all users when search is cleared
            return;
        }
        setSearchLoading(true);
        const timer = setTimeout(async () => {
            const result = await searchUsers(search.trim());
            setSearchResults(result.data || []);
            setSearchLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, searchUsers, fetchUsers]);



    const baseList = searchResults !== null ? searchResults : users;
    const filtered = baseList.filter((u: any) => {
        return filterRole === "All" || u.role === filterRole;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

    const validate = (isCreate = false) => {
        const e: any = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
        if (isCreate && !form.password.trim()) e.password = "Password is required";
        return e;
    };

    const handleCreate = async () => {
        const e = validate(true);
        if (Object.keys(e).length) { setErrors(e); return; }
        setSubmitting(true);
        const result = await createUser(form);
        setSubmitting(false);
        if (result.success) {
            setShowCreate(false);
            setForm(emptyForm);
            setErrors({});
        } else {
            if (result.field === "email") {
                setErrors({ email: result.message });
            }
        }
    };

    const handleEdit = async () => {
        const e = validate(false);
        if (Object.keys(e).length) { setErrors(e); return; }
        setSubmitting(true);
        const result = await updateUser(selectedUser._id, form);
        setSubmitting(false);
        if (result.success) {
            setShowEdit(false);
            setErrors({});
        } else {
            if (result.field === "email") {
                setErrors({ email: result.message });
            }
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        const result = await deleteUser(selectedUser._id);
        setSubmitting(false);
        setShowDelete(false);
        if (result.success) {
            // Already handled by context
        }
    };

    const handleInvite = async () => {
        if (!inviteData.email.trim()) {
            setErrors({ inviteEmail: "Email is required" });
            return;
        }
        setSubmitting(true);
        const result = await inviteUser(inviteData.email, inviteData.role);
        setSubmitting(false);
        if (result.success) {
            setShowInvite(false);
            setInviteData({ email: "", role: "Viewer" });
            setErrors({});
        }
    };

    const openCreate = () => {
        setForm(emptyForm);
        setErrors({});
        setShowCreate(true);
    };

    const openEdit = (u: any) => {
        setSelectedUser(u);
        setForm({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            username: u.username || "",
            city: u.city || "",
            country: u.country || "",
            zipCode: u.zipCode || "",
            bio: u.bio || "",
            timezone: u.timezone || "",
            role: u.role || "Viewer",
            password: "",
        });
        setErrors({});
        setShowEdit(true);
    };

    const openDelete = (u: any) => {
        setSelectedUser(u);
        setShowDelete(true);
    };

    const openInvite = () => {
        setInviteData({ email: "", role: "Viewer" });
        setErrors({});
        setShowInvite(true);
    };

    const closeAll = () => {
        setShowCreate(false);
        setShowEdit(false);
        setShowDelete(false);
        setShowInvite(false);
        setErrors({});
    };

    const handleChange = (field: string, val: string) => {
        setForm((f) => ({ ...f, [field]: val }));
        if (errors[field]) setErrors((e: any) => { const n = { ...e }; delete n[field]; return n; });
    };

    const stats = {
        total: users.length,
        verified: users.filter((u: any) => u.isVerified).length,
        admins: users.filter((u: any) => u.role === "Admin" || u.role === "SuperAdmin").length,
        others: users.filter((u: any) => u.role !== "Admin" && u.role !== "SuperAdmin").length,
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
        <div className="users-page">

            <div className="users-header">
                <div>
                    <h1 className="users-title">User Management</h1>
                    <p className="users-subtitle">Create and manage your accounts directly</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
                        <button className="page-btn" onClick={openInvite} style={{ background: "#fff", color: "#7c3aed", border: "1.5px solid #7c3aed" }}>
                            <Send size={16} /> Invite User
                        </button>
                    )}
                    {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
                        <button className="btn-create" onClick={openCreate}>
                            <Plus size={18} /> New User
                        </button>
                    )}
                </div>
            </div>

            {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
                <div className="users-stats">
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-purple"><User size={20} /></div>
                        <div>
                            <p className="stat-label">Total Users</p>
                            <p className="stat-value">{stats.total}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-green"><CheckCircle size={20} /></div>
                        <div>
                            <p className="stat-label">Verified</p>
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

            <div className="users-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search users…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    {searchLoading && <Loader2 size={16} className="spin-icon" style={{ marginLeft: "auto", color: "#7c3aed" }} />}
                </div>
                <div className="filters">
                    <div className="filter-select-wrap">
                        <Filter size={14} />
                        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}>
                            <option value="All">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Editor">Editor</option>
                            <option value="Viewer">Viewer</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="users-table-wrap">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Contact</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="table-empty">
                                    <Loader2 size={36} className="spin-icon" />
                                    <p>Loading users…</p>
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="table-empty">
                                    <User size={40} />
                                    <p>No users found</p>
                                </td>
                            </tr>
                        ) : paginated.map((u: any) => (
                            <tr key={u._id} className="table-row">
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar" style={{ background: getAvatarColor(u._id) }}>
                                            {getInitials(u.name)}
                                        </div>
                                        <div>
                                            <p className="user-name">{u.name}</p>
                                            {u.username && <p className="user-id">@{u.username}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span><Mail size={13} />{u.email}</span>
                                        {u.phone && <span><Phone size={13} />{u.phone}</span>}
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${(roleColors as any)[u.role] || "role-viewer"}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${u.isVerified ? "status-active" : "status-pending"}`}>
                                        {u.isVerified ? "Active" : "Pending"}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        {(currentUser?.role === "Admin" || currentUser?.role === "Editor" || currentUser?.role === "SuperAdmin") && (
                                            <button className="action-btn edit-btn" onClick={() => openEdit(u)}>
                                                <Edit2 size={15} />
                                            </button>
                                        )}
                                        {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
                                            <button className="action-btn del-btn" onClick={() => openDelete(u)}>
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

            <div className="users-pagination">
                <p className="page-info">
                    Showing {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} users
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
                                    <h2>Create New User</h2>
                                    <p>Fill in details to add a new sub-user</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeAll}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <UserForm form={form} errors={errors} onChange={handleChange} isCreate={true} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeAll}>Cancel</button>
                            <button className="btn-submit" onClick={handleCreate} disabled={submitting}>
                                {submitting ? <Loader2 size={16} className="spin-icon" /> : <Plus size={16} />}
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEdit && selectedUser && (
                <div className="modal-overlay" onClick={closeAll}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-icon-wrap modal-icon-edit"><Edit2 size={20} /></div>
                                <div>
                                    <h2>Edit User</h2>
                                    <p>Update information for {selectedUser.name}</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeAll}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <UserForm form={form} errors={errors} onChange={handleChange} isCreate={false} />
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
            {showDelete && selectedUser && (
                <div className="modal-overlay" onClick={closeAll}>
                    <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-icon-wrap modal-icon-del"><Trash2 size={20} /></div>
                                <div>
                                    <h2>Delete User</h2>
                                    <p>Are you sure?</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeAll}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ textAlign: "center" }}>
                            <p>Are you sure you want to remove <strong>{selectedUser.name}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeAll}>Cancel</button>
                            <button className="btn-submit" style={{ background: "#dc2626" }} onClick={handleDelete} disabled={submitting}>
                                {submitting ? <Loader2 size={16} className="spin-icon" /> : <Trash2 size={16} />}
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INVITE MODAL */}
            {showInvite && (
                <div className="modal-overlay" onClick={closeAll}>
                    <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-icon-wrap" style={{ background: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" }}><Send size={20} /></div>
                                <div>
                                    <h2>Invite New User</h2>
                                    <p>Send an email invitation</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeAll}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label><Mail size={14} /> Email Address</label>
                                <input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    className={errors.inviteEmail ? "input-error" : ""}
                                />
                                {errors.inviteEmail && <span className="err-msg">{errors.inviteEmail}</span>}
                            </div>
                            <div className="form-group" style={{ marginTop: "16px" }}>
                                <label><Shield size={14} /> Assign Role</label>
                                <div 
                                    className="custom-select-container"
                                    tabIndex={0}
                                    onBlur={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget)) {
                                            setIsInviteRoleOpen(false);
                                        }
                                    }}
                                >
                                    <div 
                                        className={`custom-select-trigger ${isInviteRoleOpen ? "open" : ""}`} 
                                        onClick={() => setIsInviteRoleOpen(!isInviteRoleOpen)}
                                    >
                                        <span>{inviteData.role}</span>
                                        {isInviteRoleOpen ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                                    </div>
                                    {isInviteRoleOpen && (
                                        <div className="custom-select-options">
                                            {ROLES.map(r => (
                                                <div 
                                                    key={r} 
                                                    className={`custom-select-option ${inviteData.role === r ? "selected" : ""}`}
                                                    onClick={() => {
                                                        setInviteData({ ...inviteData, role: r });
                                                        setIsInviteRoleOpen(false);
                                                    }}
                                                >
                                                    {r}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeAll}>Cancel</button>
                            <button className="btn-submit" onClick={handleInvite} disabled={submitting}>
                                {submitting ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserForm = ({ form, errors, onChange, isCreate }: any) => {
    const [showPass, setShowPass] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };


    return (
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

            {isCreate && (
                <div className="form-group form-group-full">
                    <label><Shield size={14} /> Password *</label>

                    <div className="pass-wrap">
                        <input
                            type={showPass ? "text" : "password"}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => onChange("password", e.target.value)}
                            className={errors.password ? "input-error" : ""}
                        />

                        {/* Generate Button */}
                        <button
                            type="button"
                            className="gen-pass-btn"
                            onClick={() => onChange("password", generatePassword())}
                        >
                            Generate
                        </button>

                        <button
                            type="button"
                            className="pass-toggle"
                            onClick={() => setShowPass(!showPass)}
                        >
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    
                    {errors.password && <span className="err-msg">{errors.password}</span>}
                </div>
            )}

            <div className="form-group">
                <label><Shield size={14} /> Role</label>
                <div 
                    className="custom-select-container"
                    tabIndex={0}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            setIsRoleOpen(false);
                        }
                    }}
                >
                    <div 
                        className={`custom-select-trigger ${isRoleOpen ? "open" : ""}`} 
                        onClick={() => setIsRoleOpen(!isRoleOpen)}
                    >
                        <span>{form.role}</span>
                        {isRoleOpen ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                    </div>
                    {isRoleOpen && (
                        <div className="custom-select-options">
                            {ROLES.map(r => (
                                <div 
                                    key={r} 
                                    className={`custom-select-option ${form.role === r ? "selected" : ""}`}
                                    onClick={() => {
                                        onChange("role", r);
                                        setIsRoleOpen(false);
                                    }}
                                >
                                    {r}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                <textarea rows={3} placeholder="Short bio about the user…"
                    value={form.bio} onChange={(e) => onChange("bio", e.target.value)} />
            </div> */}
        </div>
    );
};

export default Users;
