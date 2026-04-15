"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider, useToast } from "../context/ToastContext";
import { TeamProvider } from "../context/TeamContext";
import { UserProvider } from "../context/UserContext";
import { ProductProvider } from "../context/ProductContext";
import Toast from "./UI/Toast/Toast";

const ToastContainer = () => {
    const { toast, hideToast } = useToast();
    if (!toast) return null;

    return (
        <div className="toast-container">
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
};

export const Providers = ({ children }: { children: ReactNode }) => { // ye => { children }: { children: ReactNode } => ye TypeScript syntax hai jo ki props ke type ko define karta hai. Yahan par children ek ReactNode type ka prop hai, jo ki React ke kisi bhi valid element ko represent kar sakta hai (jaise ki JSX elements, strings, numbers, etc.). Isse ensure hota hai ki Providers component ke andar jo bhi content pass kiya jaye wo valid React content ho.
    return (
        <ToastProvider>
            <AuthProvider>
                <UserProvider>
                    <TeamProvider>
                        <ProductProvider>
                            <ToastContainer />
                            {children}
                        </ProductProvider>
                    </TeamProvider>
                </UserProvider>
            </AuthProvider>
        </ToastProvider>
    );
};
