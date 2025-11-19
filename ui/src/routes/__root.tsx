import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Logo from "./../assets/wplf1-dark.png";
import BottomNavbar from "../components/common/BottomNavbar";
import SideNavbar from "../components/common/SideNavbar";
import PWAInstallBanner from "../components/PWAInstallBanner";

export const Route = createRootRoute({
  component: () => (
    <>
      <main className="font-outfit min-h-screen shadow-sm text-primary">
        <PWAInstallBanner />
        <div className="">
          <div className="flex h-screen flex-col mx-auto w-full">
            <header className="header hidden relative w-full h-10 overflow-hidden">
              {/* Animated gradient overlay */}
              {/* Content container */}
              <div className="relative z-10 flex items-center h-full px-4 max-w-md mx-auto bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                {/* Premier League Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center">
                    <img src={Logo} alt="PLogo" className="w-8 h-8" />
                  </div>

                  {/* Fantasy Text */}
                  <h1 className="text-white text-2xl font-bold tracking-tight">
                    WPL Fantasy Football
                  </h1>
                </div>
              </div>

              {/* Decorative wave pattern */}
              <div className="absolute bottom-0 right-0 w-64 h-64 opacity-40">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path
                    d="M0,100 Q50,80 100,100 T200,100 L200,200 L0,200 Z"
                    fill="url(#wave-gradient)"
                    className="animate-wave"
                  />
                  <defs>
                    <linearGradient
                      id="wave-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#00ff87" stopOpacity="0.5" />
                      <stop
                        offset="100%"
                        stopColor="#60efff"
                        stopOpacity="0.3"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </header>
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
            <BottomNavbar />
          </div>
        </div>
      </main>
    </>
  ),
});
