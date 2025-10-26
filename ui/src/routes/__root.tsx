import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Logo from "./../assets/wplff.svg";

export const Route = createRootRoute({
  component: () => (
    <>
      <main className="font-outfit min-h-screen bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-screen flex-col mx-auto max-w-md bg-white shadow-sm">
            <header className="hidden relative w-full h-10 overflow-hidden">
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
            <Outlet />
            <TanStackRouterDevtools />
            <nav className="hidden flex-none border-t border-gray-200 bg-white">
              <div className="grid h-16 grid-cols-5">
                {["Home", "Stats", "..", "...", "Settings"].map((label) => (
                  <button
                    key={label}
                    className="inline-flex flex-col items-center justify-center text-[11px] text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    {label === "Home" && (
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-[#33003b]"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
                        />
                      </svg>
                    )}
                    {label === "Stats" && (
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-[#33003b]"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v15a1 1 0 0 0 1 1h15M8 16l2.5-5.5 3 3L17.273 7 20 9.667"
                        />
                      </svg>
                    )}
                    {label !== "Home" && label !== "Stats" && (
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-[#33003b]"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z" />
                      </svg>
                    )}

                    <span className="mt-1">{label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </main>
    </>
  ),
});
