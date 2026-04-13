"use client";

import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Cancel.css";

const CancelPage = () => {
    const { loading: authLoading } = useAuth();
    const [pageReady, setPageReady] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            setPageReady(true);
        }
    }, [authLoading]);

    return (
        <div className="cancel-container">
            {!pageReady ? (
                <>
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                    <div className="skeleton-buttons">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </>
            ) : (
                <>
                    <XCircle className="icon w-20 h-20" />
                    <h1>Payment Cancelled</h1>
                    <p>
                        Your subscription process was cancelled. No charges were made. If you had any trouble, feel free to try again or contact support.
                    </p>
                    <div className="btn-container">
                        <Link href="/pricing" className="btn pricing-btn">
                            Back to Pricing
                        </Link>
                        <Link href="/" className="btn home-btn">
                            Go to Dashboard
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default CancelPage;
