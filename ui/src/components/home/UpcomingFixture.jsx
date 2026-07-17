import React from "react";
import { Card, CardHeader } from "./Primitives";
import dayjs from "dayjs";

const POSITION_STYLES = {
  GK: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/25", dot: "bg-amber-400" },
  DEF: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/25", dot: "bg-blue-400" },
  MID: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  FWD: { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/25", dot: "bg-rose-400" },
};

export default function UpcomingFixture({ fixtures = [], gameweek }) {
  if (!fixtures || fixtures.length === 0) {
    return (
      <Card padded={false} className="h-full p-3 sm:p-4">
        <CardHeader title="Next Match" className="!mb-2" />
        <div className="flex items-center justify-center h-20 text-text-secondary text-xs">
          No upcoming fixtures
        </div>
      </Card>
    );
  }

  const fixture = fixtures[0];
  const { homeTeam, awayTeam, homePlayers, awayPlayers, startTimestamp, status, homeScore, awayScore } = fixture;
  const isFinished = status?.type === "finished";
  const isInProgress = status?.type === "inprogress";
  const kickoff = dayjs(startTimestamp * 1000);
  const isUpcoming = !isFinished && !isInProgress;

  return (
    <Card padded={false} className="h-full p-3 sm:p-4">
      <CardHeader title="Next Match" className="!mb-3" />

      {/* GW pill */}
      <div className="flex items-center justify-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
          Gameweek {gameweek}
          {isFinished && <span className="text-text-muted/40"> · FT</span>}
        </span>
      </div>

      {/* Mobile: vertical stack | Desktop: horizontal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <TeamCrest team={homeTeam} />
          {homePlayers.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {homePlayers.map((p) => (
                <PlayerChip key={p.id} player={p} />
              ))}
            </div>
          )}
        </div>

        {/* Center score / time */}
        <div className="flex flex-col items-center shrink-0">
          {isFinished || isInProgress ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono tabular-nums">{homeScore?.display ?? 0}</span>
              <span className="text-xs font-bold text-text-muted/40">:</span>
              <span className="text-2xl font-black text-white font-mono tabular-nums">{awayScore?.display ?? 0}</span>
            </div>
          ) : (
            <div className="text-lg font-black text-white/20 font-mono">vs</div>
          )}

          {isUpcoming ? (
            <div className="flex flex-col items-center gap-0.5 mt-1">
              <span className="text-[11px] font-bold text-white/60">{kickoff.format("ddd, D MMM")}</span>
              <span className="text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">{kickoff.format("h:mm A")}</span>
            </div>
          ) : (
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isInProgress ? "text-rose-400 animate-pulse" : "text-text-muted/40"}`}>
              {isInProgress ? "LIVE" : "Full Time"}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <TeamCrest team={awayTeam} />
          {awayPlayers.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {awayPlayers.map((p) => (
                <PlayerChip key={p.id} player={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function TeamCrest({ team }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {team.photo ? (
        <img src={team.photo} className="w-10 h-10 sm:w-11 sm:h-11 object-contain" alt={team.name} />
      ) : (
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-lg"
          style={{ backgroundColor: team.color }}
        >
          {team.shortName?.slice(0, 3)}
        </div>
      )}
      <span className="text-[10px] sm:text-[11px] font-bold text-white leading-tight text-center truncate w-full">{team.shortName}</span>
    </div>
  );
}

function PlayerChip({ player }) {
  const style = POSITION_STYLES[player.position] || POSITION_STYLES.MID;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-[3px] rounded-md border text-[9px] font-semibold ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${style.dot}`} />
      <span className="truncate max-w-[55px]">{player.name}</span>
    </span>
  );
}
