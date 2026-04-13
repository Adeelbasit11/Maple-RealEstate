"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateLoginForm } from "../../utils/validations";
import PasswordToggle from "../../components/UI/PasswordToggle";
import "../../styles/forms.css";

const Login = () => {
    const { login, user, loading: authLoading } = useAuth();
    const { success, error } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            router.replace("/");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            success("Email verified successfully. You can now login.");
        } else if (searchParams.get("verified") === "false") {
            error("Verification link expired or invalid.");
        }
    }, [searchParams, success, error]);

    if (authLoading || user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFieldErrors({ email: "", password: "" });

        const errors = validateLoginForm(email, password);

        if (Object.keys(errors).length > 0) {
            setFieldErrors((errors as any));
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            success(result.message);
            setTimeout(() => router.push("/"), 1200);
        } else {
            error(result.message || "Incorrect Email or Password");
        }
    };

    return (
        <div className="form-body">
            <div className="auth-wrapper">
                {/* LEFT FORM */}
                <div id="auth">
                    <h2>Login</h2>
                    <p className="subb-text">How do I get started lorem ipsum dolor sit amet?</p>

                    <form className="form" id="loginForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={fieldErrors.email ? "input-error" : ""}
                            />
                            {fieldErrors.email && (
                                <div className="field-error">{fieldErrors.email}</div>
                            )}
                        </div>

                        <div className="form-group password-group">
                            <label>Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                        <div className="forgot">
                            <Link href="/forgot-password">Forgot password</Link>
                        </div>

                        <button className="form-btn" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="social-login">
                        <button className="social-btn google">
                            <img className="login-icon" src="/Googlee.png" alt="google" />
                            Sign in with Google
                        </button>
                        <button className="social-btn facebook">
                            <img className="login-icon" src="/Facebook.png" alt="facebook" />
                            Sign in with Facebook
                        </button>
                    </div>

                    <p>Don&apos;t have an account? <Link href="/register">Sign up</Link></p>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-side">
                    <div className="side-content">
                        <h3 className="right-text">Very good works are waiting for you<br />Sign up Now</h3>
                        <img src="/woman.png" alt="login" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
