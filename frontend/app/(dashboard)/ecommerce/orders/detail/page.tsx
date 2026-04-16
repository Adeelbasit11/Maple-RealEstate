"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import OrderList from "../../../../components/Ecommerce/OrderList/OrderList";

export default function OrderDetailPagePlaceholder() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <div style={{ flex: 1, padding: "20px", textAlign: "center" }}>
                    <h2>Please select an order from the list to view details.</h2>
                    <br />
                    <OrderList />
                </div>
            </div>
        </ProtectedRoute>
    );
}
