import { Outlet, useNavigate, useMatchRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import DarkLogo from "../../assets/wplf1-dark.png";
import LightLogo from "../../assets/wplf1-light.png";
import MobileNavbar from "../common/MobileNavbar";
import SideNavbar from "../common/SideNavbar";
import PWAInstallBanner from "../PWAInstallBanner";

export const MainLayout = () => {
    const navigate = useNavigate();
    const matchRoute = useMatchRoute();

  const baseRoutes = [
    "/home",
    "/standings",
    "/manager",
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
                                    <button
                                        aria-label="Notifications"
                                        onClick={() => navigate({ to: '/notifications' })}
                                        className="relative flex h-10 w-8 items-center justify-center text-white"
                                    >
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute right-1 top-2 h-2.5 w-2.5 rounded-full bg-[#ff624f]" />
                                    </button>
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



