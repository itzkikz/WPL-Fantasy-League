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

  useEffect(() => {
    if (playerList.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * playerList.length));
    }
  }, [playerList.length]);

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
  const pTotalPoints = currentSpotlight.totalPoints ?? p.totalPoints;

  const formBars = normalizeForm(pForm);

  const allPossibleStats = [
    { label: "Mins", rawVal: pStats.minutesPlayed, displayVal: pStats.minutesPlayed },
    { label: "Goals", rawVal: pStats.goals, displayVal: pStats.goals },
    { label: "Assists", rawVal: pStats.assists, displayVal: pStats.assists },
    { label: "CS", rawVal: pStats.cleanSheet, displayVal: pStats.cleanSheet },
    { label: "Saves", rawVal: pStats.saves, displayVal: pStats.saves },
    { label: "Tackles", rawVal: pStats.tackles, displayVal: pStats.tackles },
    { label: "Clear", rawVal: pStats.clearances, displayVal: pStats.clearances },
    { label: "Blocks", rawVal: pStats.blocks, displayVal: pStats.blocks },
    { label: "Recov", rawVal: pStats.recovery, displayVal: pStats.recovery },
    { label: "YC", rawVal: pStats.yellowCards, displayVal: pStats.yellowCards, color: "text-amber-400" },
    { label: "RC", rawVal: pStats.redCards, displayVal: pStats.redCards, color: "text-rose-400" },
  ];

  const activeStats = allPossibleStats.filter((s) => s.rawVal != null && s.rawVal > 0).slice(0, 4);

  const statsToRender =
    activeStats.length > 0
      ? activeStats
      : [{ label: "Status", displayVal: "DNP" }];

  return (
    <Card
      padded={false}
      className="p-2 sm:p-3.5 flex flex-col justify-between relative overflow-hidden shadow-card rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <CardHeader title="Player Spotlight" className="!mb-0 shrink-0" />
          {playerList.length > 1 && (
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/30">
              {p.team || p.fullTeamName}
            </span>
          )}
        </div>

        {/* Carousel controls */}
       
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 mb-1.5 p-1 sm:p-2 rounded-xl bg-surface/60 border border-border/50">
          <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 min-w-0 flex-1 text-center sm:text-left w-full sm:w-auto">
            <Avatar
              src={p.photo}
              alt={p.name}
              size={undefined}
              className="w-8 h-8 sm:w-11 sm:h-11 shrink-0 rounded-full border border-primary/40 shadow-sm"
            />
            <div className="min-w-0 flex-1 flex flex-col items-center sm:items-start">
              <p className="text-text-primary font-bold text-xs sm:text-sm leading-tight break-words">
                {p.name}
              </p>
              <p className="text-text-secondary text-[9px] sm:text-[10px] mt-0.5 break-words">
                <span className="font-semibold text-text-primary">{p.fullTeamName || p.team}</span>
                <span className="mx-1">•</span>
                <span className="font-mono text-secondary font-bold">{p.position}</span>
              </p>

              {/* Mobile Total Points (Under team name & position) */}
              {pTotalPoints != null && (
                <div className="mt-0.5 sm:hidden">
                  <span className="inline-block text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md font-mono whitespace-nowrap">
                    {pTotalPoints} pts
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Total Points (Right side on sm:) */}
          {pTotalPoints != null && (
            <div className="hidden sm:block text-right shrink-0">
              <span className="inline-block text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
                {pTotalPoints} pts
              </span>
            </div>
          )}
        </div>

        {/* Form Bars inline & near Heading */}
        <div className="mb-1 bg-surface/30 px-2 py-1 sm:p-1.5 rounded-xl border border-border/40 flex items-center justify-start gap-2.5 sm:gap-3">
          <span className="text-text-secondary text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shrink-0">
            Form (5 GWs)
          </span>
          <div className="flex items-end justify-start gap-1.5 sm:gap-2 h-5 sm:h-6 shrink-0">
            {formBars.map((h, i) => (
              <div key={i} className="h-full flex flex-col justify-end items-center w-3.5 sm:w-4">
                <span className="text-[6px] sm:text-[7px] font-mono font-bold text-text-secondary leading-none mb-0.5">
                  {pForm[i] ?? 0}
                </span>
                <div
                  style={{
                    height: `${Math.max(h, 0.12) * 100}%`,
                    backgroundColor: barColor(h),
                  }}
                  className="w-1.5 sm:w-2 rounded-full transition-all duration-300 shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Non-zero Key Player Stats */}
        {statsToRender.length > 0 && (
          <div className="flex items-center justify-around gap-1 border-t border-border/30 pt-1 mt-1">
            {statsToRender.map((s, i) => (
              <div
                key={i}
                className="text-center bg-surface/40 rounded-lg py-0.5 px-1 border border-border/30 flex-1 max-w-[80px]"
              >
                <p
                  className={`font-black text-[9px] sm:text-[11px] leading-tight font-mono ${
                    s.color || "text-text-primary"
                  }`}
                >
                  {s.displayVal}
                </p>
                <p className="text-text-secondary text-[7px] sm:text-[8px] leading-none whitespace-nowrap mt-0.5 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {playerList.length > 1 && (
        <div className="flex items-center justify-center gap-1 mt-1 pt-1 border-t border-border/30">
          {playerList.map((item, idx) => (
            <button
              key={idx}
              onClick={() => selectIndex(idx)}
              title={item.player?.team || `Team ${idx + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-3 bg-secondary"
                  : "w-1 bg-text-muted/30 hover:bg-text-muted/60"
              }`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
