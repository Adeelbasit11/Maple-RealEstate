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
                <div style={{ flex: 1, overflow: "hidden", height: "100vh", display: "flex", flexDirection: "column" }}>
                    <ChatPage />
                </div>
            </div>
        </ProtectedRoute>
    );
}
