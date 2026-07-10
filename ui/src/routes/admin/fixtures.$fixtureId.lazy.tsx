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
    return { label: "FT", class: "bg-green-500/10 text-green-500 border border-green-500/20" };
  }
  if (fixture?.status?.type === "inprogress") {
    return { label: "LIVE", class: "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse" };
  }
  return { label: "NS", class: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" };
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-5xl mx-auto mt-8">
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
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <a
          href="/admin/fixtures"
          className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← Fixtures
        </a>
      </div>

      {/* Match Header */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
            {fixture?.startTimestamp ? dayjs.unix(fixture.startTimestamp).format("dddd, MMMM D, YYYY • HH:mm") : ""}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${status.class}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <div className="flex-1 flex items-center justify-end gap-3">
            <span className="font-bold text-text-primary text-right text-lg sm:text-xl">
              {fixture?.homeTeamShortName || fixture?.homeTeamName || "Home"}
            </span>
          </div>

          <div className="px-6 py-3 bg-black/20 dark:bg-black/40 rounded-full border border-white/5 min-w-[100px] flex justify-center items-center font-black text-3xl tracking-widest text-text-primary shadow-inner">
            {homeScore != null && awayScore != null ? (
              `${homeScore} - ${awayScore}`
            ) : (
              <span className="text-sm font-bold text-text-secondary">VS</span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-start gap-3">
            <span className="font-bold text-text-primary text-lg sm:text-xl">
              {fixture?.awayTeamShortName || fixture?.awayTeamName || "Away"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-full p-1">
        <button
          onClick={() => setActiveTab("incidents")}
          className={`flex-1 text-xs font-bold uppercase tracking-wider py-2.5 rounded-full transition-all ${
            activeTab === "incidents"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Match Incidents ({(incidents || []).length})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 text-xs font-bold uppercase tracking-wider py-2.5 rounded-full transition-all ${
            activeTab === "stats"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Player Stats ({(playerInfo || []).length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "incidents" && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6">
          {sortedIncidents.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No incidents recorded for this match.</p>
          ) : (
            <div className="space-y-3">
              {sortedIncidents.map((incident: any, idx: number) => {
                const isHome = incident.isHome;
                const teamName = isHome ? (fixture?.homeTeamShortName || "Home") : (fixture?.awayTeamShortName || "Away");

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-white/5 ${
                      isHome ? "" : "flex-row-reverse text-right"
                    }`}
                  >
                    <div className="w-10 text-center text-sm font-black text-text-secondary tabular-nums">
                      {incident.time != null ? `${incident.time}'` : ""}
                    </div>

                    <div className={`text-lg ${isHome ? "" : "flex-row-reverse"}`}>
                      {incidentIcon(incident)}
                    </div>

                    <div className={`flex-1 ${isHome ? "" : "text-right"}`}>
                      <p className="text-sm font-medium text-text-primary">
                        {incidentLabel(incident, teamName)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-0.5">
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
        <div className="space-y-6">
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
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6">
              <p className="text-text-secondary text-center py-8">No player stats available for this match.</p>
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
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-white/10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">
          {teamName}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-1">
          {players.length} players
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Player</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">Min</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">G</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">A</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">S</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">T</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">FC</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">FK</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">YC</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">RC</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">CS</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">SV</th>
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {starters.map((player: any) => (
              <PlayerRow key={player.playerId} player={player} />
            ))}
            {subs.length > 0 && (
              <>
                <tr>
                  <td colSpan={13} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary border-t border-white/5">
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
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{player.playerName}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {player.position}
              {s.substitute ? " (Sub)" : ""}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums">{s.minutesPlayed ?? "-"}</td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums font-bold">{s.goals || 0}</td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums">{s.goalAssist || 0}</td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums">{s.totalShots || 0}</td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums">{s.totalTackle || 0}</td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums">{s.fouls || 0}</td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums">{s.wasFouled || 0}</td>
      <td className="px-3 py-3 text-center">
        {s.yellowCards > 0 ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-yellow-400/20 text-yellow-400 text-xs font-bold">{s.yellowCards}</span>
        ) : (
          <span className="text-text-secondary">-</span>
        )}
      </td>
      <td className="px-3 py-3 text-center">
        {s.redCards > 0 ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-500/20 text-red-500 text-xs font-bold">{s.redCards}</span>
        ) : (
          <span className="text-text-secondary">-</span>
        )}
      </td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums">
        {s.cleanSheet ? "✓" : "-"}
      </td>
      <td className="px-3 py-3 text-center text-sm text-text-primary tabular-nums">{s.saves || 0}</td>
      <td className="px-3 py-3 text-center text-sm font-bold text-indigo-400 tabular-nums">
        {player.gameweekPoints ?? "-"}
      </td>
    </tr>
  );
}
