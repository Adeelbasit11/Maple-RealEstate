"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import DashLeftSideBar from "../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import TeamManagement from "../../components/TeamManagement/TeamManagement";
import "../../styles/Dashboard.css";

export default function TeamPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <TeamManagement />
            </div>
        </ProtectedRoute>
    );
}
