"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import CONFIG from "../config";
import { useAuth } from "../context/AuthContext";
import DashLeftSideBar from "../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import "../styles/Dashboard.css";
import "../styles/Pricing.css";

const pricingPlans = [
    {
        name: "Basic",
        displayName: "Free/Personal",
        subtitle: "For a Lifetime",
        defaultButtonText: "Current Plan",
        buttonStyle: "outlined" as const,
        features: [
            { text: "Unlimited Projects", highlighted: false },
            { text: "Share with 5 team members", highlighted: true },
            { text: "Sync across devices", highlighted: false },
            { text: "API Access", highlighted: true },
            { text: "Complete Documentation", highlighted: false },
            { text: "Integration help", highlighted: true },
        ],
    },
    {
        name: "Pro",
        displayName: "$89/Professional",
        subtitle: "/year",
        defaultButtonText: "Try for free",
        buttonStyle: "filled" as const,
        features: [
            { text: "Everything in free plan", highlighted: false },
            { text: "Unlimited projects", highlighted: true },
            { text: "Share with 5 team members", highlighted: false },
            { text: "30 day version history", highlighted: true },
            { text: "Complete Documentation", highlighted: true },
            { text: "Integration help", highlighted: true },
        ],
    },
    {
        name: "Enterprise",
        displayName: "Custom/Enterprise",
        subtitle: "Reach out for a quote",
        defaultButtonText: "Contact Us",
        buttonStyle: "filled" as const,
        features: [
            { text: "Everything in Team plan", highlighted: false },
            { text: "Advanced security", highlighted: true },
            { text: "Custom contract", highlighted: false },
            { text: "User provisioning ( SCIM)", highlighted: true },
            { text: "Complete Documentation", highlighted: true },
            { text: "SAML SSO", highlighted: false },
        ],
    },
];

const PricingPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const router = useRouter();

    // Determine current plan from user subscription
    useEffect(() => {
        if (user?.subscriptionPlan && user.subscriptionPlan !== "Free") {
            setCurrentPlan(user.subscriptionPlan);
        }
        // Once auth is done loading, mark page as ready
        if (!authLoading) {
            setPageReady(true);
        }
    }, [user, authLoading]);

    const isUpgrade = (newPlan: string): boolean => {
        const planRanks: { [key: string]: number } = {
            "Basic": 1,
            "Pro": 2,
            "Enterprise": 3,
        };
        return currentPlan ? planRanks[newPlan] > planRanks[currentPlan] : true;
    };

    const handleSubscription = async (planName: string) => {
        if (!user) {
            window.location.href = "/login";
            return;
        }

        try {
            setLoading(planName);
            const isUpgradeOption = isUpgrade(planName);
            
            // Check if it's a downgrade
            if (!isUpgradeOption && currentPlan) {
                // For downgrades, call the backend directly
                const res = await axios.post(
                    CONFIG.STRIPE_ENDPOINTS.PAYMENT_INTENT,
                    { 
                        plan: planName,
                        isUpgrade: false,
                        currentPlan: currentPlan || undefined
                    },
                    { withCredentials: true }
                );

                if (res.data.success && res.data.isDowngrade) {
                    alert("Plan downgrade scheduled. Changes will take effect at the end of your current billing cycle.");
                    setCurrentPlan(planName);
                } else {
                    alert("Something went wrong. Please try again.");
                }
            } else {
                // For upgrades or new subscriptions, redirect to custom checkout
                window.location.href = `/checkout?plan=${planName}&isUpgrade=${isUpgradeOption}`;
            }
        } catch (error) {
            console.error("Subscription Error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="dashboard-layout">
        <DashLeftSideBar />
        <div className="pricing-page">
            {!pageReady ? (
                // Skeleton Loader
                <div className="pricing-skeleton">
                    <div className="pricing-skeleton-header">
                        <div className="pricing-skeleton-title"></div>
                        <div className="pricing-skeleton-subtitle"></div>
                    </div>
                    <div className="pricing-skeleton-grid">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="pricing-skeleton-card">
                                <div className="pricing-skel pricing-skel-name"></div>
                                <div className="pricing-skel pricing-skel-sub"></div>
                                <div className="pricing-skel pricing-skel-btn"></div>
                                <div className="pricing-skel pricing-skel-features"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Page Header */}
                    <header className="pricing-page-header">
                        <h2 className="pricing-page-title">Pricing page</h2>
                        <div className="pricing-search-bar">
                            <input type="text" placeholder="Search anything here..." />
                            <Search size={16} className="pricing-search-icon" />
                        </div>
                    </header>

                    {/* Section Title */}
                    <div className="pricing-section-title">
                        <h1>Pricing</h1>
                        <p>Simple Pricing. No Hidden Fees. Advance Features for your business.</p>
                    </div>

                    {/* Plans Grid */}
                    <div className="pricing-plans-grid">
                        {pricingPlans.map((plan) => {
                            const isCurrent = currentPlan === plan.name;
                            const isUpgradeOption = !isCurrent && isUpgrade(plan.name);
                            let buttonText = plan.defaultButtonText;

                            if (isCurrent) {
                                buttonText = "Current Plan";
                            } else if (currentPlan && isUpgradeOption) {
                                buttonText = `Upgrade to ${plan.name}`;
                            } else if (currentPlan && !isUpgradeOption) {
                                buttonText = `Downgrade to ${plan.name}`;
                            }

                            return (
                                <div
                                    key={plan.name}
                                    className={`pricing-card ${isCurrent ? "pricing-card-current" : ""}`}
                                >
                                    <div className="pricing-card-top">
                                        <h2 className="pricing-card-name">{plan.displayName}</h2>
                                        <p className="pricing-card-subtitle">{plan.subtitle}</p>

                                        <button
                                            className={`pricing-card-btn ${isCurrent ? "pricing-btn-outlined" : "pricing-btn-filled"}`}
                                            onClick={() => handleSubscription(plan.name)}
                                            disabled={loading === plan.name || isCurrent}
                                        >
                                            {loading === plan.name ? "Processing..." : buttonText}
                                        </button>
                                    </div>

                                    <ul className="pricing-feature-list">
                                        {plan.features.map((feature) => (
                                            <li key={feature.text} className="pricing-feature-item">
                                                <span className={`pricing-checkbox ${feature.highlighted ? "filled" : ""}`}>
                                                    <Check size={12} />
                                                </span>
                                                <span className="pricing-feature-text">{feature.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
        </div>
    );
};

export default PricingPage;
