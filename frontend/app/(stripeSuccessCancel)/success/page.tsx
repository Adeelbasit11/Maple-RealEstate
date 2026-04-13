"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Loader } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Success.css";

const SuccessPage = () => {
    const { user, refreshUser, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const planFromQuery = searchParams.get("plan");
    
    const [isLoading, setIsLoading] = useState(true);
    const [pageReady, setPageReady] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 5;

    useEffect(() => {
        // Mark page as ready once auth is loaded
        if (!authLoading) {
            setPageReady(true);
        }
    }, [authLoading]);

    useEffect(() => {
        let isMounted = true;
        let retryTimer: NodeJS.Timeout;

        const refreshUserWithRetry = async () => {
            // Wait 2 seconds before first refresh to allow webhook to process
            if (retryCount === 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            await refreshUser();

            // Check if subscription was updated
            if (isMounted) {
                // If still on Free plan, retry a few more times
                const currentUser = user;
                if (currentUser?.subscriptionPlan === "Free" && retryCount < maxRetries) {
                    setRetryCount(prev => prev + 1);
                    // Retry after 1.5 seconds
                    retryTimer = setTimeout(() => {
                        if (isMounted) {
                            refreshUserWithRetry();
                        }
                    }, 1500);
                } else {
                    setIsLoading(false);
                }
            }
        };

        if (pageReady) {
            refreshUserWithRetry();
        }

        return () => {
            isMounted = false;
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [pageReady]);

    return (
        <div className="success-container">
            {!pageReady ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                    <div className="skeleton-plan-info"></div>
                    <div className="skeleton-button"></div>
                </div>
            ) : (
                <>
            <div className={isLoading ? "icon loading" : "icon"}>
                {isLoading ? (
                    <Loader className="w-20 h-20" />
                ) : (
                    <CheckCircle className="w-20 h-20" />
                )}
            </div>
            <h1>Subscription Successful!</h1>
            <p className="subtitle">
                Thank you for subscribing! Your account has been updated, and you now have access to all your plan's features.
            </p>
            
            {!isLoading && user && (
                <div className="plan-info">
                    <div className="label">Your Current Plan</div>
                    <div className="value">{user.subscriptionPlan || planFromQuery || "Loading..."}</div>
                </div>
            )}
            
            {isLoading && (
                <p className="loading-text">
                    Loading your subscription details...
                </p>
            )}

            <Link href="/" className="dashboard-btn">
                Go to Dashboard
            </Link>
                </>
            )}
        </div>
    );
};

export default SuccessPage;