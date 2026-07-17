import { Link, useMatchRoute } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";

const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-all duration-300 ${isActive ? "text-[#A855F7] scale-110" : "text-[#8E89A6]"}`}
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.15)" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LeagueIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-all duration-300 ${isActive ? "text-[#A855F7] scale-110" : "text-[#8E89A6]"}`}
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.15)" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const MyTeamIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-all duration-300 ${isActive ? "text-[#A855F7] scale-110" : "text-[#8E89A6]"}`} 
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.15)" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.38 3.46L16 6.14V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3.14L3.62 3.46a1 1 0 0 0-1.42.34l-1.5 2.5a1 1 0 0 0 .34 1.42L4 9.59V21a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.59l2.96-1.87a1 1 0 0 0 .34-1.42l-1.5-2.5a1 1 0 0 0-1.42-.34z" />
  </svg>
);

const H2HIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-all duration-300 ${isActive ? "text-[#A855F7] scale-110" : "text-[#8E89A6]"}`}
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.15)" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const StatsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-all duration-300 ${isActive ? "text-[#A855F7] scale-110" : "text-[#8E89A6]"}`}
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.15)" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const MobileNavbar = () => {
  const matchRoute = useMatchRoute();

  const navItems = [
    { label: "Home", path: "/home" },
    { label: "League", path: "/standings" },
    { label: "My Team", path: "/my-team" },
    { label: "H2H", path: "/h2h" },
    { label: "Stats", path: "/stats" },
  ];

  const isBaseRoute = navItems.some((item) =>
    matchRoute({ to: item.path, fuzzy: false })
  );

  if (!isBaseRoute) {
    return null;
  }

  return (
    <nav className="mobile-navbar fixed bottom-0 left-0 right-0 w-full block lg:hidden border-t border-[#221938] z-50 bg-[#120C22] pb-[env(safe-area-inset-bottom)]" style={{ willChange: 'transform' }}>
      <div className="grid h-16 grid-cols-5">
        {navItems.map(({ label, path }) => {
          const isActive = matchRoute({ to: path, fuzzy: true });

          return (
            <Link
              key={path}
              to={path}
              viewTransition={ViewTransitions.tabSwitch}
              className="inline-flex flex-col items-center justify-center text-[11px] transition-colors"
            >
              {label === "Home" && <HomeIcon isActive={isActive} />}
              {label === "League" && <LeagueIcon isActive={isActive} />}
              {label === "My Team" && <MyTeamIcon isActive={isActive} />}
              {label === "H2H" && <H2HIcon isActive={isActive} />}
              {label === "Stats" && <StatsIcon isActive={isActive} />}

              <span
                className={`mt-1 transition-colors duration-300 ${isActive
                  ? "text-[#A855F7] font-semibold"
                  : "text-[#8E89A6]"
                  }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;
