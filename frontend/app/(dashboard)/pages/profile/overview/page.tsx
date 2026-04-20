"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import ProfileOverviewMid from "../../../../components/ProfileOverview/ProfileOverviewMid";
import ProfileOverviewRight from "../../../../components/ProfileOverview/ProfileOverviewRight";
import "../../../../styles/Dashboard.css";

export default function ProfileOverviewPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <ProfileOverviewMid />
                <ProfileOverviewRight />
            </div>
        </ProtectedRoute>
    );
}
