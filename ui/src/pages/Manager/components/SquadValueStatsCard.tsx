import React from "react";
import { Coins } from "lucide-react";
import { Player } from "../../../features/players/types";
import { getPlayerDisplayPrice } from "../../../libs/helpers/player";

interface SquadValueStatsCardProps {
  starting?: {
    GK?: Player[];
    DEF?: Player[];
    MID?: Player[];
    FWD?: Player[];
  };
  bench?: Player[];
}

export const SquadValueStatsCard: React.FC<SquadValueStatsCardProps> = ({
  starting,
  bench = [],
}) => {
  const getStartingList = () => {
    if (!starting) return [];
    return [...(starting.GK || []), ...(starting.DEF || []), ...(starting.MID || []), ...(starting.FWD || [])];
  };

  const starters = getStartingList();
  const allSquadPlayers = [...starters, ...bench];

  if (allSquadPlayers.length === 0) return null;

  // Helper to extract numerical price
  const parsePlayerPrice = (p: Player) => {
    if (p.auctionPrice && p.auctionPrice > 0) return p.auctionPrice;
    const displayStr = getPlayerDisplayPrice(p);
    const num = parseFloat(displayStr.replace("£", "").replace("m", ""));
    return isNaN(num) ? 0 : num;
  };

  const formatPrice = (p: Player) => {
    const val = parsePlayerPrice(p);
    return val > 0 ? `£${val.toFixed(1)}m` : "N/A";
  };

  // Squad Financial Values
  const totalVal = allSquadPlayers.reduce((acc, p) => acc + parsePlayerPrice(p), 0);
  const avgPrice = allSquadPlayers.length > 0 ? (totalVal / allSquadPlayers.length).toFixed(1) : "0.0";

  // Priciest Asset
  const priciestPlayer = allSquadPlayers.reduce(
    (max, p) => (parsePlayerPrice(p) > parsePlayerPrice(max) ? p : max),
    allSquadPlayers[0]
  );

  // Best Points-to-Price Value Pick (Efficiency)
  const getValueEfficiency = (p: Player) => {
    const cost = parsePlayerPrice(p);
    const pts = Number(p.point) || 0;
    return cost > 0 ? pts / cost : 0;
  };

  const bestValuePlayer = starters.reduce(
    (max, p) => (getValueEfficiency(p) > getValueEfficiency(max) ? p : max),
    starters[0] || allSquadPlayers[0]
  );

  const bestValuePtsPerM = bestValuePlayer ? getValueEfficiency(bestValuePlayer).toFixed(1) : "0.0";

  return (
    <div className="bg-background/60 border border-border/60 rounded-2xl p-3 sm:p-3.5 space-y-3">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider break-words">
            Player Values & Valuation
          </span>
        </div>
        <span className="text-xs font-black font-mono text-amber-400 shrink-0">
          {totalVal > 0 ? `£${totalVal.toFixed(1)}m` : "N/A"}
        </span>
      </div>

      {/* 2-Card Metric Grid (Responsive flex-col on small screens, grid on sm+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Priciest Asset */}
        <div className="bg-surface/60 border border-border/40 rounded-xl p-2.5 space-y-1">
          <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Priciest Asset</span>
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <p className="font-black text-text-primary text-xs leading-tight break-words">{priciestPlayer?.name || "N/A"}</p>
              <p className="text-[9px] text-text-muted mt-0.5 leading-none">{priciestPlayer?.position} • {priciestPlayer?.team}</p>
            </div>
            <span className="text-xs font-black font-mono text-amber-400 shrink-0 pt-0.5">
              {priciestPlayer ? formatPrice(priciestPlayer) : "N/A"}
            </span>
          </div>
        </div>

        {/* Best Value Pick */}
        <div className="bg-surface/60 border border-border/40 rounded-xl p-2.5 space-y-1">
          <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Best Value Pick</span>
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <p className="font-black text-text-primary text-xs leading-tight break-words">{bestValuePlayer?.name || "N/A"}</p>
              <p className="text-[9px] text-text-muted mt-0.5 leading-none">{bestValuePlayer?.point || 0} pts • {formatPrice(bestValuePlayer)}</p>
            </div>
            <span className="text-[10px] font-black font-mono text-emerald-400 shrink-0 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded whitespace-nowrap">
              {bestValuePtsPerM} pts/£m
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-1 pt-1.5 border-t border-border/30 text-[10px] font-mono text-text-muted">
        <span>Average Player Cost: <strong className="text-text-primary font-bold">£{avgPrice}m</strong></span>
        <span>Squad Size: <strong className="text-text-primary font-bold">{allSquadPlayers.length} players</strong></span>
      </div>
    </div>
  );
};
