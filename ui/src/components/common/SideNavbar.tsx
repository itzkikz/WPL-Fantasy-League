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

const SideNavbar = () => {
  const matchRoute = useMatchRoute();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const user = useUserStore((state) => state.user);

  const navItems = [
    { label: "Home", path: "/standings" },
    { label: "Manage", path: "/manager" },
    { label: "Stats", path: "/stats" },
    { label: "Notifications", path: "/notifications" },
    { label: "Settings", path: "/settings" },
  ];

  if (
    matchRoute({ to: "/login" }) ||
    matchRoute({ to: "/maintenance" }) ||
    matchRoute({ to: "/" })
  ) {
    return null;
  }

  return (
    <nav className="side-navbar hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 lg:border-r border-light-border dark:border-dark-border lg:h-screen lg:py-4 lg:px-2">
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
              {label === "Manage" && <User isActive={isActive} />}
              {label === "Settings" && <UserSettings isActive={isActive} />}
              {label === "Stats" && <Graph isActive={isActive} />}
              {label === "Notifications" && <Notification isActive={isActive} />}

              <span
                className={`${
                  isActive
                    ? "text-gray-400 dark:text-light-text-secondary font-semibold"
                    : ""
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="mt-2 border-t border-light-border dark:border-dark-border pt-2">
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <UserSettings isActive={false} />
                <span className={isAdminOpen ? "text-gray-400 dark:text-light-text-secondary font-semibold" : ""}>Admin</span>
              </div>
              {isAdminOpen ? <AngleDown height="4" width="4" /> : <AngleRight height="4" width="4" />}
            </button>
            
            {isAdminOpen && (
              <div className="flex flex-col gap-2 mt-1 pl-11">
                <Link
                  to="/admin/fixtures"
                  className="py-1 text-sm transition-colors"
                >
                  <span className={matchRoute({ to: "/admin/fixtures", fuzzy: true }) ? "text-gray-400 dark:text-light-text-secondary font-semibold" : ""}>Fixtures</span>
                </Link>
                <Link
                  to="/admin/fantasy-teams"
                  className="py-1 text-sm transition-colors"
                >
                  <span className={matchRoute({ to: "/admin/fantasy-teams", fuzzy: true }) ? "text-gray-400 dark:text-light-text-secondary font-semibold" : ""}>Fantasy Teams</span>
                </Link>
                <Link
                  to="/admin/notifications"
                  className="py-1 text-sm transition-colors"
                >
                  <span className={matchRoute({ to: "/admin/notifications", fuzzy: true }) ? "text-gray-400 dark:text-light-text-secondary font-semibold" : ""}>Notifications</span>
                </Link>
                <Link
                  to="/admin/gameweeks"
                  className="py-1 text-sm transition-colors"
                >
                  <span className={matchRoute({ to: "/admin/gameweeks", fuzzy: true }) ? "text-gray-400 dark:text-light-text-secondary font-semibold" : ""}>Gameweeks</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default SideNavbar;
