import { Link, useMatchRoute } from "@tanstack/react-router";
import Home from "../icons/Home";
import User from "../icons/User";
import UserSettings from "../icons/UserSettings";
import Graph from "../icons/Graph";
import Notification from "../icons/Notification";

const BottomNavbar = () => {
  const matchRoute = useMatchRoute();

  const navItems = [
    { label: "Home", path: "/standings" },
    { label: "Manage", path: "/manager" },
    { label: "Stats", path: "/stats" },
    { label: "Notifications", path: "/notifications" },
    { label: "Settings", path: "/settings" },
  ];

  if (matchRoute({ to: "/login" }) || matchRoute({to: "/maintenance"}) || matchRoute({ to: "/" })) {
    return null; // Truthy check works for both {} and { params }
  }

  return (
    <nav className="flex-none border-t border-[#ebe5eb] dark:border-[#541e5d]">
      <div className="grid h-16 grid-cols-5">
        {navItems.map(({ label, path }) => {
          const isActive = matchRoute({ to: path, fuzzy: true });

          return (
            <Link
              key={label}
              to={path}
              className={`inline-flex flex-col items-center justify-center text-[11px] transition-colors ${
                isActive
                  ? "dark:text-[#541e5d] font-semibold"
                  : "dark:hover:text-[#541e5d]"
              }`}
            >
              {label === "Home" && <Home isActive={isActive} />}
              {label === "Manage" && <User isActive={isActive} />}
              {label === "Settings" && <UserSettings />}
              {label === "Stats" && <Graph />}
              {label === "Notifications" && <Notification />}

              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
