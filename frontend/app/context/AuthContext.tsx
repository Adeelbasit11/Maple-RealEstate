"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { IUser, IAuthContext } from "../types";
import CONFIG from "../config";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [tokenStatus, setTokenStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await axios.get(CONFIG.AUTH_ENDPOINTS.CHECK_LOGIN, {
                withCredentials: true,
            });
            setUser(res.data);
            setTokenStatus(true);
        } catch (error) {
            setUser(null);
            setTokenStatus(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await axios.post(CONFIG.AUTH_ENDPOINTS.LOGIN, { email, password }, { withCredentials: true });
            if (res.data.success) {
                setUser(res.data.data);
                setTokenStatus(true);
                return { success: true, message: res.data.message };
            }
            return { success: false, message: res.data.message };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    };

    const register = async (userData: any) => {
        try {
            const res = await axios.post(CONFIG.AUTH_ENDPOINTS.REGISTER, userData);
            return { success: res.data.success, message: res.data.message };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const logout = async () => {
        try {
            await axios.post(CONFIG.AUTH_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
            setUser(null);
            setTokenStatus(false);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            const res = await axios.post(CONFIG.AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
            return { success: res.data.success, message: res.data.message };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Server error" };
        }
    };

    const verifyResetToken = async (token: string) => {
        try {
            const res = await axios.get(`${CONFIG.AUTH_ENDPOINTS.RESET_PASSWORD}/${token}`);
            return { success: res.data.success, message: res.data.message };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Invalid link" };
        }
    };

    const resetPassword = async (token: string, password: string) => {
        try {
            const res = await axios.post(`${CONFIG.AUTH_ENDPOINTS.RESET_PASSWORD}/${token}`, { password });
            return { success: res.data.success, message: res.data.message };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Reset failed" };
        }
    };

    const updateProfile = async (profileData: any) => {
        try {
            const isFormData = profileData instanceof FormData;
            const res = await axios.put(CONFIG.AUTH_ENDPOINTS.UPDATE_PROFILE, profileData, {
                withCredentials: true,
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
            });
            if (res.data.success) {
                setUser(res.data.data);
                return { success: true, message: res.data.message };
            }
            return { success: false, message: res.data.message };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Update failed" };
        }
    };

    const updateUserContext = (newData: Partial<IUser>) => {
        if (user) {
            setUser({ ...user, ...newData });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                tokenStatus,
                loading,
                login,
                register,
                logout,
                forgotPassword,
                verifyResetToken,
                resetPassword,
                updateProfile,
                updateUserContext,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
