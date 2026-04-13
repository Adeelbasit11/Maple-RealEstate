"use client";

import ProtectedRoute from "../../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import EditProduct from "../../../../../components/Ecommerce/EditProduct/EditProduct";

export default function EditProductPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <EditProduct />
            </div>
        </ProtectedRoute>
    );
}
