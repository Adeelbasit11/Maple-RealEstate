"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateRegisterForm } from "../../utils/validations";
import PasswordToggle from "../../components/UI/PasswordToggle";
import "../../styles/forms.css";

const Register = () => {
    const { register } = useAuth();
    const { success, error } = useToast();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const [fieldErrors, setFieldErrors] = useState<any>({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFieldErrors({
            name: "",
            email: "",
            phone: "",
            password: ""
        });

        const errors = validateRegisterForm(formData);

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            success(result.message);
            setTimeout(() => router.push("/login"), 1500);
        } else {
            error(result.message);
        }
    };

    return (
        <div className="form-body">
            <div className="auth-wrapper">
                {/* LEFT FORM */}
                <div id="auth">
                    <h2>Register</h2>
                    <p className="subb-text">Create your account to get started</p>

                    <form className="form" id="registerForm" onSubmit={handleSubmit}>
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
                            {fieldErrors.name && (
                                <div className="field-error">{fieldErrors.name}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className={fieldErrors.email ? "input-error" : ""}
                            />
                            {fieldErrors.email && (
                                <div className="field-error">{fieldErrors.email}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className={fieldErrors.phone ? "input-error" : ""}
                            />
                            {fieldErrors.phone && (
                                <div className="field-error">{fieldErrors.phone}</div>
                            )}
                        </div>

                        {/* Password group with toggle */}
                        <div className="form-group password-group">
                            <label>Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Create password"
                                value={formData.password}
                                onChange={handleChange}
                                className={fieldErrors.password ? "input-error" : ""}
                            />

                            <PasswordToggle
                                showPassword={showPassword}
                                onClick={() => setShowPassword(prev => !prev)}
                            />

                            {fieldErrors.password && (
                                <div className="field-error">{fieldErrors.password}</div>
                            )}
                        </div>

                        <button className="form-btn" type="submit" disabled={loading}>
                            {loading ? "Registering..." : "Create Account"}
                        </button>
                    </form>

                    <p>Already have an account? <Link href="/login">Login</Link></p>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-side">
                    <div className="side-content">
                        <h3 className="right-text">Join us today and start your journey</h3>
                        <img src="/woman.png" alt="register" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;