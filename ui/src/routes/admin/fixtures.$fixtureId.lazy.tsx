import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import dayjs from "dayjs";

export const Route = createLazyFileRoute("/admin/fixtures/$fixtureId")({
  component: FixtureDetails,
});

function statusDisplay(fixture: any) {
  if (fixture?.status?.type === "finished") {
    return { label: "FT", class: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" };
  }
  if (fixture?.status?.type === "inprogress") {
    return { label: "LIVE", class: "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" };
  }
  return { label: "NS", class: "bg-white/5 text-white/50 border border-white/10" };
}

function incidentIcon(incident: any) {
  if (incident.incidentType === "goal") {
    if (incident.incidentClass === "ownGoal") return "⚽ (OG)";
    return "⚽";
  }
  if (incident.incidentType === "card") {
    if (incident.incidentClass === "red") return "🟥";
    if (incident.incidentClass === "yellowRed") return "🟨🟥";
    return "🟨";
  }
  if (incident.incidentType === "substitution") return "↔️";
  if (incident.incidentType === "varDecision") return "📹";
  return "📌";
}

function incidentLabel(incident: any, teamName: string) {
  const player = incident.player?.name || "Unknown";
  if (incident.incidentType === "goal") {
    if (incident.incidentClass === "ownGoal") return `Own Goal by ${player}`;
    if (incident.incidentClass === "penalty") return `Penalty Goal by ${player}`;
    return `Goal by ${player}`;
  }
  if (incident.incidentType === "card") {
    if (incident.incidentClass === "red") return `Red Card — ${player}`;
    if (incident.incidentClass === "yellowRed") return `Second Yellow — ${player}`;
    return `Yellow Card — ${player}`;
  }
  if (incident.incidentType === "substitution") {
    const inP = incident.playerIn?.name || "Unknown";
    const outP = incident.playerOut?.name || "Unknown";
    return `${outP} ↔ ${inP}`;
  }
  if (incident.incidentType === "varDecision") {
    return `VAR: ${incident.incidentClass || "Decision"}`;
  }
  return incident.incidentType;
}

function FixtureDetails() {
  const { fixtureId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<"incidents" | "stats">("incidents");

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FIXTURE_STATS, fixtureId],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.FIXTURE_STATS(fixtureId));
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-full mt-4">
        Failed to load match data. Please try again.
      </div>
    );
  }

  const { fixture, incidents, playerInfo } = data?.data || {};
  const status = statusDisplay(fixture);
  const homeScore = fixture?.homeScore?.current;
  const awayScore = fixture?.awayScore?.current;

  const homePlayers = (playerInfo || []).filter((p: any) => p.side === "home");
  const awayPlayers = (playerInfo || []).filter((p: any) => p.side === "away");

  const sortedIncidents = [...(incidents || [])].sort((a: any, b: any) => (a.time || 0) - (b.time || 0));

  return (
    <div className="w-full p-2 sm:p-4 space-y-3 animate-fade-in text-white">
      {/* Back link */}
      <div className="flex items-center gap-2">
        <a
          href="/admin/fixtures"
          className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← Fixtures
        </a>
        <span className="text-[10px] font-bold text-white/30">/</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Match #{fixtureId}</span>
      </div>

      {/* Compact Match Header */}
      <div className="bg-[#150f24]/50 border border-white/5 rounded-xl px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
            {fixture?.startTimestamp ? dayjs.unix(fixture.startTimestamp).format("dddd, MMMM D, YYYY • HH:mm") : ""}
          </span>
          <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${status.class}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className="font-black text-white/90 text-right text-sm sm:text-base truncate">
              {fixture?.homeTeamShortName || fixture?.homeTeamName || "Home"}
            </span>
          </div>

          <div className="px-4 py-1.5 bg-black/40 rounded-lg border border-white/10 min-w-[72px] flex justify-center items-center font-black text-xl tracking-widest text-indigo-300 shadow-inner">
            {homeScore != null && awayScore != null ? (
              `${homeScore} - ${awayScore}`
            ) : (
              <span className="text-[10px] font-extrabold text-white/30">VS</span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-start gap-2">
            <span className="font-black text-white/90 text-sm sm:text-base truncate">
              {fixture?.awayTeamShortName || fixture?.awayTeamName || "Away"}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Legend */}
      <div className="bg-[#150f24]/50 border border-white/5 rounded-lg px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Legend</span>
        {[
          { k: "Min", v: "Minutes" },
          { k: "G", v: "Goals" },
          { k: "A", v: "Assists" },
          { k: "CS", v: "Clean Sheet" },
          { k: "YC", v: "Yellow Cards" },
          { k: "RC", v: "Red Cards" },
          { k: "SV", v: "Saves" },
          { k: "Tck", v: "Tackles" },
          { k: "Clr", v: "Clearances" },
          { k: "Blk", v: "Blocks" },
          { k: "Rec", v: "Ball Recoveries" },
          { k: "Pts", v: "Fantasy Points" },
        ].map((item) => (
          <span key={item.k} className="inline-flex items-center gap-1 text-[9px] font-semibold text-white/50 whitespace-nowrap">
            <span className="font-black text-white/80">{item.k}</span> = {item.v}
          </span>
        ))}
      </div>

      {/* Compact Tabs */}
      <div className="flex gap-1 bg-[#150f24]/50 border border-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("incidents")}
          className={`flex-1 text-[10px] font-extrabold uppercase tracking-wider py-2 rounded-lg transition-all ${
            activeTab === "incidents"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.12)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          Match Incidents ({(incidents || []).length})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 text-[10px] font-extrabold uppercase tracking-wider py-2 rounded-lg transition-all ${
            activeTab === "stats"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.12)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          Player Stats ({(playerInfo || []).length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "incidents" && (
        <div className="bg-[#150f24]/50 border border-white/5 rounded-xl px-2 py-1.5">
          {sortedIncidents.length === 0 ? (
            <p className="text-white/40 text-center py-6 text-xs font-medium">No incidents recorded for this match.</p>
          ) : (
            <div className="space-y-0.5">
              {sortedIncidents.map((incident: any, idx: number) => {
                const isHome = incident.isHome;
                const teamName = isHome ? (fixture?.homeTeamShortName || "Home") : (fixture?.awayTeamShortName || "Away");

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5 ${
                      isHome ? "" : "flex-row-reverse text-right"
                    }`}
                  >
                    <div className="w-8 text-center text-xs font-black text-white/50 tabular-nums">
                      {incident.time != null ? `${incident.time}'` : ""}
                    </div>

                    <div className="text-sm w-5 text-center">{incidentIcon(incident)}</div>

                    <div className={`flex-1 ${isHome ? "" : "text-right"}`}>
                      <p className="text-xs font-semibold text-white/90">
                        {incidentLabel(incident, teamName)}
                      </p>
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-white/40 mt-0.5">
                        {teamName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="grid gap-3 xl:grid-cols-2">
          {homePlayers.length > 0 && (
            <PlayerStatsSection
              teamName={fixture?.homeTeamShortName || fixture?.homeTeamName || "Home"}
              players={homePlayers}
              side="home"
            />
          )}
          {awayPlayers.length > 0 && (
            <PlayerStatsSection
              teamName={fixture?.awayTeamShortName || fixture?.awayTeamName || "Away"}
              players={awayPlayers}
              side="away"
            />
          )}
          {playerInfo?.length === 0 && (
            <div className="bg-[#150f24]/50 border border-white/5 rounded-xl xl:col-span-2">
              <p className="text-white/40 text-center py-8 text-xs font-medium">No player stats available for this match.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerStatsSection({ teamName, players, side }: { teamName: string; players: any[]; side: string }) {
  const starters = players.filter((p) => !p.gameweekStats?.substitute);
  const subs = players.filter((p) => p.gameweekStats?.substitute);

  const positionOrder: Record<string, number> = { Goalkeeper: 0, Defender: 1, Midfielder: 2, Forward: 3 };
  const sortByPosition = (a: any, b: any) =>
    (positionOrder[a.position] ?? 99) - (positionOrder[b.position] ?? 99);

  starters.sort(sortByPosition);
  subs.sort(sortByPosition);

  return (
    <div className="bg-[#150f24]/50 border border-white/5 rounded-xl overflow-hidden">
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-3 rounded-full ${side === "home" ? "bg-indigo-500" : "bg-emerald-500"}`}></div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/90">
            {teamName}
          </h3>
        </div>
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-white/40">
          {players.length} players
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-2.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40">Player</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">Min</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">G</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">A</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">CS</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">YC</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">RC</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">SV</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">Tck</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">Clr</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">Blk</th>
              <th className="px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-white/40 text-center">Rec</th>
              <th className="px-2 py-2 text-[9px] font-extrabold uppercase tracking-wider text-indigo-400/80 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {starters.map((player: any) => (
              <PlayerRow key={player.playerId} player={player} />
            ))}
            {subs.length > 0 && (
              <>
                <tr>
                  <td colSpan={13} className="px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white/40 border-t border-white/10 bg-white/5">
                    Substitutes
                  </td>
                </tr>
                {subs.map((player: any) => (
                  <PlayerRow key={player.playerId} player={player} />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerRow({ player }: { player: any }) {
  const s = player.gameweekStats || {};

  return (
    <tr className="border-t border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white/90 truncate max-w-[140px]">{player.playerName}</p>
            <p className="text-[8px] font-extrabold uppercase tracking-wider text-white/40">
              {player.position}
              {s.substitute ? " (Sub)" : ""}
            </p>
            {(player.fantasyTeams || []).length > 0 && (
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {(player.fantasyTeams || []).map((teamName: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 text-[8px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded px-1 py-px whitespace-nowrap"
                  >
                    <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                    {teamName}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white/80 tabular-nums">{s.minutesPlayed ?? "-"}</td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white font-bold tabular-nums">{s.goals || 0}</td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white/80 tabular-nums">{s.goalAssist || 0}</td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white/80 tabular-nums">
        {s.cleanSheet ? "✓" : "-"}
      </td>
      <td className="px-1.5 py-1.5 text-center">
        {s.yellowCards > 0 ? (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-yellow-400/20 text-yellow-400 text-[10px] font-bold">{s.yellowCards}</span>
        ) : (
          <span className="text-white/30 text-xs">-</span>
        )}
      </td>
      <td className="px-1.5 py-1.5 text-center">
        {s.redCards > 0 ? (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-red-500/20 text-red-500 text-[10px] font-bold">{s.redCards}</span>
        ) : (
          <span className="text-white/30 text-xs">-</span>
        )}
      </td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white/80 tabular-nums">{s.saves || 0}</td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white/80 tabular-nums">{s.totalTackle || 0}</td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white/80 tabular-nums">{s.totalClearance || 0}</td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white/80 tabular-nums">{s.outfielderBlock || 0}</td>
      <td className="px-1.5 py-1.5 text-center text-xs text-white/80 tabular-nums">{s.ballRecovery || 0}</td>
      <td className="px-2 py-1.5 text-center text-xs font-black text-indigo-400 tabular-nums">
        {player.gameweekPoints ?? "-"}
      </td>
    </tr>
  );
}
