"use client";

import { Search } from "lucide-react";
import "../../../styles/ProductList.css";

const products = [
    { id: 1,  avatar: "https://i.pravatar.cc/36?img=1",  name: "BKLGO Hoodie",       category: "Clothing",     quantity: 12, sku: "243598234", salary: "$170,750", status: "In Stock" },
    { id: 2,  avatar: "https://i.pravatar.cc/36?img=2",  name: "MacBook Pro",         category: "Electronics",  quantity: 63, sku: "877712",    salary: "$433,060", status: "Out of Stock" },
    { id: 3,  avatar: "https://i.pravatar.cc/36?img=3",  name: "Metro Bar Stool",     category: "Furniture",    quantity: 86, sku: "0134729",   salary: "$320,800", status: "Out of Stock" },
    { id: 4,  avatar: "https://i.pravatar.cc/36?img=4",  name: "Alchimia Chair",      category: "Furniture",    quantity: 22, sku: "113213",    salary: "$170,750", status: "In Stock" },
    { id: 5,  avatar: "https://i.pravatar.cc/36?img=5",  name: "Fendi Gradient Coat", category: "Clothing",     quantity: 31, sku: "634729",    salary: "$86,000",  status: "Out of Stock" },
    { id: 6,  avatar: "https://i.pravatar.cc/36?img=6",  name: "Off White Cotton",    category: "Clothing",     quantity: 23, sku: "634729",    salary: "$433,060", status: "In Stock" },
    { id: 7,  avatar: "https://i.pravatar.cc/36?img=7",  name: "Y-3 Yohji Yamamoto", category: "Shoes",        quantity: 31, sku: "634729",    salary: "$162,700", status: "In Stock" },
    { id: 8,  avatar: "https://i.pravatar.cc/36?img=8",  name: "Fendi Gradient Coat", category: "Clothing",     quantity: 34, sku: "113213",    salary: "$372,000", status: "Out of Stock" },
    { id: 9,  avatar: "https://i.pravatar.cc/36?img=9",  name: "Metro Bar Stool",     category: "Furniture",    quantity: 59, sku: "877712",    salary: "$137,500", status: "In Stock" },
    { id: 10, avatar: "https://i.pravatar.cc/36?img=10", name: "MacBook Pro",         category: "Electronics",  quantity: 34, sku: "0134729",   salary: "$327,900", status: "Out of Stock" },
    { id: 11, avatar: "https://i.pravatar.cc/36?img=11", name: "BKLGO Hoodie",        category: "Clothing",     quantity: 41, sku: "877712",    salary: "$205,500", status: "Out of Stock" },
];

const ProductList = () => {
    return (
        <div className="product-list-page">
            {/* Header */}
            <header className="product-list-header">
                <h2>Product List</h2>
                <div className="product-list-search">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={18} className="search-icon" />
                </div>
            </header>

            {/* Main Container */}
            <div className="product-list-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Sku</th>
                            <th>Salary</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="product-cell">
                                    <img
                                        src={product.avatar}
                                        alt={product.name}
                                        className="avatar"
                                    />
                                    <span className="product-name">{product.name}</span>
                                </td>
                                <td>{product.category}</td>
                                <td>{product.quantity}</td>
                                <td>{product.sku}</td>
                                <td>{product.salary}</td>
                                <td>
                                    <span className={`status-badge ${product.status === "In Stock" ? "in-stock" : "out-stock"}`}>
                                        {product.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;
