import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, Avatar } from "./Primitives";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

function normalizeForm(formHistory) {
  if (!formHistory || formHistory.length === 0) return [0, 0, 0, 0, 0];
  const max = Math.max(...formHistory, 1);
  return formHistory.map((pts) => pts / max);
}

function barColor(normalized) {
  if (normalized <= 0.33) return "var(--color-danger)";
  if (normalized <= 0.66) return "var(--color-warning)";
  return "var(--color-success)";
}

export default function PlayerSpotlight({
  spotlightPlayers = [],
  photo,
  name,
  club,
  position,
  formHistory = [],
  points = 0,
  stats = {},
}) {
  const playerList = useMemo(() => {
    if (Array.isArray(spotlightPlayers) && spotlightPlayers.length > 0) {
      return spotlightPlayers;
    }
    if (name) {
      return [{
        player: { photo, name, team: club, fullTeamName: club, position },
        formHistory,
        gameweekPoints: points,
        stats
      }];
    }
    return [];
  }, [spotlightPlayers, photo, name, club, position, formHistory, points, stats]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (playerList.length > 0) {
      return Math.floor(Math.random() * playerList.length);
    }
    return 0;
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (playerList.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % playerList.length);
        setIsAnimating(false);
      }, 200);
    }, 6500);

    return () => clearInterval(timer);
  }, [playerList.length, isPaused]);

  const triggerNext = () => {
    if (playerList.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % playerList.length);
      setIsAnimating(false);
    }, 200);
  };

  const triggerPrev = () => {
    if (playerList.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + playerList.length) % playerList.length);
      setIsAnimating(false);
    }, 200);
  };

  const selectIndex = (idx) => {
    if (idx === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setIsAnimating(false);
    }, 200);
  };

  if (playerList.length === 0) {
    return (
      <Card padded={false} className="p-3 sm:p-3.5 flex flex-col">
        <CardHeader title="Player Spotlight" className="!mb-2" />
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8E89A6] mb-2">
            <Sparkles className="w-5 h-5 opacity-40 text-secondary" />
          </div>
          <p className="text-xs font-bold text-text-primary">No Spotlight Available</p>
        </div>
      </Card>
    );
  }

  const currentSpotlight = playerList[currentIndex] || playerList[0];
  const p = currentSpotlight.player || {};
  const pStats = currentSpotlight.stats || {};
  const pForm = currentSpotlight.formHistory || [];
  const pPoints = currentSpotlight.gameweekPoints ?? p.point ?? 0;
  const pTotalPoints = currentSpotlight.totalPoints ?? p.totalPoints;

  const isGK = p.position === "GK";
  const formBars = normalizeForm(pForm);

  const statRows = [
    { value: pPoints, label: "GW Pts" },
    { value: pStats.minutesPlayed === 0 ? "DNP" : pStats.minutesPlayed ?? 0, label: "Mins" },
    ...(!isGK ? [{ value: pStats.goals ?? 0, label: "Goals" }] : []),
    { value: pStats.assists ?? 0, label: "Assists" },
    ...(p.position === "GK" || p.position === "DEF" ? [{ value: pStats.cleanSheet ?? 0, label: "CS" }] : []),
    { value: pStats.yellowCards ?? 0, label: "YC", color: (pStats.yellowCards ?? 0) > 0 ? "text-amber-400" : undefined },
    { value: pStats.redCards ?? 0, label: "RC", color: (pStats.redCards ?? 0) > 0 ? "text-rose-400" : undefined },
    ...(isGK ? [
      { value: pStats.saves ?? 0, label: "Saves" },
    ] : []),
    { value: pStats.tackles ?? 0, label: "Tackles" },
    { value: pStats.clearances ?? 0, label: "Clear" },
    { value: pStats.blocks ?? 0, label: "Blocks" },
    { value: pStats.recovery ?? 0, label: "Recovery" },
  ];

  return (
    <Card
      padded={false}
      className="p-2.5 sm:p-3.5 flex flex-col justify-between relative overflow-hidden shadow-card rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <CardHeader title="Player Spotlight" className="!mb-0 shrink-0" />
          {playerList.length > 1 && (
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/30">
              {p.team || p.fullTeamName}
            </span>
          )}
        </div>

        {/* Carousel controls */}
        {playerList.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={triggerPrev}
              className="p-0.5 rounded bg-surface border border-border hover:bg-elevated text-text-muted hover:text-text-primary transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] font-mono font-bold text-text-muted px-0.5">
              {currentIndex + 1}/{playerList.length}
            </span>
            <button
              onClick={triggerNext}
              className="p-0.5 rounded bg-surface border border-border hover:bg-elevated text-text-muted hover:text-text-primary transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Animated Body */}
      <div
        className={`transition-all duration-250 transform ${
          isAnimating
            ? "opacity-0 scale-95"
            : "opacity-100 scale-100"
        }`}
      >
        {/* Compact Player Row & Total Pts */}
        <div className="flex items-center justify-between gap-2 mb-2 p-1.5 sm:p-2 rounded-xl bg-surface/60 border border-border/50">
          <div className="flex items-center gap-2 flex-1">
            <Avatar
              src={p.photo}
              alt={p.name}
              size={undefined}
              className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full border border-primary/40 shadow-sm"
            />
            <div className="flex-1">
              <p className="text-text-primary font-bold text-xs sm:text-sm leading-tight whitespace-normal break-words">
                {p.name}
              </p>
              <p className="text-text-secondary text-[9px] sm:text-[10px] mt-0.5 whitespace-normal break-words">
                <span className="font-semibold text-text-primary">{p.fullTeamName || p.team}</span>
                <span className="mx-1">•</span>
                <span className="font-mono text-secondary font-bold">{p.position}</span>
              </p>
            </div>
          </div>

          {pTotalPoints != null && (
            <div className="text-right shrink-0">
              <span className="text-[10px] sm:text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                {pTotalPoints} pts
              </span>
            </div>
          )}
        </div>

        {/* Compact Form Bars */}
        <div className="mb-2 bg-surface/30 px-2 py-1.5 rounded-xl border border-border/40 flex items-center justify-between gap-2">
          <span className="text-text-secondary text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shrink-0">
            Form (5 GWs)
          </span>
          <div className="flex items-end justify-end gap-1 h-6 flex-1 max-w-[140px]">
            {formBars.map((h, i) => (
              <div key={i} className="h-full flex-1 flex flex-col justify-end items-center">
                <span className="text-[6px] sm:text-[7px] font-mono font-bold text-text-secondary leading-none mb-0.5">
                  {pForm[i] ?? 0}
                </span>
                <div
                  style={{
                    height: `${Math.max(h, 0.1) * 100}%`,
                    backgroundColor: barColor(h),
                  }}
                  className="w-full rounded-sm transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 border-t border-border/40 pt-1.5">
          {statRows.map((s, i) => (
            <MiniStat key={i} value={s.value ?? 0} label={s.label} color={s.color} />
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {playerList.length > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2 pt-1.5 border-t border-border/30">
          {playerList.map((item, idx) => (
            <button
              key={idx}
              onClick={() => selectIndex(idx)}
              title={item.player?.team || `Team ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-4 bg-secondary"
                  : "w-1.5 bg-text-muted/30 hover:bg-text-muted/60"
              }`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function MiniStat({ value, label, color }) {
  return (
    <div className="text-center bg-surface/40 rounded-md py-0.5 px-0.5 border border-border/30">
      <p className={`font-black text-[9px] sm:text-[11px] leading-tight font-mono ${color || "text-text-primary"}`}>{value}</p>
      <p className="text-text-secondary text-[7px] sm:text-[8px] leading-none whitespace-nowrap mt-0.5 font-medium">{label}</p>
    </div>
  );
}
