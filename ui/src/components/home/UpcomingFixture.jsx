import React, { useState } from "react";
import { Card, CardHeader } from "./Primitives";
import dayjs from "dayjs";

const POSITION_STYLES = {
  GK: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/25", dot: "bg-amber-400" },
  DEF: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/25", dot: "bg-blue-400" },
  MID: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  FWD: { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/25", dot: "bg-rose-400" },
};

function TeamCrest({ team, size = "md" }) {
  const [imgError, setImgError] = useState(false);
  const src = team.logo || team.photo;
  const showImg = src && !imgError;
  const sizeClasses = size === "md" ? "w-10 h-10" : "w-8 h-8";

  if (showImg) {
    return <img src={src} className={`${sizeClasses} object-contain`} alt={team.name} onError={() => setImgError(true)} />;
  }

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg shrink-0`}
      style={{ backgroundColor: team.color || "#333" }}
    >
      {team.shortName?.slice(0, 3) || "?"}
    </div>
  );
}

function PlayerChip({ player }) {
  const style = POSITION_STYLES[player.position] || POSITION_STYLES.MID;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-[3px] rounded border text-[8px] font-semibold ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-[4px] h-[4px] rounded-full ${style.dot}`} />
      <span className="truncate max-w-[50px]">{player.name}</span>
    </span>
  );
}

export default function UpcomingFixture({ fixtures = [], gameweek }) {
  const upcomingFixture = fixtures.find((f) => f.status?.type === "notstarted");

  if (!upcomingFixture) {
    return (
      <Card padded={false} className="p-3 sm:p-4">
        <CardHeader title="Upcoming Match" className="!mb-0" />
        <div className="flex items-center justify-center h-12 text-text-secondary text-xs font-medium">
          No upcoming fixtures
        </div>
      </Card>
    );
  }

  const { homeTeam, awayTeam, homePlayers = [], awayPlayers = [], startTimestamp, status } = upcomingFixture;
  const isFinished = status?.type === "finished";
  const isInProgress = status?.type === "inprogress";
  const isNotStarted = status?.type === "notstarted";
  const kickoff = dayjs(startTimestamp * 1000);

  return (
    <Card padded={false} className="p-3 sm:p-4">
      <CardHeader title={isInProgress ? "Live Match" : isFinished ? "Result" : "Upcoming Match"} className="!mb-2" />
      {/* Fixture row */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <TeamCrest team={homeTeam} />
          <span className="text-sm font-bold text-white truncate">{homeTeam.shortName}</span>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center shrink-0 min-w-[80px]">
          {isNotStarted ? (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-white/40">{kickoff.format("ddd, D MMM")}</span>
              <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded mt-0.5">{kickoff.format("h:mm A")}</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono tabular-nums">{upcomingFixture.homeScore?.display ?? 0}</span>
              <span className="text-xs font-bold text-text-muted/40">-</span>
              <span className="text-2xl font-black text-white font-mono tabular-nums">{upcomingFixture.awayScore?.display ?? 0}</span>
            </div>
          )}
          <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isInProgress ? "text-rose-400 animate-pulse" : isFinished ? "text-text-muted/40" : "text-text-secondary"}`}>
            {isInProgress ? "LIVE" : isFinished ? "FT" : `GW${gameweek}`}
          </span>
        </div>

        {/* Away */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
          <span className="text-sm font-bold text-white truncate text-right">{awayTeam.shortName}</span>
          <TeamCrest team={awayTeam} />
        </div>
      </div>

      {/* Players */}
      {(homePlayers.length > 0 || awayPlayers.length > 0) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {homePlayers.map((p) => <PlayerChip key={p.id} player={p} />)}
          </div>
          <div className="w-px h-3 bg-white/[0.06] mx-2 shrink-0" />
          <div className="flex flex-wrap gap-1 flex-1 min-w-0 justify-end">
            {awayPlayers.map((p) => <PlayerChip key={p.id} player={p} />)}
          </div>
        </div>
      )}
    </Card>
  );
}
