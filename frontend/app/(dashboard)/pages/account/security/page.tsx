"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import AccountSecurity from "../../../../components/AccountSecurity/AccountSecurity";
import "../../../../styles/Dashboard.css";

export default function AccountSecurityPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <AccountSecurity />
            </div>
        </ProtectedRoute>
    );
}
