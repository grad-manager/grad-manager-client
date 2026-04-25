import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import {
    ChevronDown,
    User,
    Settings,
    LogOut,
    PieChart,
    CheckCircle,
    Mail,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { shouldRestrictAppAccess } from "../utils/trial";
import gradManager from "../assets/images/logo2.png";
// 1. IMPORT NotificationBell
import NotificationBell from './common/NotificationBell';

interface NavLink {
    to: string;
    label: string;
}

const RESTRICTED_DASHBOARD_PATHS = [
    "/dashboard",
    "/feeds",
    "/notifications",
    "/profile",
    "/connections",
    "/mentorship",
    "/projects",
    "/interview-prep",
    "/groups",
    "/community",
    "/tracker",
    "/ai-predictor",
    "/services/documents",
];

const Navbar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const [, setOpenMobileDropdowns] = useState<{ [key: string]: boolean }>({});

    // Destructuring currentUser, userProfile, logout, and the sendVerificationEmail function
    const { currentUser, userProfile, logout, sendVerificationEmail } = useAuth();
    const isSubscriptionLocked = !!currentUser && shouldRestrictAppAccess(userProfile);
    const subscriptionStatus = userProfile?.subscription?.status || '';
    const subscriptionPlan = userProfile?.subscription?.plan || '';
    const subscriptionStatusLabel = subscriptionStatus
        ? subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)
        : '';
    const subscriptionPlanLabel = subscriptionPlan
        ? subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)
        : '';
    const subscriptionPillLabel =
        subscriptionPlanLabel && subscriptionStatusLabel
            ? `${subscriptionPlanLabel} • ${subscriptionStatusLabel}`
            : subscriptionPlanLabel || subscriptionStatusLabel;

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setOpenMobileDropdowns({});
    };

    const resolveRestrictedDestination = (to: string) => {
        if (!isSubscriptionLocked) return to;
        if (!RESTRICTED_DASHBOARD_PATHS.some((path) => to === path || to.startsWith(`${path}/`))) {
            return to;
        }

        return `/subscribe?reason=trial-expired&next=${encodeURIComponent(to)}`;
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            console.error("Failed to log out");
        }
    };

    // Handler to resend verification email
    const handleResendVerification = async () => {
        if (!currentUser) return;

        try {
            await sendVerificationEmail();
            setVerificationSent(true);
            setIsProfileDropdownOpen(false); // Close dropdown after action

            setTimeout(() => setVerificationSent(false), 5000);

        } catch (error) {
            console.error("Failed to resend verification email:", error);
            alert("Failed to send verification email. Please try again later.");
            setIsProfileDropdownOpen(false);
        }
    };


    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target as Node)
            ) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Navigation links
    const mainLinks: NavLink[] = [
        { to: "/", label: "Home" },
        { to: "/about", label: "Our Mission" },
        { to: "/#features", label: "Features" },
        // ❌ REMOVE: Subscription/Pricing Link from the public links
        { to: "/contact", label: "Get in Touch" },
    ];

    const finalLinks: NavLink[] = [...mainLinks];

    // Modify home to dashboard if logged in
    if (currentUser) {
        const homeIndex = finalLinks.findIndex((link) => link.to === "/");
        if (homeIndex !== -1) {
            // 1. Change Home to Dashboard
            finalLinks[homeIndex] = {
                to: "/",
                label: "Dashboard",
            };

            // 2. 🆕 ADD: Feeds link right after Dashboard (index 1)
            finalLinks.splice(homeIndex + 1, 0, {
                to: "/feeds",
                label: "Feeds",
            });
            
            // 🆕 ADD: Subscription/Pricing Link (only for logged-in users)
            // Insert after "Features" (which is now at index 3)
            finalLinks.splice(4, 0, { 
                to: "/subscribe", 
                label: "Pricing" 
            });
        }
    }

    // Add role-based links
    // The indices below automatically shift due to the addition of "Feeds" at index 1 and "Pricing" at index 4.
    
    // In the logged-in case (before role links):
    // 0: Dashboard 
    // 1: Feeds
    // 2: Our Mission
    // 3: Features
    // 4: Pricing
    // 5: Get in Touch

    if (userProfile?.role === "admin") {
        // Splice positions adjusted due to new Feeds link
        finalLinks.splice(2, 0, { to: "/admin", label: "Admin Dashboard" });
        finalLinks.splice(3, 0, {
            to: "/admin/mentorship-connections",
            label: "Admin Connections",
        });
    }

    if (userProfile?.role === "mentor") {
        // Splice position adjusted due to new Feeds link
        finalLinks.splice(2, 0, {
            to: "/mentor/connections",
            label: "My Connections",
        });
    }

    // Animation variants (Unchanged)
    const menuVariants: Variants = {
        hidden: { x: "-100%" },
        visible: {
            x: 0,
            transition: { type: "tween", ease: "easeInOut", duration: 0.4 },
        },
        exit: {
            x: "-100%",
            transition: { type: "tween", ease: "easeInOut", duration: 0.4 },
        },
    };

    const overlayVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    // Avatar (Unchanged)
    const Avatar = ({
        size = 40,
        showBorder = true,
    }: {
        size?: number;
        showBorder?: boolean;
    }) => {
        const borderClasses = showBorder
            ? `border-2 border-white ring-2 ${
                  currentUser?.emailVerified ? "ring-green-500" : "ring-red-500"
              }`
            : "";

        if (userProfile?.photoURL) {
            return (
                <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    loading="lazy"
                    className={`rounded-full object-cover ${borderClasses}`}
                    style={{ width: `${size}px`, height: `${size}px` }}
                />
            );
        }

        return (
            <div
                className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-600 ${borderClasses}`}
                style={{ width: `${size}px`, height: `${size}px` }}
            >
                <User size={size / 2} />
            </div>
        );
    };

    // Profile menu (Unchanged)
    const ProfileMenu = () => {
        const isVerified = currentUser?.emailVerified;
        const verificationText = isVerified ? "Verified" : "Unverified";
        const verificationColor = isVerified ? "text-green-600" : "text-red-500";
        const verificationBg = isVerified ? "bg-green-100" : "bg-red-100";

        return (
            <div className="relative" ref={profileDropdownRef}>
                <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full focus:outline-none transition-shadow duration-150 hover:shadow-md"
                >
                    <Avatar />
                    <ChevronDown
                        size={16}
                        className={`text-gray-600 transition-transform ${
                            isProfileDropdownOpen ? "rotate-180" : "rotate-0"
                        }`}
                    />
                </button>

                <AnimatePresence>
                    {isProfileDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-3 w-64 origin-top-right bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
                        >
                            <div className="py-2">
                                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                    <p className="font-semibold truncate">
                                        {currentUser?.email || "User"}
                                    </p>
                                    <div className="flex items-center mt-0.5">
                                        <p className="text-xs text-blue-600 capitalize">
                                            {userProfile?.role || "user"}
                                        </p>
                                        <span
                                            className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${verificationBg} ${verificationColor} flex items-center`}
                                        >
                                            <CheckCircle size={12} className="mr-1" />
                                            {verificationText}
                                        </span>
                                    </div>
                                </div>

                                {/* 📧 Resend Verification Link */}
                                {!isVerified && (
                                    <button
                                        onClick={handleResendVerification}
                                        className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition border-b border-yellow-200"
                                    >
                                        <Mail size={18} className="mr-3 text-yellow-600" />
                                        Resend Verification Email
                                    </button>
                                )}
                                {/* 📧 End New Link */}


                                <Link
                                    to={resolveRestrictedDestination("/profile")}
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                                >
                                    <Settings size={18} className="mr-3" />
                                    View/Update Profile
                                </Link>

                                <Link
                                    to={resolveRestrictedDestination("/dashboard")}
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                                >
                                    <PieChart size={18} className="mr-3" />
                                    View Stats
                                </Link>

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsProfileDropdownOpen(false);
                                    }}
                                    className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition"
                                >
                                    <LogOut size={18} className="mr-3" />
                                    Log Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Resend Success Message */}
                <AnimatePresence>
                    {verificationSent && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 p-3 bg-green-500 text-white text-sm rounded-lg shadow-lg z-50 w-64 text-center"
                        >
                            Verification email sent! Check your inbox.
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        );
    };

    return (
        <nav className="p-6 bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200 -mt-24">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo Section (Unchanged) */}
                <div className="flex flex-col items-start">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <img
                            src={gradManager}
                            alt="Grad Manager Logo"
                            loading="lazy"
                            className="h-10 md:h-12 w-auto object-contain"
                        />
                    </Link>
                    <div className="mt-[-4px] md:mt-[-8px]">
                        <span className="text-[8px] md:text-xs text-gray-500 font-medium">
                            <em>
                                Powered by{" "}
                                <span className="font-semibold text-blue-600">
                                    FutureGRIN Group
                                </span>
                            </em>
                        </span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {finalLinks.map((link, index) =>
                        link.to.includes("#") ? (
                            <HashLink
                                key={index}
                                smooth
                                to={link.to}
                                scroll={(el: HTMLElement) => {
                                    const navbar = document.querySelector("nav");
                                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                                    const extraOffset = window.innerWidth < 768 ? 50 : 20;
                                    const y =
                                        el.getBoundingClientRect().top +
                                        window.scrollY -
                                        (navbarHeight + extraOffset);
                                    window.scrollTo({ top: y, behavior: "smooth" });
                                }}
                                className="text-sm font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600 transition-colors"
                            >
                                {link.label}
                            </HashLink>
                        ) : (
                            <Link
                                key={index}
                                to={resolveRestrictedDestination(link.to)}
                                className="text-sm font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600 transition-colors"
                            >
                                {link.label}
                            </Link>
                        )
                    )}

                    <div className="h-6 w-0.5 bg-gray-300"></div>

                    {currentUser ? (
                        // 2. Add NotificationBell in the Desktop User Section
                        <div className="flex items-center space-x-4">
                            {subscriptionPillLabel && (
                                <span className="hidden lg:inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                    {subscriptionPillLabel}
                                </span>
                            )}
                            <NotificationBell />
                            <ProfileMenu />
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition text-sm font-medium"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition text-sm font-medium"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger (Unchanged, but requires the NotificationBell to be positioned) */}
                {/* The bell is often better placed as a fixed element or in a dedicated mobile header, 
                            but for now, we'll keep it simple by just having the menu button and adding the 
                            bell component to the mobile menu drawer for access. */}
                <div className="md:hidden flex items-center space-x-4">
                    {/* Add NotificationBell here for quick access on mobile next to the menu button */}
                    {currentUser && <NotificationBell />}
                    <button
                        onClick={toggleMobileMenu}
                        className="focus:outline-none text-gray-700"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={
                                    isMobileMenuOpen
                                        ? "M6 18L18 6M6 6l12 12"
                                        : "M4 6h16M4 12h16m-7 6h7"
                                }
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={overlayVariants}
                        onClick={closeMobileMenu}
                    >
                        <motion.ul
                            className="bg-white h-full w-64 p-6 flex flex-col space-y-4 shadow-2xl overflow-y-auto"
                            variants={menuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="pb-4 mb-4 border-b border-gray-100">
                                <Link to="/" onClick={closeMobileMenu}>
                                    <img
                                        src={gradManager}
                                        alt="Grad Manager Logo"
                                        loading="lazy"
                                        className="h-10 w-auto object-contain"
                                    />
                                </Link>
                            </div>

                            {/* Mobile Links */}
                            {finalLinks.map((link, index) =>
                                link.to.includes("#") ? (
                                    <HashLink
                                        key={index}
                                        smooth
                                        to={link.to}
                                        onClick={closeMobileMenu}
                                        className="block py-2 text-left font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600 transition"
                                    >
                                        {link.label}
                                    </HashLink>
                                ) : (
                                    <Link
                                        key={index}
                                        to={resolveRestrictedDestination(link.to)}
                                        onClick={closeMobileMenu}
                                        className="block py-2 text-left font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600 transition"
                                    >
                                        {link.label}
                                    </Link>
                                )
                            )}

                            <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                                {currentUser ? (
                                    <>
                                        {/* 🟢 Mobile Verification Status */}
                                        <div className="flex flex-col items-start justify-start py-3 px-3 rounded-lg bg-gray-50 border border-gray-200 mb-2">
                                            <p className="text-xs text-gray-600 mb-1 font-medium">
                                                {currentUser.email}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle
                                                    size={16}
                                                    className={`${
                                                        currentUser.emailVerified ? "text-green-500" : "text-red-500"
                                                    }`}
                                                />
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        currentUser.emailVerified ? "text-green-600" : "text-red-600"
                                                    }`}
                                                >
                                                    {currentUser.emailVerified ? "Verified" : "Unverified"}
                                                </span>
                                            </div>
                                            {subscriptionPillLabel && (
                                                <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                                    {subscriptionPillLabel}
                                                </span>
                                            )}
                                        </div>

                                        {/* 📧 Mobile Resend Link */}
                                        {!currentUser.emailVerified && (
                                            <button
                                                onClick={() => {
                                                    handleResendVerification();
                                                    closeMobileMenu();
                                                }}
                                                className="flex items-center w-full py-2 text-left font-bold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition rounded-lg px-3 mb-3"
                                            >
                                                <Mail size={20} className="mr-2" /> Resend Verification
                                            </button>
                                        )}
                                        {/* 📧 End Mobile Resend Link */}

                                        <Link
                                            to={resolveRestrictedDestination("/profile")}
                                            onClick={closeMobileMenu}
                                            className="flex items-center py-2 text-left font-semibold text-gray-700 hover:text-blue-600 transition"
                                        >
                                            <User size={20} className="mr-2" /> Profile
                                        </Link>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                closeMobileMenu();
                                            }}
                                            className="flex items-center w-full py-2 text-left font-bold text-red-500 hover:text-red-700 transition"
                                        >
                                            <LogOut size={20} className="mr-2" /> Log Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={closeMobileMenu}
                                            className="block px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-center hover:bg-gray-100 transition font-medium"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            to="/signup"
                                            onClick={closeMobileMenu}
                                            className="block px-4 py-2 bg-blue-600 text-white rounded-full text-center hover:bg-blue-700 transition font-medium"
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
