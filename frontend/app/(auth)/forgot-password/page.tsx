"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "../../styles/forms.css";

const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const { success, error } = useToast();

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrMsg("");
        setMessage("");

        if (!email) {
            const txt = "Email is required";
            setErrMsg(txt);
            error(txt); // show toast only
            return;
        }

        setLoading(true);
        const result = await forgotPassword(email);
        setLoading(false);

        if (result.success) {
            setMessage(result.message);
            setSent(true);
            success(result.message); // toast only
        } else {
            setErrMsg(result.message);
            error(result.message); // toast only
        }
    };

    return (
        <div className="form-body">
            <div id="auth">
                <h2>Forgot Password</h2>

                <form className="form" id="forgotForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            id="forgotEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={sent}
                        />
                    </div>

                    <button className="form-btn" type="submit" disabled={loading || sent}>
                        {loading ? "Sending..." : sent ? "Email Sent ✓" : "Send Reset Link"}
                    </button>

                    {sent && <p style={{ marginTop: "1rem" }}><Link href="/login">Back to Login</Link></p>}
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
