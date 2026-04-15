"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { IProduct, IProductContext } from "../types";
import CONFIG from "../config";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

const ProductContext = createContext<IProductContext | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { user, loading: authLoading } = useAuth();

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(CONFIG.PRODUCTS_ENDPOINTS.BASE, { withCredentials: true });
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Fetch products failed";
            setError(msg);
            console.error("Fetch products failed", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchProducts = useCallback(async (query: string) => {
        try {
            setLoading(true);
            const res = await axios.get(`${CONFIG.PRODUCTS_ENDPOINTS.BASE}?q=${query}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setProducts(res.data.data);
                return { success: true, data: res.data.data };
            }
            return { success: false, data: [] };
        } catch (err: any) {
            console.error("Search products failed", err);
            return { success: false, data: [] };
        } finally {
            setLoading(false);
        }
    }, []);

    const getProduct = useCallback(async (id: string) => {
        try {
            const res = await axios.get(`${CONFIG.PRODUCTS_ENDPOINTS.BASE}/${id}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to fetch product";
            showToast(msg, "error");
            return { success: false, message: msg };
        }
    }, [showToast]);

    const createProduct = useCallback(async (formData: FormData) => {
        try {
            const res = await axios.post(CONFIG.PRODUCTS_ENDPOINTS.BASE, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                setProducts((prev) => [res.data.data, ...prev]);
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to create product";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [showToast]);

    const updateProduct = useCallback(async (id: string, formData: FormData) => {
        try {
            const res = await axios.put(`${CONFIG.PRODUCTS_ENDPOINTS.BASE}/${id}`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                setProducts((prev) => prev.map((p) => (p._id === id ? res.data.data : p)));
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to update product";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [showToast]);

    const deleteProduct = useCallback(async (id: string) => {
        try {
            const res = await axios.delete(`${CONFIG.PRODUCTS_ENDPOINTS.BASE}/${id}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setProducts((prev) => prev.filter((p) => p._id !== id));
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to delete product";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [showToast]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchProducts();
        } else if (!authLoading && !user) {
            setProducts([]);
            setError(null);
        }
    }, [user, authLoading, fetchProducts]);

    return (
        <ProductContext.Provider
            value={{
                products,
                loading,
                error,
                fetchProducts,
                searchProducts,
                createProduct,
                updateProduct,
                deleteProduct,
                getProduct,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
};
