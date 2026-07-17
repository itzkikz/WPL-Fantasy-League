import { useState } from "react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useUserStore } from "../../store/useUserStore";
import Home from "../icons/Home";
import User from "../icons/User";
import UserSettings from "../icons/UserSettings";
import Graph from "../icons/Graph";
import Notification from "../icons/Notification";
import AngleDown from "../icons/AngleDown";
import AngleRight from "../icons/AngleRight";

const MyTeamIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-colors ${isActive ? "text-[#A855F7]" : "text-[#8E89A6]"}`} 
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.2)" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.38 3.46L16 6.14V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3.14L3.62 3.46a1 1 0 0 0-1.42.34l-1.5 2.5a1 1 0 0 0 .34 1.42L4 9.59V21a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.59l2.96-1.87a1 1 0 0 0 .34-1.42l-1.5-2.5a1 1 0 0 0-1.42-.34z" />
  </svg>
);

const PickTeamIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-colors ${isActive ? "text-[#A855F7]" : "text-[#8E89A6]"}`} 
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.2)" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.38 3.46L16 6.14V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3.14L3.62 3.46a1 1 0 0 0-1.42.34l-1.5 2.5a1 1 0 0 0 .34 1.42L4 9.59V21a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.59l2.96-1.87a1 1 0 0 0 .34-1.42l-1.5-2.5a1 1 0 0 0-1.42-.34z" />
    <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 13v2M11 14h2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const LeagueIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-colors ${isActive ? "text-[#A855F7]" : "text-[#8E89A6]"}`}
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.2)" : "none"} 
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

const H2HIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-6 h-6 transition-colors ${isActive ? "text-[#A855F7]" : "text-[#8E89A6]"}`}
    viewBox="0 0 24 24" 
    fill={isActive ? "rgba(168, 85, 247, 0.2)" : "none"} 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const SideNavbar = () => {
  const matchRoute = useMatchRoute();
  const [isAdminOpen, setIsAdminOpen] = useState(true);
  const user = useUserStore((state) => state.user);

  const navItems = [
    { label: "Home", path: "/home" },
    { label: "League", path: "/standings" },
    { label: "My Team", path: "/my-team" },
    { label: "H2H", path: "/h2h" },
    { label: "Stats", path: "/stats" },
  ];

  if (
    matchRoute({ to: "/login" }) ||
    matchRoute({ to: "/maintenance" }) ||
    matchRoute({ to: "/" })
  ) {
    return null;
  }

  return (
    <nav className="side-navbar hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 lg:border-r border-[#221938] lg:h-screen lg:py-4 lg:px-2">
      <div className="flex flex-col gap-2">
        {navItems.map(({ label, path }) => {
          const isActive = matchRoute({ to: path, fuzzy: true });

          return (
            <Link
              viewTransition={{ types: ["tab-switch"] }}
              key={label}
              to={path}
              className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors`}
            >
              {label === "Home" && <Home isActive={isActive} />}
              {label === "League" && <LeagueIcon isActive={isActive} />}
              {label === "My Team" && <MyTeamIcon isActive={isActive} />}
              {label === "H2H" && <H2HIcon isActive={isActive} />}
              {label === "Stats" && <Graph isActive={isActive} />}

              <span
                className={`${
                  isActive
                    ? "text-[#A855F7] font-semibold"
                    : "text-[#8E89A6] hover:text-white"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="mt-2 border-t border-[#221938] pt-2">
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <UserSettings isActive={isAdminOpen} />
                <span className="text-[#8E89A6] hover:text-white font-semibold">Admin Panel</span>
              </div>
              {isAdminOpen ? <AngleDown height="4" width="4" /> : <AngleRight height="4" width="4" />}
            </button>
            
            {isAdminOpen && (
              <div className="flex flex-col gap-2 mt-1 pl-11">
                {[
                  { label: "Fixtures", path: "/admin/fixtures" },
                  { label: "Fantasy Teams", path: "/admin/fantasy-teams" },
                  { label: "Leagues", path: "/admin/leagues" },
                  { label: "Notifications", path: "/admin/notifications" },
                  { label: "Gameweeks", path: "/admin/gameweeks" },
                ].map((adminItem) => {
                  const isLinkActive = matchRoute({ to: adminItem.path, fuzzy: true });
                  return (
                    <Link
                      key={adminItem.label}
                      to={adminItem.path}
                      className="py-1 text-sm transition-colors"
                    >
                      <span
                        className={`${
                          isLinkActive
                            ? "text-[#A855F7] font-semibold"
                            : "text-[#8E89A6] hover:text-white"
                        }`}
                      >
                        {adminItem.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default SideNavbar;
