import { Link, useMatchRoute, useLocation } from "@tanstack/react-router";
import { useUserStore } from "../../store/useUserStore";
import Home from "../icons/Home";
import UserSettings from "../icons/UserSettings";
import Graph from "../icons/Graph";
import Notification from "../icons/Notification";
import { Sparkles } from "lucide-react";

const MyTeamIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-5 h-5 transition-colors ${isActive ? "text-[#A855F7]" : "text-gray-500 dark:text-[#8E89A6]"}`} 
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

const LeagueIcon = ({ isActive }: { isActive: boolean }) => (
  <svg 
    className={`w-5 h-5 transition-colors ${isActive ? "text-[#A855F7]" : "text-gray-500 dark:text-[#8E89A6]"}`}
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
    className={`w-5 h-5 transition-colors ${isActive ? "text-[#A855F7]" : "text-gray-500 dark:text-[#8E89A6]"}`}
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

const FactsIcon = ({ isActive }: { isActive: boolean }) => (
  <Sparkles
    className={`w-5 h-5 transition-colors ${isActive ? "text-[#A855F7]" : "text-gray-500 dark:text-[#8E89A6]"}`}
  />
);

const SideNavbar = () => {
  const matchRoute = useMatchRoute();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const isGuest = useUserStore((state) => state.isGuest);
  const isAdmin = user?.role === "admin";

  const isPathActive = (path: string) => {
    const currentPath = location.pathname;
    const normTarget = path === "/" ? "/" : path.replace(/\/$/, "");
    const normCurrent = currentPath === "/" ? "/" : currentPath.replace(/\/$/, "");

    if (normTarget === "/home") {
      return normCurrent === "/home" || normCurrent === "";
    }

    return (
      Boolean(matchRoute({ to: path, fuzzy: true })) ||
      normCurrent === normTarget ||
      (normTarget !== "" && normCurrent.startsWith(normTarget + "/"))
    );
  };

  const adminItems = [
    { label: "Fixtures", path: "/admin/fixtures" },
    { label: "Teams", path: "/admin/teams" },
    { label: "Players", path: "/admin/players" },
    { label: "Fantasy Teams", path: "/admin/fantasy-teams" },
    { label: "Transfers", path: "/admin/transfers" },
    { label: "Substitutions", path: "/admin/substitutions" },
    { label: "Leagues", path: "/admin/leagues" },
    { label: "H2H Leagues", path: "/admin/h2h-leagues" },
    { label: "Notifications", path: "/admin/notifications" },
    { label: "Facts & News", path: "/admin/facts" },
    { label: "Gameweeks", path: "/admin/gameweeks" },
    { label: "Sheets", path: "/admin/sheets" },
  ];

  if (
    matchRoute({ to: "/login" }) ||
    matchRoute({ to: "/maintenance" }) ||
    matchRoute({ to: "/" })
  ) {
    return null;
  }

  if (isAdmin) {
    return (
      <nav className="side-navbar hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 lg:border-r border-gray-200 dark:border-[#221938] bg-surface lg:h-screen lg:py-4 lg:px-3">
        <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Settings Link */}
          {(() => {
            const isActive = isPathActive("/settings");
            return (
              <Link
                viewTransition={{ types: ["tab-switch"] }}
                to="/settings"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/15 text-[#A855F7] font-semibold border border-primary/25 shadow-sm"
                    : "text-gray-600 dark:text-[#8E89A6] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                }`}
              >
                <UserSettings isActive={isActive} />
                <span>Settings</span>
              </Link>
            );
          })()}

          {/* Admin Panel Header */}
          <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-[#8E89A6] uppercase tracking-wider mt-3 border-t border-gray-200 dark:border-[#221938] pt-3">
            Admin Panel
          </div>

          {/* Admin Items */}
          {adminItems.map((adminItem) => {
            const isLinkActive = isPathActive(adminItem.path);
            return (
              <Link
                key={adminItem.label}
                to={adminItem.path}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isLinkActive
                    ? "bg-primary/15 text-[#A855F7] font-semibold border border-primary/25 shadow-sm"
                    : "text-gray-600 dark:text-[#8E89A6] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                }`}
              >
                <span>{adminItem.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Guest users - only show Stats and Standings
  if (isGuest) {
    const guestItems = [
      { label: "League", path: "/standings/" },
      { label: "Stats", path: "/stats" },
    ];

    return (
      <nav className="side-navbar hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 lg:border-r border-gray-200 dark:border-[#221938] bg-surface lg:h-screen lg:py-4 lg:px-3">
        <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {guestItems.map(({ label, path }) => {
            const isActive = isPathActive(path);

            return (
              <Link
                viewTransition={{ types: ["tab-switch"] }}
                key={label}
                to={path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/15 text-[#A855F7] font-semibold border border-primary/25 shadow-sm"
                    : "text-gray-600 dark:text-[#8E89A6] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                }`}
              >
                {label === "League" && <LeagueIcon isActive={isActive} />}
                {label === "Stats" && <Graph isActive={isActive} />}
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  const isRegularUser = user?.role === "user";

  const navItems = isRegularUser
    ? [
        { label: "Home", path: "/home" },
        { label: "League", path: "/standings/" },
        { label: "Stats", path: "/stats" },
        { label: "Facts & News", path: "/facts" },
        { label: "Notifications", path: "/notifications" },
        { label: "Settings", path: "/settings" },
      ]
    : [
        { label: "Home", path: "/home" },
        { label: "League", path: "/standings/" },
        { label: "My Team", path: "/my-team" },
        { label: "H2H", path: "/h2h" },
        { label: "Stats", path: "/stats" },
        { label: "Facts & News", path: "/facts" },
        { label: "Notifications", path: "/notifications" },
        { label: "Settings", path: "/settings" },
      ];

  return (
    <nav className="side-navbar hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 lg:border-r border-gray-200 dark:border-[#221938] bg-surface lg:h-screen lg:py-4 lg:px-3">
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navItems.map(({ label, path }) => {
          const isActive = isPathActive(path);

          return (
            <Link
              viewTransition={{ types: ["tab-switch"] }}
              key={label}
              to={path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/15 text-[#A855F7] font-semibold border border-primary/25 shadow-sm"
                  : "text-gray-600 dark:text-[#8E89A6] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
              }`}
            >
              {label === "Home" && <Home isActive={isActive} />}
              {label === "Facts & News" && <FactsIcon isActive={isActive} />}
              {label === "Notifications" && <Notification isActive={isActive} />}
              {label === "League" && <LeagueIcon isActive={isActive} />}
              {label === "My Team" && <MyTeamIcon isActive={isActive} />}
              {label === "H2H" && <H2HIcon isActive={isActive} />}
              {label === "Stats" && <Graph isActive={isActive} />}
              {label === "Settings" && <UserSettings isActive={isActive} />}

              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default SideNavbar;
