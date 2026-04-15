"use client";

import { useState, useRef } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProducts } from "../../../context/ProductContext";
import "../../../styles/ProductList.css";

const ProductList = () => {
    const { products, loading, searchProducts, fetchProducts, deleteProduct, updateProduct } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (value.trim()) {
                searchProducts(value.trim());
            } else {
                fetchProducts();
            }
        }, 400);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const formData = new FormData();
        formData.append("status", newStatus);
        await updateProduct(id, formData);
        setEditingStatusId(null);
    };

    const formatPrice = (price?: number, currency?: string) => {
        if (price == null) return "$0";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="product-list-page">
            {/* Header */}
            <header className="product-list-header">
                <h2>Product List</h2>
                <div className="product-list-search">
                    <input
                        type="text"
                        placeholder="Search anything here..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Search size={18} className="search-icon" />
                </div>
            </header>

            {/* Main Container */}
            <div className="product-list-container">
                {loading ? (
                    <p style={{ padding: 20 }}>Loading...</p>
                ) : products.length === 0 ? (
                    <p style={{ padding: 20 }}>No products found.</p>
                ) : (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Sku</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td className="product-cell">
                                        <img
                                            src={product.image || "https://i.pravatar.cc/36"}
                                            alt={product.name}
                                            className="avatar"
                                        />
                                        <span className="product-name">{product.name}</span>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>{product.quantity ?? 0}</td>
                                    <td>{product.sku}</td>
                                    <td>{formatPrice(product.price, product.currency)}</td>
                                    <td>
                                        {editingStatusId === product._id ? (
                                            <select
                                                value={product.status}
                                                onChange={(e) => handleStatusChange(product._id, e.target.value)}
                                                onBlur={() => setEditingStatusId(null)}
                                                autoFocus
                                                style={{ padding: 4, borderRadius: 4, border: "1px solid #e5e7eb" }}
                                            >
                                                <option value="In Stock">In Stock</option>
                                                <option value="Out of Stock">Out of Stock</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`status-badge ${product.status === "In Stock" ? "in-stock" : "out-stock"}`}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setEditingStatusId(product._id)}
                                            >
                                                {product.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn edit-btn"
                                            title="Edit"
                                            onClick={() => router.push(`/ecommerce/products/edit/${product._id}`)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            title="Delete"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProductList;
