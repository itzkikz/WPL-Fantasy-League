import React, { useState } from "react";
import { Users, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Card, CardHeader, Avatar } from "./Primitives";

/**
 * YourPlayersCard - Renders squad player face images, position badges,
 * captain indicators, and acquired points badges.
 */
export default function YourPlayersCard({
  selected = 15,
  total = 15,
  yourPlayers = null,
  ctaLabel = "Manage Squad",
  onCta,
}) {
  const allPlayers = React.useMemo(() => {
    if (!yourPlayers) return [];
    if (Array.isArray(yourPlayers)) return yourPlayers.slice(0, 15);
    return [
      ...(yourPlayers.goalkeepers || []),
      ...(yourPlayers.defenders || []),
      ...(yourPlayers.midfielders || []),
      ...(yourPlayers.forwards || []),
    ].slice(0, 15);
  }, [yourPlayers]);

  return (
    <Card className="h-full flex flex-col justify-between p-3 sm:p-4 bg-surface/90 border border-border/70 shadow-xl backdrop-blur-md rounded-2xl">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-text-primary font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-purple-400" />
              <span>Your Players</span>
            </h3>
            <p className="text-text-secondary text-[11px] mt-0.5">
              {allPlayers.length || selected} / {total} Squad Members
            </p>
          </div>

          <button
            onClick={onCta}
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Columns x 3 Rows Player Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 py-1">
          {allPlayers.length === 0 ? (
            <div className="col-span-5 py-8 text-center text-text-muted text-xs">
              No players currently in your squad.
            </div>
          ) : (
            allPlayers.map((player, idx) => (
              <div
                key={player.id || `${player.name}-${idx}`}
                className="flex flex-col items-center text-center group cursor-pointer"
                title={`${player.name} (${player.position || ''} - ${player.team || ''}): ${player.points || 0} pts`}
              >
                {/* Face Image Container */}
                <div className="relative mb-1">
                  <Avatar
                    src={player.photo}
                    alt={player.name}
                    size={42}
                    className="border-2 border-purple-500/30 group-hover:border-purple-400 transition-all shadow-md group-hover:scale-105"
                  />
                  {player.isCaptain && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black font-extrabold text-[9px] flex items-center justify-center shadow-md border border-amber-200" title="Captain">
                      C
                    </span>
                  )}
                  {player.isViceCaptain && !player.isCaptain && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-300 text-black font-extrabold text-[9px] flex items-center justify-center shadow-md border border-white" title="Vice Captain">
                      V
                    </span>
                  )}
                </div>

                {/* Player Web Name */}
                <p className="text-[10px] sm:text-11px font-bold text-text-primary truncate w-full group-hover:text-purple-300 transition-colors">
                  {player.name}
                </p>

                {/* Acquired Points Pill */}
                <div className="mt-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-black shadow-sm">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span>{player.points ?? 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
