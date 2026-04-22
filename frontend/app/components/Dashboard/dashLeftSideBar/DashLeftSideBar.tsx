"use client";

import { useState, useEffect, useCallback } from "react";
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
    X,
    MoreVertical
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

import "../../../styles/DashLeftSideBar.css";

const DashLeftSideBar = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const [openMenu, setOpenMenu] = useState<string | null>("home");
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    // sidebar toggle for mobile/tablet
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    // close sidebar on route change (mobile navigation)
    useEffect(() => {
        closeSidebar();
    }, [pathname, closeSidebar]);

    // close on Escape key & lock body scroll when open
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeSidebar();
        };
        if (sidebarOpen) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [sidebarOpen, closeSidebar]);

    const toggleMenu = (menu: string) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const toggleSubMenu = (menu: string) => {
        setOpenSubMenu(openSubMenu === menu ? null : menu);
    };

    // Auto-expand menus based on current path
    useEffect(() => {
        const homePaths = ["/", "/team", "/users", "/pricing"];
        const pagesPaths = ["/pages/profile", "/pages/users", "/pages/account"];
        const profilePaths = ["/pages/profile"];
        const usersPaths = ["/pages/users"];
        const accountPaths = ["/pages/account"];
        const ecommercePaths = ["/ecommerce/overview", "/ecommerce/products/new", "/ecommerce/products/edit", "/ecommerce/products/list", "/ecommerce/orders/list", "/ecommerce/orders/detail"];
        const productPaths = ["/ecommerce/products/new", "/ecommerce/products/edit", "/ecommerce/products/list"];
        const orderPaths = ["/ecommerce/orders/list", "/ecommerce/orders/detail"];

        if (homePaths.includes(pathname)) {
            setOpenMenu("home");
        } else if (pagesPaths.some(p => pathname?.startsWith(p))) {
            setOpenMenu("pages");
            if (profilePaths.some(p => pathname?.startsWith(p))) setOpenSubMenu("profile");
            else if (usersPaths.some(p => pathname?.startsWith(p))) setOpenSubMenu("users");
            else if (accountPaths.some(p => pathname?.startsWith(p))) setOpenSubMenu("account");
        } else if (ecommercePaths.some(p => pathname?.startsWith(p))) {
            setOpenMenu("ecommerce");
            if (productPaths.some(p => pathname?.startsWith(p))) setOpenSubMenu("products");
            else if (orderPaths.some(p => pathname?.startsWith(p))) setOpenSubMenu("orders");
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

                    {/* PAGES */}
                    <div className="menu-group">
                        <button
                            className={`menu-item ${openMenu === "pages" ? "active" : ""}`}
                            onClick={() => toggleMenu("pages")}
                        >
                            <span className="menu-link">
                                <FileText size={18} />
                                <span>Pages</span>
                            </span>
                            <ChevronDown
                                size={14}
                                className={`arrow ${openMenu === "pages" ? "rotate" : ""}`}
                            />
                        </button>

                        {openMenu === "pages" && (
                            <div className="submenu">
                                {/* Profile */}
                                <div className="submenu-item">
                                    <button
                                        className={`submenu-link flex-between ${openSubMenu === "profile" ? "active" : ""}`}
                                        onClick={() => toggleSubMenu("profile")}
                                    >
                                        <span>Profile</span>
                                        <ChevronDown
                                            size={12}
                                            className={`arrow ${openSubMenu === "profile" ? "rotate" : ""}`}
                                        />
                                    </button>
                                    {openSubMenu === "profile" && (
                                        <div className="nested-submenu">
                                            <Link href="/pages/profile/overview" className={`nested-link ${pathname === "/pages/profile/overview" ? "active" : ""}`}>
                                                Overview
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Users */}
                                {/* <div className="submenu-item">
                                    <button
                                        className={`submenu-link flex-between ${openSubMenu === "users" ? "active" : ""}`}
                                        onClick={() => toggleSubMenu("users")}
                                    >
                                        <span>Users</span>
                                        <ChevronDown
                                            size={12}
                                            className={`arrow ${openSubMenu === "users" ? "rotate" : ""}`}
                                        />
                                    </button>
                                    {openSubMenu === "users" && (
                                        <div className="nested-submenu">
                                            <Link href="/pages/users/list" className={`nested-link ${pathname === "/pages/users/list" ? "active" : ""}`}>
                                                List
                                            </Link>
                                        </div>
                                    )}
                                </div> */}

                                {/* Account */}
                                <div className="submenu-item">
                                    <button
                                        className={`submenu-link flex-between ${openSubMenu === "account" ? "active" : ""}`}
                                        onClick={() => toggleSubMenu("account")}
                                    >
                                        <span>Account</span>
                                        <ChevronDown
                                            size={12}
                                            className={`arrow ${openSubMenu === "account" ? "rotate" : ""}`}
                                        />
                                    </button>
                                    {openSubMenu === "account" && (
                                        <div className="nested-submenu">
                                            <Link href="/pages/account/setting" className={`nested-link ${pathname === "/pages/account/setting" ? "active" : ""}`}>
                                                Setting
                                            </Link>
                                           
                                            <Link href="/pages/account/security" className={`nested-link ${pathname === "/pages/account/security" ? "active" : ""}`}>
                                                Security
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Projects */}
                                {/* <div className="submenu-item">
                                    <button
                                        className={`submenu-link flex-between ${openSubMenu === "projects" ? "active" : ""}`}
                                        onClick={() => toggleSubMenu("projects")}
                                    >
                                        <span>Projects</span>
                                        <ChevronDown
                                            size={12}
                                            className={`arrow ${openSubMenu === "projects" ? "rotate" : ""}`}
                                        />
                                    </button>
                                </div> */}

                                {/* <Link href="/pages/pricing" className={`submenu-link ${pathname === "/pages/pricing" ? "active" : ""}`}>
                                    Pricing page
                                </Link>
                                <Link href="/pages/charts" className={`submenu-link ${pathname === "/pages/charts" ? "active" : ""}`}>
                                    Charts
                                </Link>
                                <Link href="/pages/notification" className={`submenu-link ${pathname === "/pages/notification" ? "active" : ""}`}>
                                    Notification
                                </Link> */}
                                <Link href="/pages/chat" className={`submenu-link ${pathname === "/pages/chat" ? "active" : ""}`}>
                                    Chat
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
                                            <Link href="/ecommerce/orders/detail" className={`nested-link ${pathname?.startsWith("/ecommerce/orders/detail") ? "active" : ""}`}>
                                                Order Detail
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </nav>

                {/* USER PROFILE CARD */}
                {user && (
                    <div className="sidebar-user-card">
                        <div className="sidebar-user-avatar">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        [user.name, user.lastName].filter(Boolean).join(" ")
                                    )}&background=7c3aed&color=fff&size=80`}
                                    alt={user.name}
                                />
                            )}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">
                                {[user.name, user.lastName].filter(Boolean).join(" ")}
                            </span>
                            <span className="sidebar-user-email">{user.email}</span>
                        </div>
                        <button className="sidebar-user-menu-btn">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default DashLeftSideBar;
