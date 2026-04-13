"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, Zap, Crown, Rocket, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import CONFIG from "../config";
import { useAuth } from "../context/AuthContext";
import "../styles/Pricing.css";

const pricingPlans = [
    {
        name: "Basic",
        price: "$10",
        description: "Perfect for individuals and small projects.",
        features: ["Up to 5 Projects", "Basic Analytics", "Community Support", "1GB Storage"],
        icon: <Rocket className="w-8 h-8 text-blue-500" />,
        color: "blue",
    },
    {
        name: "Pro",
        price: "$25",
        description: "Ideal for growing teams and professionals.",
        features: ["Unlimited Projects", "Advanced Analytics", "Priority Support", "10GB Storage", "Custom Domains"],
        icon: <Zap className="w-8 h-8 text-purple-500" />,
        color: "purple",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "$100",
        description: "For large-scale operations and enterprises.",
        features: ["Everything in Pro", "Custom SLAs", "Dedicated Account Manager", "Unlimited Storage", "SSO & SAML"],
        icon: <Crown className="w-8 h-8 text-amber-500" />,
        color: "amber",
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
        <div className="pricing-container">
            {!pageReady ? (
                // Skeleton Loader
                <div className="skeleton-container">
                    <div className="skeleton-header">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-subtitle"></div>
                    </div>
                    <div className="skeleton-plans">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-card-content skeleton-icon"></div>
                                <div className="skeleton-card-content skeleton-name"></div>
                                <div className="skeleton-card-content skeleton-price"></div>
                                <div className="skeleton-card-content skeleton-description"></div>
                                <div className="skeleton-card-content skeleton-features"></div>
                                <div className="skeleton-card-content skeleton-button"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Actual Content
                <>
                    <div className="pricing-header" style={{ position: 'relative' }}>
                        <button 
                            onClick={() => router.back()} 
                            style={{ 
                                position: 'absolute', 
                                left: '20px', 
                                top: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#4b5563',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <ArrowLeft size={20} />
                            Back
                        </button>
                        <h1>Choose Your Plan</h1>
                        <p>Unlock premium features and scale your projects with our flexible pricing plans.</p>
                    </div>

                    <div className="plans-grid">
                {pricingPlans.map((plan) => {
                    const isCurrent = currentPlan === plan.name;
                    const isUpgradeOption = !isCurrent && isUpgrade(plan.name);
                    let buttonText = `Get Started with ${plan.name}`;
                    
                    if (isCurrent) {
                        buttonText = "✓ Current Plan";
                    } else if (isUpgradeOption) {
                        buttonText = `Upgrade to ${plan.name}`;
                    } else if (currentPlan) {
                        buttonText = `Downgrade to ${plan.name}`;
                    }

                    return (
                        <div key={plan.name} className={`plan-card ${plan.popular ? "popular" : ""} ${isCurrent ? "current-plan" : ""}`}>
                            {plan.popular && <div className="popular-badge">Most Popular</div>}
                            {isCurrent && (
                                <div style={{
                                    position: "absolute",
                                    top: "20px",
                                    right: "20px",
                                    background: "#10b981",
                                    color: "white",
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold"
                                }}>
                                    ✓
                                </div>
                            )}
                            <div className="plan-icon">{plan.icon}</div>
                            <h2 className="plan-name">{plan.name}</h2>
                            <div className="plan-price">
                                {plan.price}<span>/month</span>
                            </div>
                            <p className="plan-description">{plan.description}</p>
                            <ul className="plan-features">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="feature-item">
                                        <Check className="feature-icon w-5 h-5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`subscribe-btn btn-${plan.color}`}
                                onClick={() => handleSubscription(plan.name)}
                                disabled={loading === plan.name || isCurrent}
                                style={isCurrent ? { opacity: 0.6, cursor: "default" } : {}}
                            >
                                {loading === plan.name ? "Processing..." : buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>
                </>
            )}
        </div>
    );
};

export default PricingPage;
