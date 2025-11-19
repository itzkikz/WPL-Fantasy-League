import { Link, useMatchRoute } from "@tanstack/react-router";
import Home from "../icons/Home";
import User from "../icons/User";
import UserSettings from "../icons/UserSettings";
import Graph from "../icons/Graph";
import Notification from "../icons/Notification";

const SideNavbar = () => {
  const matchRoute = useMatchRoute();

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
    <nav className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 lg:border-r border-light-border dark:border-dark-border lg:h-screen lg:py-4 lg:px-2">
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
      </div>
    </nav>
  );
};

export default SideNavbar;
