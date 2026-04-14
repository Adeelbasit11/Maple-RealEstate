"use client";

import { useState } from "react";
import { Search, Info, Camera } from "lucide-react";
import "../../../styles/OrderDetail.css";

const steps = [
    { number: 1, label: "Order received" },
    { number: 2, label: "Order generate" },
    { number: 3, label: "Order transmited" },
    { number: 4, label: "Order delivered" },
];

const OrderDetail = () => {
    const [rating, setRating] = useState(3);

    return (
        <div className="order-detail-page">
            {/* Header */}
            <header className="order-detail-header">
                <h2>Order Detail</h2>
                <div className="order-detail-search">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={18} className="search-icon" />
                </div>
            </header>

            {/* Stepper */}
            <div className="order-stepper">
                {steps.map((step, index) => (
                    <div key={step.number} className="order-step">
                        <div className="step-unit">
                            <div className="step-circle active">{step.number}</div>
                            <span className="step-label">{step.label}</span>
                        </div>
                        {index < steps.length - 1 && <div className="step-line"></div>}
                    </div>
                ))}
            </div>

            {/* Main Container */}
            <div className="order-detail-container">
                {/* Order Details Section */}
                <div className="order-info-section">
                    <div className="order-info-left">
                        <h3>Order details</h3>
                        <div className="order-info-rows">
                            <div className="info-row">
                                <span className="info-label">Order no:</span>
                                <span className="info-value">EL-5414587</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">From:</span>
                                <span className="info-value">25 Dec, 2022</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Code:</span>
                                <span className="info-value">EL005</span>
                            </div>
                        </div>
                    </div>
                    <div className="order-info-right">
                        <button className="btn-invoice">Invoice</button>
                    </div>
                </div>

                {/* Product detail + Billing Information */}
                <div className="detail-grid">
                    {/* Product Detail */}
                    <div className="detail-section">
                        <h4>Product detail</h4>
                        <div className="detail-card">
                            <div className="product-detail-content">
                                <div className="product-avatar">
                                    <Camera size={22} color="#fff" />
                                </div>
                                <div className="product-detail-info">
                                    <span className="product-detail-name">Camera</span>
                                    <span className="product-detail-price">$200</span>
                                    <span className="product-detail-delivery">Order was delivered 2 days ago</span>
                                    <span className="product-detail-status">Delivered</span>
                                </div>
                            </div>
                            <Info size={16} className="info-icon" />
                        </div>
                    </div>

                    {/* Billing Information */}
                    <div className="detail-section">
                        <h4>Billing Information</h4>
                        <div className="detail-card">
                            <div className="billing-info-content">
                                <span className="billing-name">Oliver Liam</span>
                                <div className="billing-rows">
                                    <div className="billing-row">
                                        <span className="billing-label">Company Name :</span>
                                        <span className="billing-value">Viking Burrito</span>
                                    </div>
                                    <div className="billing-row">
                                        <span className="billing-label">Email Address :</span>
                                        <span className="billing-value">Oliver.viking@burrito.com</span>
                                    </div>
                                    <div className="billing-row">
                                        <span className="billing-label">VAT number :</span>
                                        <span className="billing-value">FRB1235476</span>
                                    </div>
                                </div>
                            </div>
                            <Info size={16} className="info-icon" />
                        </div>
                    </div>
                </div>

                {/* Payment detail + Order Summary + Review */}
                <div className="detail-grid">
                    {/* Payment Detail */}
                    <div className="detail-section">
                        <h4>Payment detail</h4>
                        <div className="detail-card payment-card">
                            <div className="payment-content">
                                <div className="payment-top">
                                    <span className="payment-type">Master Card</span>
                                    <Info size={16} className="info-icon-inline" />
                                </div>
                                <span className="payment-number">Master 1234 **** 58745</span>
                                <span className="payment-expiry">Expire 12/23</span>
                                <div className="payment-bottom">
                                    <span className="payment-holder">Aiden Max</span>
                                    <img src="/mastercard.png" alt="mastercard" className="mastercard-logo" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary + Review side by side */}
                    <div className="detail-section">
                        <h4>Order Summary</h4>
                        <div className="summary-review-row">
                            <div className="summary-content">
                                <div className="summary-row">
                                    <span className="summary-label">Product Price :</span>
                                    <span className="summary-value">$200</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Delivery :</span>
                                    <span className="summary-value">$10</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Taxes :</span>
                                    <span className="summary-value">$20</span>
                                </div>
                                <div className="summary-row total">
                                    <span className="summary-label">Total :</span>
                                    <span className="summary-value">$230</span>
                                </div>
                            </div>
                            <div className="review-content">
                                <p className="review-text">Do you like the product?<br />leave us a review here</p>
                                <div className="star-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`star ${star <= rating ? "filled" : ""}`}
                                            onClick={() => setRating(star)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <button className="btn-submit-review">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
