"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import ChatPage from "../../../components/Chat/ChatPage";
import "../../../styles/Dashboard.css";

export default function ChatPageRoute() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <ChatPage />
                </div>
            </div>
        </ProtectedRoute>
    );
}
