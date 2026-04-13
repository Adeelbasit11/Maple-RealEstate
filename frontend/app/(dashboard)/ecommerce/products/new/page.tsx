"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import NewProduct from "../../../../components/Ecommerce/NewProduct/NewProduct";

export default function NewProductPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <NewProduct />
            </div>
        </ProtectedRoute>
    );
}
