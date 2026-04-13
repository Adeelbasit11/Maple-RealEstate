"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    LayoutGrid,
    ShoppingCart,
    Shield,
    FileText,
    ChevronDown,
    Menu,
    X
} from "lucide-react";

import "../../../styles/DashLeftSideBar.css";

const DashLeftSideBar = () => {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState<string | null>("home");
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    // sidebar toggle for mobile/tablet
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleMenu = (menu: string) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const toggleSubMenu = (menu: string) => {
        setOpenSubMenu(openSubMenu === menu ? null : menu);
    };

    // Auto-expand menus based on current path
    useEffect(() => {
        const homePaths = ["/", "/team", "/users", "/pricing"];
        const ecommercePaths = ["/ecommerce/overview", "/ecommerce/products/new", "/ecommerce/products/edit", "/ecommerce/products/list", "/ecommerce/orders/list", "/ecommerce/orders/detail"];
        const productPaths = ["/ecommerce/products/new", "/ecommerce/products/edit", "/ecommerce/products/list"];
        const orderPaths = ["/ecommerce/orders/list", "/ecommerce/orders/detail"];

        if (homePaths.includes(pathname)) {
            setOpenMenu("home");
        } else if (ecommercePaths.includes(pathname)) {
            setOpenMenu("ecommerce");
            if (productPaths.includes(pathname)) setOpenSubMenu("products");
            else if (orderPaths.includes(pathname)) setOpenSubMenu("orders");
        }
    }, [pathname]);

    return (
        <>
            {/* MOBILE TOGGLE BUTTON */}
            <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu size={22} />
            </button>

            {/* OVERLAY */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <aside className={`left-sidebar ${sidebarOpen ? "open" : ""}`}>
                {/* TOP SECTION */}
                <div className="sidebar-top">
                    <div className="logo-container">
                        <Link href="/" className="logo-text">
                            <img src="/Frame.png" alt="Logo" />
                        </Link>
                    </div>

                    {/* CLOSE BUTTON */}
                    <button
                        className="close-btn"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {/* HOME */}
                    <div className="menu-group">
                        <button
                            className={`menu-item ${openMenu === "home" ? "active" : ""}`}
                            onClick={() => toggleMenu("home")}
                        >
                            <span className="menu-link">
                                <Home size={18} />
                                <span>Home</span>
                            </span>
                            <ChevronDown
                                size={14}
                                className={`arrow ${openMenu === "home" ? "rotate" : ""}`}
                            />
                        </button>

                        {openMenu === "home" && (
                        <div className="submenu">
                                <Link href="/" className={`submenu-link ${pathname === "/" ? "active" : ""}`}>
                                    Dashboard
                                </Link>
                                <Link href="/team" className={`submenu-link ${pathname === "/team" ? "active" : ""}`}>
                                    Team Management
                                </Link>
                                 <Link href="/users" className={`submenu-link ${pathname === "/users" ? "active" : ""}`}>
                                    Users
                                </Link>
                                 <Link href="/pricing" className={`submenu-link ${pathname === "/pricing" ? "active" : ""}`}>
                                    Pricing
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* E-COMMERCE */}
                    <div className="menu-group">
                        <button
                            className={`menu-item ${openMenu === "ecommerce" ? "active" : ""}`}
                            onClick={() => toggleMenu("ecommerce")}
                        >
                            <span className="menu-link">
                                <ShoppingCart size={18} />
                                <span>E-commerce</span>
                            </span>
                            <ChevronDown
                                size={14}
                                className={`arrow ${openMenu === "ecommerce" ? "rotate" : ""}`}
                            />
                        </button>

                        {openMenu === "ecommerce" && (
                            <div className="submenu">
                                <Link href="/ecommerce/overview" className={`submenu-link ${pathname === "/ecommerce/overview" ? "active" : ""}`}>
                                    Overview
                                </Link>

                                {/* Products */}
                                <div className="submenu-item">
                                    <button
                                        className={`submenu-link flex-between ${openSubMenu === "products" ? "active" : ""}`}
                                        onClick={() => toggleSubMenu("products")}
                                    >
                                        <span>Products</span>
                                        <ChevronDown
                                            size={12}
                                            className={`arrow ${openSubMenu === "products" ? "rotate" : ""}`}
                                        />
                                    </button>
                                    {openSubMenu === "products" && (
                                        <div className="nested-submenu">
                                            <Link href="/ecommerce/products/new" className={`nested-link ${pathname === "/ecommerce/products/new" ? "active" : ""}`}>
                                                New Product
                                            </Link>
                                            <Link href="/ecommerce/products/edit/1" className={`nested-link ${pathname?.startsWith("/ecommerce/products/edit") ? "active" : ""}`}>
                                                Edit Product
                                            </Link>
                                            <Link href="/ecommerce/products/list" className={`nested-link ${pathname === "/ecommerce/products/list" ? "active" : ""}`}>
                                                Product List
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Orders */}
                                <div className="submenu-item">
                                    <button
                                        className={`submenu-link flex-between ${openSubMenu === "orders" ? "active" : ""}`}
                                        onClick={() => toggleSubMenu("orders")}
                                    >
                                        <span>Orders</span>
                                        <ChevronDown
                                            size={12}
                                            className={`arrow ${openSubMenu === "orders" ? "rotate" : ""}`}
                                        />
                                    </button>
                                    {openSubMenu === "orders" && (
                                        <div className="nested-submenu">
                                            <Link href="/ecommerce/orders/list" className={`nested-link ${pathname === "/ecommerce/orders/list" ? "active" : ""}`}>
                                                Order list
                                            </Link>
                                            <Link href="/ecommerce/orders/detail" className={`nested-link ${pathname === "/ecommerce/orders/detail" ? "active" : ""}`}>
                                                Order Detail
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </nav>
            </aside>
        </>
    );
};

export default DashLeftSideBar;
