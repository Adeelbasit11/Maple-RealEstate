"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import "../../../styles/OrderList.css";

const OrderList = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/orders");
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="order-list-page">
            {/* Header */}
            <header className="order-list-header">
                <h2>Order List</h2>
                <div className="order-list-search">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={18} className="search-icon" />
                </div>
            </header>

            {/* Main Container */}
            <div className="order-list-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Id</th>
                            <th>Status</th>
                            <th>Revenue</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order: any) => (
                            <tr key={order.id}>
                                <td className="customer-cell">
                                    <img
                                        src={order.customerAvatar || "https://i.pravatar.cc/36"}
                                        alt={order.customerName}
                                        className="avatar"
                                    />
                                    <div className="customer-info">
                                        <span className="customer-name">{order.customerName}</span>
                                        <span className="customer-email">{order.customerEmail}</span>
                                    </div>
                                </td>
                                <td>{order.productName}</td>
                                <td>{order.orderNumber}</td>
                                <td>{order.status}</td>
                                <td>
                                    <span className="revenue-badge">
                                        <span className={`revenue-dot ${(order.revenueStatus || "").toLowerCase()}`}></span>
                                        {order.revenueStatus}
                                    </span>
                                </td>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>
                                    <Link 
                                        href={`/ecommerce/orders/detail/${order.id}`}
                                        className="btn-view"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;
