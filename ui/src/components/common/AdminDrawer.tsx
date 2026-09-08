import { useEffect } from "react";
import { Link, useMatchRoute, useLocation } from "@tanstack/react-router";
import { X } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "./adminNav";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDrawer = ({ isOpen, onClose }: AdminDrawerProps) => {
  const matchRoute = useMatchRoute();
  const location = useLocation();

  const isPathActive = (path: string) => {
    const currentPath = location.pathname;
    const normTarget = path.replace(/\/$/, "");
    const normCurrent = currentPath.replace(/\/$/, "");
    return (
      Boolean(matchRoute({ to: path, fuzzy: true })) ||
      normCurrent === normTarget ||
      (normTarget !== "" && normCurrent.startsWith(normTarget + "/"))
    );
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/60 animate-modal-backdrop-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute inset-y-0 left-0 w-[82vw] max-w-[320px] flex flex-col bg-[#120C22] border-r border-white/10 shadow-2xl animate-drawer-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-white/10 bg-black/20">
          <div>
            <h2 className="text-sm font-black tracking-tight text-white">Admin Panel</h2>
            <p className="text-[10px] text-white/40 font-medium">Manage WPL Fantasy</p>
          </div>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = isPathActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex flex-col gap-0.5 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/15 text-white border border-primary/25 shadow-sm"
                    : "text-[#A7A2C3] hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                {item.description && (
                  <span className="text-[10px] text-white/40">{item.description}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0">
          <Link
            to="/settings"
            onClick={onClose}
            className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isPathActive("/settings")
                ? "bg-primary/15 text-white border border-primary/25 shadow-sm"
                : "text-[#A7A2C3] hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            Settings
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default AdminDrawer;
