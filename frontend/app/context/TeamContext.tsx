"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { ITeamMember, ITeamContext } from "../types";
import CONFIG from "../config";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

const TeamContext = createContext<ITeamContext | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [teamMembers, setTeamMembers] = useState<ITeamMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { user, loading: authLoading } = useAuth();

    const fetchTeamMembers = useCallback(async () => {
        try {
            // Check subscription status before making API call
            if (user && user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing") {
                const msg = "Team Management requires an active subscription. Please upgrade your plan to access this feature.";
                setError(msg);
                setLoading(false);
                return; // Don't make the API call
            }
            
            setLoading(true);
            setError(null);
            const res = await axios.get(CONFIG.TEAM_ENDPOINTS.BASE, { withCredentials: true });
            if (res.data.success) {
                setTeamMembers(res.data.data);
            }
        } catch (err: any) {
            let msg = err.response?.data?.message || "Fetch team members failed";
            
            // Handle subscription error
            if (err.response?.status === 403) {
                msg = "👥 Team Management requires an active subscription. Please upgrade your plan to access this feature.";
                showToast(msg, "error");
            }
            
            setError(msg);
            console.error("Fetch team members failed", err);
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    const searchTeamMembers = useCallback(async (query: string) => {
        try {
            setLoading(true);
            const res = await axios.get(`${CONFIG.TEAM_ENDPOINTS.BASE}?q=${query}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setTeamMembers(res.data.data);
                return { success: true, data: res.data.data };
            }
            return { success: false, data: [] };
        } catch (err: any) {
            console.error("Search team members failed", err);
            return { success: false, data: [] };
        } finally {
            setLoading(false);
        }
    }, []);

    const createTeamMember = useCallback(async (memberData: any) => {
        try {
            const res = await axios.post(CONFIG.TEAM_ENDPOINTS.BASE, memberData, {
                withCredentials: true,
            });
            if (res.data.success) {
                setTeamMembers([res.data.data, ...teamMembers]);
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to add team member";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [teamMembers, showToast]);

    const updateTeamMember = useCallback(async (id: string, memberData: any) => {
        try {
            const res = await axios.put(`${CONFIG.TEAM_ENDPOINTS.BASE}/${id}`, memberData, {
                withCredentials: true,
            });
            if (res.data.success) {
                setTeamMembers(teamMembers.map((m) => (m._id === id ? res.data.data : m)));
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to update team member";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [teamMembers, showToast]);

    const deleteTeamMember = useCallback(async (id: string) => {
        try {
            const res = await axios.delete(`${CONFIG.TEAM_ENDPOINTS.BASE}/${id}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setTeamMembers(teamMembers.filter((m) => m._id !== id));
                showToast(res.data.message, "success");
                return res.data;
            }
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to delete team member";
            showToast(msg, "error");
            return err.response?.data || { success: false, message: msg };
        }
    }, [teamMembers, showToast]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchTeamMembers();
        } else if (!authLoading && !user) {
            setTeamMembers([]);
            setError(null);
        }
    }, [user, authLoading, fetchTeamMembers]);

    return (
        <TeamContext.Provider
            value={{
                teamMembers,
                loading,
                error,
                fetchTeamMembers,
                searchTeamMembers,
                createTeamMember,
                updateTeamMember,
                deleteTeamMember,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error("useTeam must be used within a TeamProvider");
    }
    return context;
};
