"use client";

import ProtectedRoute from "./components/ProtectedRoute";
import DashLeftSideBar from "./components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import DashMid from "./components/Dashboard/dashMid/DashMid";
import DashRightSideBar from "./components/Dashboard/dashRightSideBar/DashRightSideBar";
import "./styles/Dashboard.css";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <DashLeftSideBar />
        <DashMid />
        <DashRightSideBar />
      </div>
    </ProtectedRoute>
  );
}
