export interface AdminNavItem {
  label: string;
  path: string;
  description: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Fixtures", path: "/admin/fixtures", description: "Match scheduling" },
  { label: "Teams", path: "/admin/teams", description: "Real-world clubs" },
  { label: "Players", path: "/admin/players", description: "Player management" },
  { label: "Roster Changes", path: "/admin/roster-changes", description: "Squad import logs" },
  { label: "Users", path: "/admin/users", description: "Accounts & roles" },
  { label: "Fantasy Teams", path: "/admin/fantasy-teams", description: "Manager squads" },
  { label: "Transfers", path: "/admin/transfers", description: "Transfer activity" },
  { label: "Substitutions", path: "/admin/substitutions", description: "Auto-subs & swaps" },
  { label: "Leagues", path: "/admin/leagues", description: "League management" },
  { label: "H2H Leagues", path: "/admin/h2h-leagues", description: "Head-to-head leagues" },
  { label: "Notifications", path: "/admin/notifications", description: "Send updates" },
  { label: "Facts & News", path: "/admin/facts", description: "News items" },
  { label: "Gameweeks", path: "/admin/gameweeks", description: "Gameweek control" },
  { label: "Sheets", path: "/admin/sheets", description: "Data sheets" },
];
