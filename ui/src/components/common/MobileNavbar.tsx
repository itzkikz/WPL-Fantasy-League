import { Link, useMatchRoute, useLocation } from "@tanstack/react-router";
import { useUserStore } from "../../store/useUserStore";
import {
  House,
  Trophy,
  Shirt,
  Swords,
  BarChart3,
  Settings,
  Calendar,
  Users,
} from "lucide-react";

const iconClass = (isActive: boolean) =>
  `w-6 h-6 transition-all duration-300 ${isActive ? "text-secondary scale-110" : "text-[#8E89A6]"}`;

const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <House className={iconClass(isActive)} />
);
const LeagueIcon = ({ isActive }: { isActive: boolean }) => (
  <Trophy className={iconClass(isActive)} />
);
const MyTeamIcon = ({ isActive }: { isActive: boolean }) => (
  <Shirt className={iconClass(isActive)} />
);
const H2HIcon = ({ isActive }: { isActive: boolean }) => (
  <Swords className={iconClass(isActive)} />
);
const StatsIcon = ({ isActive }: { isActive: boolean }) => (
  <BarChart3 className={iconClass(isActive)} />
);
const AdminSettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <Settings className={iconClass(isActive)} />
);
const AdminFixturesIcon = ({ isActive }: { isActive: boolean }) => (
  <Calendar className={iconClass(isActive)} />
);
const AdminTeamsIcon = ({ isActive }: { isActive: boolean }) => (
  <Users className={iconClass(isActive)} />
);
const AdminLeaguesIcon = ({ isActive }: { isActive: boolean }) => (
  <Trophy className={iconClass(isActive)} />
);
const AdminH2HIcon = ({ isActive }: { isActive: boolean }) => (
  <Swords className={iconClass(isActive)} />
);

const MobileNavbar = () => {
  const matchRoute = useMatchRoute();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const isRegularUser = user?.role === "user";

  const navItems = isAdmin
    ? [
      { label: "Settings", path: "/settings", icon: AdminSettingsIcon },
      { label: "Fixtures", path: "/admin/fixtures", icon: AdminFixturesIcon },
      { label: "Teams", path: "/admin/fantasy-teams", icon: AdminTeamsIcon },
      { label: "Leagues", path: "/admin/leagues", icon: AdminLeaguesIcon },
      { label: "H2H", path: "/admin/h2h-leagues", icon: AdminH2HIcon },
    ]
    : isRegularUser
      ? [
        { label: "Stats", path: "/stats", icon: StatsIcon },
      ]
      : [
        { label: "Home", path: "/home", icon: HomeIcon },
        { label: "League", path: "/standings/", icon: LeagueIcon },
        { label: "My Team", path: "/my-team", icon: MyTeamIcon },
        { label: "H2H", path: "/h2h", icon: H2HIcon },
        { label: "Stats", path: "/stats", icon: StatsIcon },
      ];

  const isBaseRoute =
    location.pathname === "/settings" ||
    location.pathname.startsWith("/standings") ||
    (isAdmin
      ? (location.pathname.startsWith("/admin") || location.pathname === "/settings")
      : navItems.some(
        (item) =>
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/")
      ));

  if (!isBaseRoute) {
    return null;
  }

  return (
    <nav className="mobile-navbar fixed bottom-0 left-0 right-0 w-full block lg:hidden border-t border-[#221938] z-50 bg-[#120C22] pb-[env(safe-area-inset-bottom)]" style={{ willChange: 'transform', viewTransitionName: 'bottom-nav' }}>
      <div
        className="grid h-16"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map(({ label, path, icon: IconComponent }) => {
          const isActive = matchRoute({ to: path, fuzzy: true });

          return (
            <Link
              key={path}
              to={path}
              className="inline-flex flex-col items-center justify-center text-[11px] transition-colors"
            >
              <IconComponent isActive={isActive} />

              <span
                className={`mt-1 transition-colors duration-300 ${isActive
                  ? "text-secondary font-semibold"
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
