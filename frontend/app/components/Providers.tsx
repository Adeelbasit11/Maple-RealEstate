"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider, useToast } from "../context/ToastContext";
import { TeamProvider } from "../context/TeamContext";
import { UserProvider } from "../context/UserContext";
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
                        <ToastContainer />
                        {children}    {/* ye {children} => ye React ke props ka ek special prop hai jo ki component ke andar pass kiya gaya content ko represent karta hai. Jab aap Providers component ko use karte hain aur uske andar kuch JSX elements ya components pass karte hain, to wo content {children} ke through Providers component ke andar render hota hai. Iska matlab hai ki Providers component ke andar jo bhi content aap pass karenge wo {children} ke jagah par dikhai dega. */ }
                    </TeamProvider>
                </UserProvider>
            </AuthProvider>
        </ToastProvider>
    );
};
