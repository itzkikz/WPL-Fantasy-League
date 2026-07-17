import { useEffect } from "react";
import { Outlet, useNavigate, useMatchRoute, useLocation } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import DarkLogo from "../../assets/wplf1-dark.png";
import LightLogo from "../../assets/wplf1-light.png";
import MobileNavbar from "../common/MobileNavbar";
import SideNavbar from "../common/SideNavbar";
import PWAInstallBanner from "../PWAInstallBanner";
import { useValidateToken } from "../../features/auth/hooks";
import { useUserStore } from "../../store/useUserStore";

export const MainLayout = () => {
    const navigate = useNavigate();
    const matchRoute = useMatchRoute();
    const location = useLocation();

    const { data } = useValidateToken();
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        if (data?.valid) {
            setUser({ teamName: data?.user?.userId, role: data?.user?.role });
        }
    }, [data, setUser]);

    const isAdmin = user?.role === "admin";
    const isUser = user?.role === "user";
    const currentPath = location.pathname;
    const isAdminPath = currentPath.startsWith("/admin");
    const isSettingsPath = currentPath === "/settings";
    const isStatsPath = currentPath.startsWith("/stats");
    const isPublicOrAuthPath = ["/login", "/maintenance", "/"].includes(currentPath);

    const isRestrictedForAdmin = isAdmin && !isAdminPath && !isSettingsPath && !isPublicOrAuthPath;
    const isRestrictedForUser = isUser && !isStatsPath && !isSettingsPath && !isPublicOrAuthPath;

    useEffect(() => {
        if (isRestrictedForAdmin) {
            navigate({ to: "/settings" });
        }
    }, [isRestrictedForAdmin, navigate]);

    const baseRoutes = [
        "/home",
        "/standings",
        "/my-team",
        "/stats",
        "/notifications",
        "/settings",
    ];

    const isBaseRoute = baseRoutes.some((route) =>
        matchRoute({ to: route, fuzzy: false })
    );

    const noNavRoutes = ["/login", "/maintenance", "/"];
    const hideNav = noNavRoutes.some((route) =>
        matchRoute({ to: route, fuzzy: false })
    );

    if (isRestrictedForAdmin) {
        return null;
    }

    if (isRestrictedForUser) {
        return (
            <main className="font-outfit min-h-screen text-primary flex flex-col items-center justify-center p-4 bg-[#120C22] text-white">
                <PWAInstallBanner />
                <div className="bg-[#1b142d]/80 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-4 relative overflow-hidden animate-slide-up">
                    <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 opacity-80" />

                    <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-sm font-black uppercase tracking-wider text-white">Access Restricted</h2>
                        <p className="text-xs text-white/50 leading-relaxed">
                            You are not registered as a fantasy manager.
                        </p>
                    </div>

                    <div className="p-3 bg-[#150f24] rounded-xl border border-white/5 text-[10px] text-white/60 leading-normal">
                        Please contact the League Administrator to get assigned to a fantasy team squad roster.
                    </div>

                    <div className="pt-2 flex justify-center gap-2">
                        <button
                            onClick={() => navigate({ to: "/stats" })}
                            className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            View League Stats
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate({ to: "/login" });
                            }}
                            className="px-4 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="font-outfit min-h-screen shadow-sm text-primary flex flex-col">
            <PWAInstallBanner />
            <div className="flex-1 flex">
                <div className="flex h-screen flex-col mx-auto w-full overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {isBaseRoute && (
                        <header className="header relative w-full h-12 shrink-0 overflow-hidden bg-surface border-b border-[var(--color-border-divider)] text-white lg:hidden">
                            {/* Animated gradient overlay */}
                            {/* Content container */}
                            <div className="relative z-10 mx-auto flex h-full w-full items-center justify-between px-3">
                                {/* Premier League Logo */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center">
                                        <img
                                            src={DarkLogo}
                                            alt="WPL Logo"
                                            className="hidden dark:block logo-image w-8 h-8 rounded-full"
                                        />
                                        <img
                                            src={LightLogo}
                                            alt="WPL Logo"
                                            className="block dark:hidden logo-image w-8 h-8 rounded-full"
                                        />
                                    </div>

                                    {/* Fantasy Text */}
                                    <h1 className="text-[21px] font-bold tracking-tight">
                                        WPL Fantasy
                                    </h1>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!isAdmin && (
                                        <button
                                            aria-label="Notifications"
                                            onClick={() => navigate({ to: '/notifications' })}
                                            className="relative flex h-10 w-8 items-center justify-center text-white"
                                        >
                                            <Bell className="h-5 w-5" />
                                            <span className="absolute right-1 top-2 h-2.5 w-2.5 rounded-full bg-[#ff624f]" />
                                        </button>
                                    )}
                                    <button
                                        aria-label="Settings"
                                        onClick={() => navigate({ to: '/settings' })}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.2)]"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </button>
                                </div></div>

                            {/* Decorative wave pattern */}
                            <div className="absolute bottom-0 right-0 w-64 h-64 opacity-40 pointer-events-none">
                                <svg viewBox="0 0 200 200" className="w-full h-full">
                                    <path
                                        d="M0,100 Q50,80 100,100 T200,100 L200,200 L0,200 Z"
                                        fill="url(#wave-gradient)"
                                        className="animate-wave"
                                    />
                                    <defs>
                                        <linearGradient
                                            id="wave-gradient"
                                            gradientTransform="rotate(90)"
                                        >
                                            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </header>
                    )}
                    {!hideNav && <MobileNavbar />}
                    <div className="flex flex-col lg:flex-row flex-1">
                        {/* Sidebar: hidden on mobile, visible on lg+ */}
                        {!hideNav && (
                            <div className="hidden lg:block lg:w-64">
                                <SideNavbar />
                            </div>
                        )}

                        {/* Main content: always visible, grows to fill space */}
                        <div className={`flex-1 flex flex-col ${!hideNav ? 'pb-20 lg:pb-0 lg:px-6 lg:py-6' : ''}`}>
                            <Outlet />
                        </div>
                    </div>

                    <TanStackRouterDevtools />

                </div>
            </div>
        </main>
    );
};



