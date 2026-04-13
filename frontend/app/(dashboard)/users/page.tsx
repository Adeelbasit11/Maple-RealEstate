"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import DashLeftSideBar from "../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import Users from "../../components/Users/Users";
import "../../styles/Dashboard.css";

export default function UsersPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <Users />
            </div>
        </ProtectedRoute>
    );
}
