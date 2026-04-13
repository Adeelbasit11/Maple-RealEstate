"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import OrderList from "../../../../components/Ecommerce/OrderList/OrderList";

export default function OrderListPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <OrderList />
            </div>
        </ProtectedRoute>
    );
}
