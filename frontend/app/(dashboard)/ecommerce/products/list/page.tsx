"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashLeftSideBar from "../../../../components/Dashboard/dashLeftSideBar/DashLeftSideBar";
import ProductList from "../../../../components/Ecommerce/ProductList/ProductList";

export default function ProductListPage() {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <DashLeftSideBar />
                <ProductList />
            </div>
        </ProtectedRoute>
    );
}
