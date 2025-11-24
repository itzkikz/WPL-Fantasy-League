import { Outlet, useNavigate, useMatchRoute } from "@tanstack/react-router";
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
        "/standings",
        "/manager",
        "/stats",
        "/notifications",
        "/settings",
    ];

    const isBaseRoute = baseRoutes.some((route) =>
        matchRoute({ to: route, fuzzy: false })
    );

    return (
        <main className="font-outfit min-h-screen shadow-sm text-primary">
            <PWAInstallBanner />
            <div className="">
                <div className="flex h-screen flex-col mx-auto w-full overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {isBaseRoute && (
                        <header className="header relative w-full h-15 shrink-0 overflow-hidden lg:hidden">
                            {/* Animated gradient overlay */}
                            {/* Content container */}
                            <div className="relative z-10 flex items-center justify-between h-full px-4 w-full">
                                {/* Premier League Logo */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-sm flex items-center justify-center">
                                        <img
                                            src={DarkLogo}
                                            alt="WPL Logo"
                                            className="hidden dark:block logo-image w-8 h-8"
                                        />
                                        <img
                                            src={LightLogo}
                                            alt="WPL Logo"
                                            className="block dark:hidden logo-image w-8 h-8"
                                        />
                                    </div>

                                    {/* Fantasy Text */}
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        WPL Fantasy
                                    </h1>
                                </div>

                                {/* User Avatar */}
                                <div
                                    onClick={() => navigate({ to: '/settings' })}
                                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors border border-white/30"
                                >
                                    <svg
                                        className="w-6 h-6"
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
                                </div>
                            </div>

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
                    <MobileNavbar />
                    <div className="flex flex-col lg:flex-row">
                        {/* Sidebar: hidden on mobile, visible on lg+ */}
                        <div className="hidden lg:block lg:w-64">
                            <SideNavbar />
                        </div>

                        {/* Main content: always visible, grows to fill space */}
                        <div className="flex-1 lg:px-6 lg:py-6">
                            <Outlet />
                        </div>
                    </div>

                    <TanStackRouterDevtools />

                </div>
            </div>
        </main>
    );
};
