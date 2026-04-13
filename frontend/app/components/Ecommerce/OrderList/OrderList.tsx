"use client";

import { Search } from "lucide-react";
import "../../../styles/OrderList.css";

const orders = [
    { id: 1,  avatar: "https://i.pravatar.cc/36?img=12", name: "David",    email: "david@gmail.com",    product: "BKLGO Hoodie",        orderId: "#10421", status: "243598234", revenue: "Paid",      date: "12 Jan, 2023" },
    { id: 2,  avatar: "https://i.pravatar.cc/36?img=13", name: "Warner",   email: "warner@gmail.com",   product: "MacBook Pro",          orderId: "#10422", status: "877712",    revenue: "Canceled",  date: "13 Jan, 2023" },
    { id: 3,  avatar: "https://i.pravatar.cc/36?img=14", name: "Smith",    email: "smith@gmail.com",    product: "Metro Bar Stool",      orderId: "#10423", status: "0134729",   revenue: "Refunded",  date: "14 Jan, 2023" },
    { id: 4,  avatar: "https://i.pravatar.cc/36?img=15", name: "Devo",     email: "devo@gmail.com",     product: "Alchimia Chair",       orderId: "#10424", status: "113213",    revenue: "Paid",      date: "15 Jan, 2023" },
    { id: 5,  avatar: "https://i.pravatar.cc/36?img=16", name: "Victory",  email: "victory@gmail.com",  product: "Fendi Gradient Coat",  orderId: "#10425", status: "634729",    revenue: "Paid",      date: "16 Jan, 2023" },
    { id: 6,  avatar: "https://i.pravatar.cc/36?img=17", name: "Henry",    email: "henry@gmail.com",    product: "Off White Cotton",     orderId: "#10426", status: "634729",    revenue: "Canceled",  date: "17 Jan, 2023" },
    { id: 7,  avatar: "https://i.pravatar.cc/36?img=18", name: "Mark",     email: "mark@gmail.com",     product: "Y-3 Yohji Yamamoto",  orderId: "#10427", status: "634729",    revenue: "Refunded",  date: "18 Jan, 2023" },
    { id: 8,  avatar: "https://i.pravatar.cc/36?img=19", name: "Anderson", email: "anderson@gmail.com", product: "Fendi Gradient Coat",  orderId: "#10426", status: "113213",    revenue: "Refunded",  date: "19 Jan, 2023" },
    { id: 9,  avatar: "https://i.pravatar.cc/36?img=20", name: "John",     email: "john@gmail.com",     product: "Metro Bar Stool",      orderId: "#10429", status: "877712",    revenue: "Paid",      date: "20 Jan, 2023" },
    { id: 10, avatar: "https://i.pravatar.cc/36?img=21", name: "Duplesis", email: "duplesis@gmail.com", product: "MacBook Pro",          orderId: "#10430", status: "0134729",   revenue: "Canceled",  date: "21 Jan, 2023" },
    { id: 11, avatar: "https://i.pravatar.cc/36?img=22", name: "Miz",      email: "miz@gmail.com",      product: "BKLGO Hoodie",         orderId: "#10431", status: "877712",    revenue: "Canceled",  date: "22 Jan, 2023" },
];

const OrderList = () => {
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
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="customer-cell">
                                    <img
                                        src={order.avatar}
                                        alt={order.name}
                                        className="avatar"
                                    />
                                    <div className="customer-info">
                                        <span className="customer-name">{order.name}</span>
                                        <span className="customer-email">{order.email}</span>
                                    </div>
                                </td>
                                <td>{order.product}</td>
                                <td>{order.orderId}</td>
                                <td>{order.status}</td>
                                <td>
                                    <span className="revenue-badge">
                                        <span className={`revenue-dot ${order.revenue.toLowerCase()}`}></span>
                                        {order.revenue}
                                    </span>
                                </td>
                                <td>{order.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;
