"use client";

import { useState } from "react";
import { Search, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "../../styles/AccountSecurity.css";

interface PasswordRule {
    label: string;
    check: (pw: string) => boolean;
}

const rules: PasswordRule[] = [
    { label: "Minimum 8 characters", check: (pw) => pw.length >= 8 },
    { label: "At least one special character", check: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
    { label: "At least one number", check: (pw) => /\d/.test(pw) },
    { label: "Can't be the same as a previous", check: () => true },
];

const AccountSecurity = () => {
    const { changePassword } = useAuth();
    const { success, error } = useToast();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!currentPassword) errs.currentPassword = "Current password is required";
        if (!newPassword) errs.newPassword = "New password is required";
        else if (newPassword.length < 8) errs.newPassword = "Must be at least 8 characters";
        if (!confirmPassword) errs.confirmPassword = "Please confirm your new password";
        else if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match";
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});
        setSaving(true);
        const res = await changePassword(currentPassword, newPassword);
        setSaving(false);
        if (res.success) {
            success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            error(res.message || "Failed to change password");
        }
    };

    const handleCancel = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
    };

    return (
        <div className="security-page">
            {/* Header */}
            <header className="security-header">
                <h2>Account/Security</h2>
                <div className="security-header-search">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={16} className="search-icon" />
                </div>
            </header>

            {/* Page Title */}
            <div className="security-title">Security Setting</div>

            {/* Content */}
            <div className="security-content">
                {/* Password Panel */}
                <div className="security-password-panel">
                    <div className="security-panel-title">Password</div>
                    <div className="security-panel-desc">
                        The Last Pass password generator creates random passwords based on parameters set by you.
                    </div>

                    {/* Current Password */}
                    <div className="security-form-group">
                        <label>Current password</label>
                        <div className="security-input-wrap">
                            <input
                                type={showCurrent ? "text" : "password"}
                                placeholder="Current password"
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value);
                                    if (errors.currentPassword) setErrors((p) => ({ ...p, currentPassword: "" }));
                                }}
                                className={errors.currentPassword ? "input-error" : ""}
                            />
                            <button
                                type="button"
                                className="security-eye-btn"
                                onClick={() => setShowCurrent((v) => !v)}
                            >
                                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <span className="security-field-error">{errors.currentPassword}</span>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="security-form-group">
                        <label>New password</label>
                        <div className="security-input-wrap">
                            <input
                                type={showNew ? "text" : "password"}
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: "" }));
                                }}
                                className={errors.newPassword ? "input-error" : ""}
                            />
                            <button
                                type="button"
                                className="security-eye-btn"
                                onClick={() => setShowNew((v) => !v)}
                            >
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <span className="security-field-error">{errors.newPassword}</span>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="security-form-group">
                        <label>Confirm password</label>
                        <div className="security-input-wrap">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" }));
                                }}
                                className={errors.confirmPassword ? "input-error" : ""}
                            />
                            <button
                                type="button"
                                className="security-eye-btn"
                                onClick={() => setShowConfirm((v) => !v)}
                            >
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className="security-field-error">{errors.confirmPassword}</span>
                        )}
                    </div>

                    {/* Rules for password */}
                    <div className="security-rules-box">
                        <div className="security-rules-title">Rules for password</div>
                        <div className="security-rules-desc">
                            To create a new password, you have to meet all of the following requirements.
                        </div>
                        <ul className="security-rules-list">
                            {rules.map((rule, i) => (
                                <li key={i}>
                                    <span
                                        className={`security-rule-dot ${
                                            newPassword && rule.check(newPassword) ? "rule-met" : ""
                                        }`}
                                    />
                                    {rule.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="security-save-row">
                        <button className="security-btn-cancel" onClick={handleCancel} disabled={saving}>
                            Cancel
                        </button>
                        <button className="security-btn-save" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSecurity;
