import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import {
  Loader2,
  Users,
  UserCog,
  ShieldCheck,
  User,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  BellRing,
  Download,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const Route = createLazyFileRoute("/admin/users")({
  component: AdminUsers,
});

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  info?: string;
  role: "admin" | "user" | "manager";
  createdAt?: string;
  fantasyTeam?: { id: string; name: string } | null;
  device?: {
    pwaInstalled?: boolean;
    standalone?: boolean;
    os?: string;
    browser?: string;
    deviceType?: "mobile" | "tablet" | "desktop";
    pushSubscribed?: boolean;
    firstSubscribedAt?: string;
    lastSeenAt?: string;
  } | null;
  pushSubscribed?: boolean;
  firstSubscribedAt?: string;
}

const roleMeta: Record<AdminUser["role"], { label: string; className: string; icon: typeof User }> = {
  admin: {
    label: "Admin",
    className: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    icon: ShieldCheck,
  },
  manager: {
    label: "Manager",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    icon: UserCog,
  },
  user: {
    label: "User",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    icon: User,
  },
};

const ROLE_FILTERS: ("all" | AdminUser["role"])[] = ["all", "admin", "manager", "user"];

const deviceTypeIcon = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUser["role"]>("all");
  const [appFilter, setAppFilter] = useState<"all" | "app" | "browser">("all");
  const [pushFilter, setPushFilter] = useState<"all" | "on" | "off">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () =>
      (await apiClient.get(API_ENDPOINTS.ADMIN.USERS, { params: { all: true } })).data.data as AdminUser[],
  });

  const users = data || [];

  const counts = useMemo(
    () => ({
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      manager: users.filter((u) => u.role === "manager").length,
      user: users.filter((u) => u.role === "user").length,
      app: users.filter((u) => u.device?.pwaInstalled === true).length,
      push: users.filter((u) => u.pushSubscribed || u.device?.pushSubscribed).length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (appFilter === "app" && u.device?.pwaInstalled !== true) return false;
      if (appFilter === "browser" && u.device?.pwaInstalled !== false) return false;
      const isPushOn = Boolean(u.pushSubscribed || u.device?.pushSubscribed);
      if (pushFilter === "on" && !isPushOn) return false;
      if (pushFilter === "off" && isPushOn) return false;
      if (!q) return true;
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.fantasyTeam?.name || "").toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery, roleFilter, appFilter, pushFilter]);

  const summaryChips = [
    { key: "admin" as const, label: "Admins", value: counts.admin },
    { key: "manager" as const, label: "Managers", value: counts.manager },
    { key: "user" as const, label: "Users", value: counts.user },
  ];

  const filterPillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
      active
        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
        : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
    }`;

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-indigo-400" />
            Users
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {counts.total} User{counts.total !== 1 ? "s" : ""}
            </span>
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Everyone with an account — admins, managers and regular users
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {summaryChips.map((chip) => {
          const meta = roleMeta[chip.key];
          return (
            <span
              key={chip.key}
              className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.className}`}
            >
              <meta.icon className="w-3 h-3" />
              {chip.value} {chip.label}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border text-sky-400 bg-sky-500/10 border-sky-500/30">
          <Download className="w-3 h-3" />
          {counts.app} App
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border text-rose-400 bg-rose-500/10 border-rose-500/30">
          <BellRing className="w-3 h-3" />
          {counts.push} Push
        </span>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 bg-[#1b142d]/80 border border-white/10 rounded-xl p-2.5 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, email or fantasy team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-all font-medium"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={filterPillClass(roleFilter === role)}
            >
              {role === "all" ? "All" : roleMeta[role].label}
            </button>
          ))}
          <span className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
          {(["app", "browser"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAppFilter(appFilter === mode ? "all" : mode)}
              className={filterPillClass(appFilter === mode)}
            >
              {mode === "app" ? "App users" : "Browser"}
            </button>
          ))}
          {(["on", "off"] as const).map((state) => (
            <button
              key={state}
              onClick={() => setPushFilter(pushFilter === state ? "all" : state)}
              className={filterPillClass(pushFilter === state)}
            >
              Push {state}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-[#150f24]/50 border border-white/5 rounded-xl overflow-hidden shadow-lg py-14 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-[#150f24]/50 border border-white/5 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/40 border-b border-white/5">
                <tr className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Fantasy Team</th>
                  <th className="py-2.5 px-3">App</th>
                  <th className="py-2.5 px-3">Push</th>
                  <th className="py-2.5 px-3">Device</th>
                  <th className="py-2.5 px-3 text-right">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-white/40 text-xs font-semibold">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const meta = roleMeta[user.role] || roleMeta.user;
                    const device = user.device;
                    const isPushOn = Boolean(user.pushSubscribed || device?.pushSubscribed);
                    const DeviceIcon = device?.deviceType ? deviceTypeIcon[device.deviceType] : null;

                    return (
                      <tr key={user._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-xs font-black text-indigo-300 shrink-0">
                              {user.username?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white/95 truncate">{user.username}</div>
                              {user.info ? (
                                <div className="text-[9px] text-white/40 truncate">{user.info}</div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-white/60 font-semibold truncate max-w-[180px]">
                          {user.email || "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full border ${meta.className}`}
                          >
                            <meta.icon className="w-2.5 h-2.5" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {user.fantasyTeam ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/80 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                              <UserCog className="w-3 h-3 text-emerald-400" />
                              <span className="truncate max-w-[140px]">{user.fantasyTeam.name}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/30 font-semibold">No team</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {device?.pwaInstalled === true ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full">
                              <Download className="w-2.5 h-2.5" /> App
                            </span>
                          ) : device?.pwaInstalled === false ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/50 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                              Browser
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/30 font-semibold">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {isPushOn ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded-full">
                              <BellRing className="w-2.5 h-2.5" /> On
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/40 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                              Off
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {device?.os || device?.browser ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/70 whitespace-nowrap">
                              {DeviceIcon && <DeviceIcon className="w-3.5 h-3.5 text-white/40 shrink-0" />}
                              <span className="truncate max-w-[150px]">
                                {[device?.os, device?.browser].filter(Boolean).join(" · ") || "—"}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/30 font-semibold">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-white/50 font-medium whitespace-nowrap">
                          {device?.lastSeenAt ? (
                            <span title={dayjs(device.lastSeenAt).format("DD MMM YYYY, h:mm A")}>
                              {dayjs(device.lastSeenAt).fromNow()}
                            </span>
                          ) : (
                            <span className="text-white/30">Never</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
