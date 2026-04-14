"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import OrderDetail from "../../../../components/Ecommerce/OrderDetail/OrderDetail";

export default function OrderDetailPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <OrderDetail />
            </div>
        </ProtectedRoute>
    );
}
