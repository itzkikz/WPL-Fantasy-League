import React from "react";
import { Users, ArrowRight } from "lucide-react";
import { Card, Avatar } from "./Primitives";

/**
 * YourPlayersCard - Renders squad player face images spread out,
 * with sizes dynamically scaled based on total points.
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

  const { minPts, maxPts, spreadPlayers } = React.useMemo(() => {
    if (allPlayers.length === 0) return { minPts: 0, maxPts: 0, spreadPlayers: [] };
    const ptsList = allPlayers.map((p) => p.points ?? p.totalPoints ?? 0);
    const min = Math.min(...ptsList);
    const max = Math.max(...ptsList);

    const sorted = [...allPlayers].sort(
      (a, b) => (b.points ?? b.totalPoints ?? 0) - (a.points ?? a.totalPoints ?? 0)
    );
    const result = [];
    let l = 0,
      r = sorted.length - 1;
    while (l <= r) {
      if (l === r) {
        result.push(sorted[l]);
      } else {
        result.push(sorted[l]);
        result.push(sorted[r]);
      }
      l++;
      r--;
    }
    return { minPts: min, maxPts: max, spreadPlayers: result };
  }, [allPlayers]);

  return (
    <Card padded={false} className="h-full flex flex-col justify-between p-2.5 sm:p-4">
      <div>
        <div className="flex items-center justify-between mb-2">
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
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Spread Out Player Face Bubbles (Sized dynamically by total points) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-3 sm:py-5 min-h-[190px]">
          {spreadPlayers.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs">
              No players currently in your squad.
            </div>
          ) : (
            spreadPlayers.map((player, idx) => {
              const pts = player.points ?? player.totalPoints ?? 0;
              const range = maxPts - minPts || 1;
              const ratio = (pts - minPts) / range;
              // Size ranges from 34px (lowest points) to 74px (highest points)
              const sizePx = Math.round(34 + ratio * 40);

              return (
                <div
                  key={player.id || `${player.name}-${idx}`}
                  className="relative group cursor-pointer transition-all duration-300 hover:scale-115 hover:z-20"
                  title={`${player.name} (${player.position || ''}) • ${pts} pts`}
                >
                  <Avatar
                    src={player.photo}
                    alt={player.name}
                    size={sizePx}
                    className="border-2 border-purple-500/30 group-hover:border-purple-400 transition-all shadow-md"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
