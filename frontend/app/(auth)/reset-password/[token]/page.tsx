"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import "../../../styles/forms.css";
import React from "react";

const ResetPassword = ({ params }: { params: Promise<{ token: string }> }) => {
    const { verifyResetToken, resetPassword } = useAuth();
    const { success, error } = useToast();
    const router = useRouter();

    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState(""); // inline validation only
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        // Resolve the params promise to get the token
        params.then((resolvedParams) => {
            setToken(resolvedParams.token);
        });
    }, [params]);

    useEffect(() => {
        if (!token) return;

        const verify = async () => {
            const result = await verifyResetToken(token);

            if (!result.success) {
                error(result.message); // ✅ toast
                router.push("/login");
            }

            setVerifying(false);
        };
        verify();
    }, [token, verifyResetToken, router, error]);

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) return "Password must be at least 8 characters.";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(pwd))
            return "Use uppercase, lowercase, number & special char.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const pwdError = validatePassword(password);
        if (pwdError) {
            setFormError(pwdError); // ❗ inline validation only
            return;
        }

        if (!token) return;

        setLoading(true);
        const result = await resetPassword(token, password);
        setLoading(false);

        if (result.success) {
            success(result.message); // ✅ toast
            setTimeout(() => router.push("/login"), 1500);
        } else {
            error(result.message); // ✅ toast
        }
    };

    if (verifying)
        return (
            <div className="form-body">
                <h2>Verifying link...</h2>
            </div>
        );

    return (
        <div className="form-body">
            <div id="auth">
                <h2>Reset Password</h2>

                {/* INLINE VALIDATION ERROR ONLY */}
                {formError && <div className="alert alert-error">{formError}</div>}

                <form className="form" id="resetForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="form-btn" type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
