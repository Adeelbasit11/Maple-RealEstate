"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "../../styles/AccountSetting.css";

const AccountSetting = () => {
    const { user, updateProfile, refreshUser } = useAuth();
    const { success, error } = useToast();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [fullName, setFullName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [bioFormat, setBioFormat] = useState("Normal text");
    const [bio, setBio] = useState("");
    const [timezone, setTimezone] = useState("Pacific Standard Time");

    useEffect(() => {
        if (user) {
            setFullName(user.name || "");
            setLastName(user.lastName || "");
            setEmail(user.email || "");
            setUsername(user.username || "");
            setPhone(user.phone || "");
            setCity(user.city || "");
            setCountry(user.country || "");
            setZipCode(user.zipCode || "");
            setBio(user.bio || "");
            setTimezone(user.timezone || "Pacific Standard Time");
            setPhotoPreview(user.profileImage || null);
        }
    }, [user]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const isValidImage = (file: File) => {
        const validTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/gif", "image/webp"];
        return validTypes.includes(file.type);
    };

    const processFile = (file: File) => {
        if (!isValidImage(file)) {
            error("Please upload a valid image (SVG, PNG, JPG, GIF or WebP)");
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    // Clipboard paste handler
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith("image/")) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    if (file) {
                        processFile(file);
                        success("Image pasted successfully!");
                    }
                    break;
                }
            }
        };
        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const formData = new FormData();
        formData.append("name", fullName);
        formData.append("lastName", lastName);
        formData.append("username", username);
        formData.append("phone", phone);
        formData.append("city", city);
        formData.append("country", country);
        formData.append("zipCode", zipCode);
        formData.append("bio", bio);
        formData.append("timezone", timezone);
        if (photoFile) formData.append("profileImage", photoFile);

        const res = await updateProfile(formData);
        setSaving(false);
        if (res.success) {
            await refreshUser();
            success("Profile updated successfully");
            setPhotoFile(null);
        } else {
            error(res.message || "Failed to update profile");
        }
    };

    const handleCancel = () => {
        if (user) {
            setFullName(user.name || "");
            setLastName(user.lastName || "");
            setUsername(user.username || "");
            setPhone(user.phone || "");
            setCity(user.city || "");
            setCountry(user.country || "");
            setZipCode(user.zipCode || "");
            setBio(user.bio || "");
            setTimezone(user.timezone || "Pacific Standard Time");
            setPhotoPreview(user.profileImage || null);
            setPhotoFile(null);
        }
    };

    return (
        <div className="account-setting-page">
            {/* Header */}
            <header className="account-setting-header">
                <h2>Account/Setting</h2>
                <div className="account-setting-search">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={16} className="search-icon" />
                </div>
            </header>

            {/* Title Row */}
            <div className="setting-title-row">
                <div>
                    <h3>Setting Details</h3>
                    <p>Update your photo and personal details here.</p>
                </div>
                <div className="setting-action-btns">
                    <button className="btn-cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="setting-content-grid">

                {/* Left Panel — Personal Information */}
                <div className="setting-left-panel">
                    <h4>Personal information</h4>

                    {/* Full Name + Last Name */}
                    <div className="setting-form-row">
                        <div className="setting-form-field">
                            <label>First Name</label>
                            <input
                                type="text"
                                placeholder="Enter first name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="setting-form-field">
                            <label>Last Name</label>
                            <input
                                type="text"
                                placeholder="Enter last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Email + Username */}
                    <div className="setting-form-row">
                        <div className="setting-form-field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="setting-form-field">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="Enter user name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Phone + City */}
                    <div className="setting-form-row">
                        <div className="setting-form-field">
                            <label>Phone No</label>
                            <input
                                type="text"
                                placeholder="Enter phone no"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="setting-form-field">
                            <label>City</label>
                            <input
                                type="text"
                                placeholder="Enter your city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Country + Zip */}
                    <div className="setting-form-row">
                        <div className="setting-form-field">
                            <label>Country Name</label>
                            <input
                                type="text"
                                placeholder="Enter country name"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                        </div>
                        <div className="setting-form-field">
                            <label>Zip code</label>
                            <input
                                type="text"
                                placeholder="Enter zip code"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div style={{ marginBottom: 16 }}>
                        <div className="bio-label-row">
                            <label>Bio</label>
                            <span>Write a short introduction</span>
                        </div>
                        <div className="bio-toolbar">
                            <select
                                className="bio-format-select"
                                value={bioFormat}
                                onChange={(e) => setBioFormat(e.target.value)}
                            >
                                <option>Normal text</option>
                                <option>Heading 1</option>
                                <option>Heading 2</option>
                                <option>Heading 3</option>
                            </select>
                        </div>
                        <textarea
                            className="bio-textarea"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Timezone */}
                    <div className="setting-form-row full">
                        <div className="setting-form-field">
                            <label>Timezone</label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                            >
                                <option>Pacific Standard Time</option>
                                <option>Mountain Standard Time</option>
                                <option>Central Standard Time</option>
                                <option>Eastern Standard Time</option>
                                <option>UTC</option>
                                <option>Asia/Karachi</option>
                                <option>Europe/London</option>
                                <option>Europe/Paris</option>
                                <option>Asia/Dubai</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="setting-right-panel">

                    {/* Photo Card */}
                    <div className="setting-photo-card">
                        <h4>Your Photo</h4>
                        <div className="photo-preview-row">
                            <img
                                src={photoPreview || "https://i.pravatar.cc/44"}
                                alt="Avatar"
                                className="photo-avatar"
                            />
                            <div className="photo-edit-info">
                                <span>Edit your photo</span>
                                <a href="#" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
                                    Delete. Update
                                </a>
                            </div>
                        </div>

                        <div
                            className={`photo-upload-zone${dragActive ? " drag-active" : ""}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="upload-icon-circle">
                                <Upload size={20} color="#7c3aed" />
                            </div>
                            {photoFile ? (
                                <p>{photoFile.name}</p>
                            ) : (
                                <p>
                                    <span className="link-text">Click to upload</span> or drag and drop<br />
                                    or <strong>paste</strong> from clipboard<br />
                                    SVG, PNG, JPG or GIF (max. 800×400px)
                                </p>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>

                    {/* Google Card */}
                    <div className="setting-google-card">
                        <div className="google-card-top">
                            <div className="google-logo">
                                <span className="g-blue">G</span>
                                <span className="g-red">o</span>
                                <span className="g-yellow">o</span>
                                <span className="g-blue">g</span>
                                <span className="g-green">l</span>
                                <span className="g-red">e</span>
                            </div>
                            <span className="connected-badge">Connected</span>
                        </div>
                        <p className="google-desc">
                            Use Google to sign in to your account.{" "}
                            <a href="#">Click here to learn more.</a>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AccountSetting;
