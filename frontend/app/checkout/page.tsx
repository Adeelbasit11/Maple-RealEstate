"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import CONFIG from "../config";
import { useAuth } from "../context/AuthContext";
import "../styles/Checkout.css";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface PaymentIntentResponse {
    success: boolean;
    clientSecret: string;
    paymentIntentId: string;
    plan: string;
    amount: number;
    currency: string;
    planName: string;
}

interface PaymentMethod {
    type: string;
    id: string;
}

const CheckoutForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const stripe = useStripe();
    const elements = useElements();
    const { user, loading: authLoading } = useAuth();

    const plan = searchParams.get("plan");
    const isUpgrade = searchParams.get("isUpgrade") === "true";

    const [clientSecret, setClientSecret] = useState("");
    const [paymentIntentId, setPaymentIntentId] = useState("");
    const [planPrice, setPlanPrice] = useState("");
    const [originalAmount, setOriginalAmount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [currency, setCurrency] = useState("usd");
    const [loading, setLoading] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [promoCodeApplied, setPromoCodeApplied] = useState(false);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cardholderName, setCardholderName] = useState("");
    const [email, setEmail] = useState("");
    const [promoCodeId, setPromoCodeId] = useState(""); 
    const [pageReady, setPageReady] = useState(false);

    // Check auth and plan
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else if (!plan) {
                router.push("/pricing");
            } else {
                setEmail(user.email || "");
                setPageReady(true);
            }
        }
    }, [user, authLoading, plan, router]);

    // Create payment intent when plan is loaded
    useEffect(() => {
        if (!pageReady || !plan) return;

        const createPaymentIntentRequest = async () => {
            try {
                setLoading(true);
                const response = await axios.post<PaymentIntentResponse>(
                    CONFIG.STRIPE_ENDPOINTS.PAYMENT_INTENT,
                    {
                        plan,
                        isUpgrade,
                        currentPlan: user?.subscriptionPlan,
                    },
                    { withCredentials: true }
                );

                if (response.data.success) {
                    setClientSecret(response.data.clientSecret);
                    setPaymentIntentId(response.data.paymentIntentId);
                    const amount = response.data.amount;
                    setPlanPrice(`${(amount / 100).toFixed(2)}`);
                    setOriginalAmount(amount);
                    setFinalAmount(amount);
                    setDiscountAmount(0);
                    setPromoCodeApplied(false);
                    setPromoError(null);
                    setCurrency(response.data.currency);
                } else {
                    setError("Failed to initialize payment");
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to create payment intent");
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntentRequest();
    }, [pageReady, plan, isUpgrade, user?.subscriptionPlan]);

    const handleApplyPromoCode = async (e: React.FormEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault?.();
        }

        if (!promoCode.trim()) {
            setPromoError("Please enter a promo code");
            return;
        }

        setPromoLoading(true);
        setPromoError(null);

        try {
            const response = await axios.post(
                CONFIG.STRIPE_ENDPOINTS.VALIDATE_PROMO_CODE,
                {
                    code: promoCode,
                    plan,
                    paymentIntentId, // Send this to update the PaymentIntent amount
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                setDiscountAmount(response.data.discountValue);
                setFinalAmount(response.data.finalAmount);
                setPromoCodeApplied(true);
                setPromoCodeId(response.data.code); // Save the promo code ID
                setPromoError(null);
            } else {
                setPromoError(response.data.message || "Invalid promo code");
            }
        } catch (err: any) {
            setPromoError(err.response?.data?.message || "Failed to validate promo code");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromoCode = async () => {
        setPromoCode("");
        setPromoCodeApplied(false);
        setPromoCodeId("");
        setDiscountAmount(0);
        setFinalAmount(originalAmount);
        setPromoError(null);

        // Revert PaymentIntent amount if a promo code was removed
        if (paymentIntentId) {
            try {
                // To revert the amount, we can re-create or update it by calling creating payment intent endpoint again
                const response = await axios.post<PaymentIntentResponse>(
                    CONFIG.STRIPE_ENDPOINTS.PAYMENT_INTENT,
                    {
                        plan,
                        isUpgrade,
                        currentPlan: user?.subscriptionPlan,
                    },
                    { withCredentials: true }
                );

                if (response.data.success) {
                    setClientSecret(response.data.clientSecret);
                    setPaymentIntentId(response.data.paymentIntentId);
                }
            } catch (err: any) {
                console.error("Failed to restore original PaymentIntent amount", err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            setError("Payment system is not ready");
            return;
        }

        if (!cardholderName.trim()) {
            setError("Please enter cardholder name");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Confirm payment with card
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                setError("Card element not found");
                setLoading(false);
                return;
            }

            const { paymentIntent, error: paymentError } =
                await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: cardholderName,
                            email: email,
                        },
                    },
                    setup_future_usage: "on_session",
                });

            if (paymentError) {
                setError(paymentError.message || "Payment failed");
                setLoading(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === "succeeded") {
                // Confirm payment with backend
                try {
                    const confirmResponse = await axios.post(
                        CONFIG.STRIPE_ENDPOINTS.CONFIRM_PAYMENT,
                        {
                            paymentIntentId: paymentIntent.id,
                            plan,
                            isUpgrade,
                            promoCodeId: promoCodeApplied ? promoCodeId : undefined,
                        },
                        { withCredentials: true }
                    );

                    if (confirmResponse.data.success) {
                        // Redirect to success page
                        router.push(`/success?plan=${plan}`);
                    } else {
                        setError(
                            confirmResponse.data.message ||
                            "Failed to confirm payment"
                        );
                    }
                } catch (confirmError: any) {
                    setError(
                        confirmError.response?.data?.message ||
                        "Failed to process payment confirmation"
                    );
                }
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!pageReady) {
        return (
            <div className="checkout-container">
                <div className="checkout-loading">
                    <div className="spinner"></div>
                    <p>Loading checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-card">
                <div className="checkout-header">
                    <h1>Checkout</h1>
                    <p className="checkout-subtitle">
                        Complete your {plan} plan subscription
                    </p>
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                    <div className="summary-item">
                        <span className="summary-label">Plan</span>
                        <span className="summary-value">{plan}</span>
                    </div>
                    {planPrice && (
                        <div className="summary-item">
                            <span className="summary-label">Base Price</span>
                            <span className="summary-value">
                                {currency.toUpperCase()} {planPrice}
                            </span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="summary-item discount-item">
                            <span className="summary-label">Discount</span>
                            <span className="summary-value discount-value">
                                - {currency.toUpperCase()} {(discountAmount / 100).toFixed(2)}
                            </span>
                        </div>
                    )}
                    {finalAmount > 0 && (
                        <div className="summary-item total-item">
                            <span className="summary-label">Total Due</span>
                            <span className="summary-value total-value">
                                {currency.toUpperCase()} {(finalAmount / 100).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="checkout-form">
                    {/* Cardholder Name */}
                    <div className="form-group">
                        <label htmlFor="cardholderName" className="form-label">
                            Full Name
                        </label>
                        <input
                            id="cardholderName"
                            type="text"
                            className="form-input"
                            placeholder="Muhammad Adeel Basit"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            disabled
                        />
                    </div>

                    {/* Promo Code */}
                    {!promoCodeApplied && (
                        <div className="promo-form">
                            <div className="form-group">
                                <label htmlFor="promoCode" className="form-label">
                                    Have a Promo Code?
                                </label>
                                <div className="promo-input-group">
                                    <input
                                        id="promoCode"
                                        type="text"
                                        className="form-input promo-input"
                                        placeholder="Enter promo code..."
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        disabled={promoLoading}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleApplyPromoCode(e as any);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="promo-button"
                                        disabled={promoLoading || !promoCode.trim()}
                                        onClick={(e) => handleApplyPromoCode(e as any)}
                                    >
                                        {promoLoading ? "Checking..." : "Apply"}
                                    </button>
                                </div>
                                {promoError && (
                                    <span className="promo-error">{promoError}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {promoCodeApplied && (
                        <div className="promo-applied">
                            <div className="promo-applied-info">
                                <span className="promo-applied-text">
                                    ✓ Promo code "{promoCode}" applied
                                </span>
                                <button
                                    type="button"
                                    className="promo-remove-button"
                                    onClick={handleRemovePromoCode}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}



                    {/* Card Element */}
                    <div className="form-group">
                        <label className="form-label">Card Details</label>
                        <div className="card-element-wrapper">
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: "15px",
                                            color: "#1a1a1a",
                                            fontFamily: "'Inter', sans-serif",
                                            "::placeholder": {
                                                color: "#aaa",
                                            },
                                        },
                                        invalid: {
                                            color: "#d32f2f",
                                        },
                                    },
                                    hidePostalCode: false,
                                }}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!stripe || loading || !clientSecret}
                        className="checkout-button"
                    >
                        {loading ? (
                            <>
                                <span className="spinner-inline"></span>
                                Processing...
                            </>
                        ) : (
                            `Pay ${currency.toUpperCase()} ${(finalAmount / 100).toFixed(2) || "..."}`
                        )}
                    </button>

                    {/* Security Info */}
                    <div className="security-info">
                        <p>🔒 Your payment information is secure and encrypted</p>
                    </div>

                    {/* Back to Pricing */}
                    <button
                        type="button"
                        className="back-button"
                        onClick={() => router.push("/pricing")}
                        disabled={loading}
                    >
                        ← Back to Pricing
                    </button>
                </form>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
};

export default CheckoutPage;