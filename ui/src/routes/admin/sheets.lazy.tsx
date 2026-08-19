import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import dayjs from "dayjs";

export const Route = createLazyFileRoute("/admin/sheets")({
  component: AdminSheets,
});

const SHEETS = [
  {
    key: "fantasy-teams-gamewise",
    title: "Fantasy Teams Gamewise Export",
    description:
      "One row per pick per gameweek: team, lineup role, captain/vice-captain, the stats used for points calculation and effective points.",
    tab: "FantasyTeamsGamewise",
    endpoint: API_ENDPOINTS.ADMIN.SHEETS_FANTASY_TEAMS_GAMEWISE,
  },
  {
    key: "player-stats",
    title: "Full Player Stats Export",
    description:
      "One row per player per fixture: position, auction price, team/league, fixture context (opponent, home/away, result), that match's stats and points.",
    tab: "PlayerStats",
    endpoint: API_ENDPOINTS.ADMIN.SHEETS_PLAYER_STATS,
  },
  {
    key: "fixtures",
    title: "All Fixtures Export",
    description:
      "One row per fixture across ALL gameweeks (full season): gameweek, league, round, kickoff (UTC), both teams, live status and score. Uses explicit gameweek assignments with round-number fallback for unassigned gameweeks. Rescheduled/double-gameweek fixtures are included.",
    tab: "Fixtures",
    endpoint: API_ENDPOINTS.ADMIN.SHEETS_FIXTURES,
  },
];

function SheetCard({ sheet }: { sheet: (typeof SHEETS)[number] }) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FIXTURES, `sheets-${sheet.key}`],
    queryFn: async () => {
      const response = await apiClient.get(sheet.endpoint);
      return response.data;
    },
  });

  const pushMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post(sheet.endpoint);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURES, `sheets-${sheet.key}`] });
      alert(res?.data?.message || "Pushed to sheet successfully!");
    },
    onError: () => {
      alert("Failed to push to sheet. Check server logs.");
    },
  });

  const lastPushedAt = data?.lastPushedAt ?? null;

  return (
    <div className="bg-[#150f24]/50 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black tracking-tight text-white/90">{sheet.title}</h3>
          <p className="text-[10px] text-white/50 font-medium mt-0.5">{sheet.description}</p>
          <p className="text-[10px] text-indigo-400 font-bold mt-0.5">Tab: {sheet.tab}</p>
        </div>
        <button
          onClick={() => pushMutation.mutate()}
          disabled={pushMutation.isPending}
          className="text-[10px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-lg transition-all whitespace-nowrap bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 disabled:opacity-50 shadow-sm"
        >
          {pushMutation.isPending ? "Pushing..." : "Push to Sheet"}
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-white/60 font-semibold">
            {isLoading
              ? "Loading last push time..."
              : lastPushedAt
              ? `Last pushed: ${dayjs(lastPushedAt).format("DD MMM YYYY • HH:mm:ss")}`
              : "Never pushed yet"}
          </p>
          <button
            onClick={() => refetch()}
            className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 text-white/70 hover:bg-white/15 border border-white/10 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminSheets() {
  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            Sheets Dashboard
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Export live application data to Google Sheets
          </p>
        </div>
      </div>

      {SHEETS.map((sheet) => (
        <SheetCard key={sheet.key} sheet={sheet} />
      ))}
    </div>
  );
}
