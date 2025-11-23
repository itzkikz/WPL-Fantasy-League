import { Link, useMatchRoute } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";
import Home from "../icons/Home";
import User from "../icons/User";
import UserSettings from "../icons/UserSettings";
import Graph from "../icons/Graph";
import Notification from "../icons/Notification";

const MobileNavbar = () => {
  const matchRoute = useMatchRoute();

  const navItems = [
    { label: "Home", path: "/standings" },
    { label: "Manage", path: "/manager" },
    { label: "Stats", path: "/stats" },
    { label: "Notifications", path: "/notifications" },
    { label: "Settings", path: "/settings" },
  ];

  const isBaseRoute = navItems.some((item) =>
    matchRoute({ to: item.path, fuzzy: false })
  );

  if (!isBaseRoute) {
    return null;
  }

  return (
    <nav className="mobile-navbar sticky top-0 w-full block lg:hidden flex-none z-50 bg-light-bg dark:bg-dark-bg">
      <div className="grid h-16 grid-cols-5">
        {navItems.map(({ label, path }) => {
          const isActive = matchRoute({ to: path, fuzzy: true });

          return (
            <Link
              key={label}
              to={path}
              viewTransition={ViewTransitions.tabSwitch}
              className={`${isActive ? "border-b border-light-border dark:border-dark-border" : ""} inline-flex flex-col items-center justify-center text-[11px] transition-colors`}
            >
              {label === "Home" && <Home isActive={isActive} />}
              {label === "Manage" && <User isActive={isActive} />}
              {label === "Settings" && <UserSettings isActive={isActive} />}
              {label === "Stats" && <Graph isActive={isActive} />}
              {label === "Notifications" && <Notification isActive={isActive} />}

              <span
                className={`mt-1 ${isActive
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

export default MobileNavbar;
