"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import CONFIG from "../../../config";
import "../../../styles/forms.css";
import React from "react";

const RegisterInvite = ({ params }: { params: Promise<{ token: string }> }) => {
    const router = useRouter();
    const { success, error: toastError } = useToast();

    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [invitationValid, setInvitationValid] = useState(false);
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: ""
    });

    const [fieldErrors, setFieldErrors] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        params.then((resolvedParams) => {
            setToken(resolvedParams.token);
        });
    }, [params]);

    useEffect(() => {
        if (!token) return;

        const verifyToken = async () => {
            try {
                const res = await fetch(`${CONFIG.AUTH_URL}/verify-invite/${token}`);
                const data = await res.json();

                if (res.ok && data.success) {
                    setInvitationValid(true);
                    setEmail(data.email);
                } else {
                    setInvitationValid(false);
                    setErrorMessage(data.message || "Invitation link is invalid or expired.");
                }
            } catch (err) {
                setInvitationValid(false);
                setErrorMessage("Server error. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (fieldErrors[e.target.id]) {
            setFieldErrors({ ...fieldErrors, [e.target.id]: "" });
        }
    };

    const validate = () => {
        const errors: any = {};
        if (!formData.name.trim()) errors.name = "Name is required";

        const phoneRegex = /^(\+92|0)?[3][0-9]{9}$/;
        if (!formData.phone.trim()) errors.phone = "Phone number is required";
        else if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ""))) errors.phone = "Enter valid Pakistani number.";

        if (!formData.password) errors.password = "Password is required";
        else if (formData.password.length < 8) errors.password = "Minimum 8 characters required.";

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        if (!token) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${CONFIG.AUTH_URL}/register-invited`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    token
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                success(data.message);
                setTimeout(() => router.push("/login"), 2000);
            } else {
                toastError(data.message || "Registration failed");
            }
        } catch (err) {
            toastError("Server error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="form-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loader">Verifying invitation...</div>
            </div>
        );
    }

    if (!invitationValid) {
        return (
            <div className="form-body">
                <div className="auth-wrapper" style={{ justifyContent: 'center' }}>
                    <div id="auth" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ color: '#ef4444', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        </div>
                        <h2>Link Expired</h2>
                        <p className="subb-text">{errorMessage}</p>
                        <Link href="/login" className="form-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>Go to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-body">
            <div className="auth-wrapper">
                <div id="auth">
                    <h2>Complete Registration</h2>
                    <p className="subb-text">Fill in your details to join the team</p>

                    <form className="form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="input-disabled"
                                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                            />
                            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Email cannot be changed.</p>
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                className={fieldErrors.name ? "input-error" : ""}
                            />
                            {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="03XXXXXXXXX"
                                value={formData.phone}
                                onChange={handleChange}
                                className={fieldErrors.phone ? "input-error" : ""}
                            />
                            {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
                        </div>

                        <div className="form-group password-group">
                            <label>Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Create your password"
                                value={formData.password}
                                onChange={handleChange}
                                className={fieldErrors.password ? "input-error" : ""}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7 1.05-2.1 2.6-3.9 4.46-5.16"></path><path d="M1 1l22 22"></path></svg>
                                )}
                            </button>
                            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                        </div>

                        <button className="form-btn" type="submit" disabled={submitting}>
                            {submitting ? "Registering..." : "Complete Registration"}
                        </button>
                    </form>
                    <p>Already have an account? <Link href="/login">Login</Link></p>
                </div>

                <div className="auth-side">
                    <div className="side-content">
                        <h3 className="right-text">Welcome! Almost there.</h3>
                        <img src="/woman.png" alt="register" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterInvite;
