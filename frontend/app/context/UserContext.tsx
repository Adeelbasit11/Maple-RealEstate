"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { IUser, IUsersContext } from "../types";
import CONFIG from "../config";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

const UserContext = createContext<IUsersContext | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { user, loading: authLoading } = useAuth();

    const fetchUsers = useCallback(async () => {
        try {
            // Check subscription status before making API call
            if (user && user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing") {
                const msg = "📊 Users Management requires an active subscription. Please upgrade your plan to access this feature.";
                setError(msg);
                setLoading(false);
                return; // Don't make the API call
            }
            
            setLoading(true);
            setError(null);
            const res = await axios.get(CONFIG.USERS_ENDPOINTS.BASE, { withCredentials: true });
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (err: any) {
            let msg = err.response?.data?.message || "Fetch users failed";
            
            // Handle subscription error
            if (err.response?.status === 403) {
                msg = "Users Management requires an active subscription. Please upgrade your plan to access this feature.";
                showToast(msg, "error");
            }
            
            setError(msg);
            console.error("Fetch users failed", err);
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    const searchUsers = useCallback(async (query: string) => {
        try {
            setLoading(true);
            const res = await axios.get(`${CONFIG.USERS_ENDPOINTS.BASE}?q=${query}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setUsers(res.data.data);
                return { success: true, data: res.data.data };
            }
            return { success: false, data: [] };
        } catch (err: any) {
            console.error("Search users failed", err);
            return { success: false, data: [] };
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (userData: any) => {
        try {
            const res = await axios.post(CONFIG.USERS_ENDPOINTS.BASE, userData, {
                withCredentials: true,
            });
            if (res.data.success) {
                setUsers([res.data.data, ...users]);
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to add user";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [users, showToast]);

    const updateUser = useCallback(async (id: string, userData: any) => {
        try {
            const res = await axios.put(`${CONFIG.USERS_ENDPOINTS.BASE}/${id}`, userData, {
                withCredentials: true,
            });
            if (res.data.success) {
                setUsers(users.map((u) => (u._id === id ? res.data.data : u)));
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to update user";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [users, showToast]);

    const deleteUser = useCallback(async (id: string) => {
        try {
            const res = await axios.delete(`${CONFIG.USERS_ENDPOINTS.BASE}/${id}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setUsers(users.filter((u) => u._id !== id));
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to delete user";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [users, showToast]);

    const inviteUser = useCallback(async (email: string, role = "Viewer") => {
        try {
            const res = await axios.post(CONFIG.USERS_ENDPOINTS.INVITE, { email, role }, {
                withCredentials: true,
            });
            if (res.data.success) {
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to send invitation";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [showToast]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchUsers();
        } else if (!authLoading && !user) {
            setUsers([]);
            setError(null);
        }
    }, [user, authLoading, fetchUsers]);

    return (
        <UserContext.Provider
            value={{
                users,
                loading,
                error,
                fetchUsers,
                searchUsers,
                createUser,
                updateUser,
                deleteUser,
                inviteUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUsers must be used within a UserProvider");
    }
    return context;
};
