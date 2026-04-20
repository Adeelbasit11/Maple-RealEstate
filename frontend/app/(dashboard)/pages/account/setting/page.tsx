"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import AccountSetting from "../../../../components/AccountSetting/AccountSetting";
import "../../../../styles/Dashboard.css";

export default function AccountSettingPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <AccountSetting />
            </div>
        </ProtectedRoute>
    );
}
