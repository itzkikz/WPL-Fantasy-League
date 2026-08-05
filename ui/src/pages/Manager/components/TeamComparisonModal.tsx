import React from "react";
import { X, Swords, Award, Coins, TrendingUp, Users } from "lucide-react";
import { Player } from "../../../features/players/types";
import { getPlayerDisplayPrice } from "../../../libs/helpers/player";

interface TeamComparisonModalProps {
  open: boolean;
  onClose: () => void;
  targetTeam: {
    teamName?: string;
    managers?: string;
    rank?: number;
    totalPoints?: number;
    gwPoints?: number;
    starting?: { GK?: Player[]; DEF?: Player[]; MID?: Player[]; FWD?: Player[] };
  };
  myTeam?: {
    teamName?: string;
    managers?: string;
    rank?: number;
    totalPoints?: number;
    gwPoints?: number;
    starting?: { GK?: Player[]; DEF?: Player[]; MID?: Player[]; FWD?: Player[] };
  };
}

export const TeamComparisonModal: React.FC<TeamComparisonModalProps> = ({
  open,
  onClose,
  targetTeam,
  myTeam,
}) => {
  if (!open) return null;

  const getStartingList = (squad?: { GK?: Player[]; DEF?: Player[]; MID?: Player[]; FWD?: Player[] }) => {
    if (!squad) return [];
    return [...(squad.GK || []), ...(squad.DEF || []), ...(squad.MID || []), ...(squad.FWD || [])];
  };

  const targetPlayers = getStartingList(targetTeam.starting);
  const myPlayers = getStartingList(myTeam?.starting);

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
  const targetTotalVal = targetPlayers.reduce((acc, p) => acc + parsePlayerPrice(p), 0);
  const myTotalVal = myPlayers.reduce((acc, p) => acc + parsePlayerPrice(p), 0);

  const targetAvgPrice = targetPlayers.length > 0 ? (targetTotalVal / targetPlayers.length).toFixed(1) : "0.0";
  const myAvgPrice = myPlayers.length > 0 ? (myTotalVal / myPlayers.length).toFixed(1) : "0.0";

  // Highest Price Player
  const getMostExpensive = (players: Player[]) => {
    if (players.length === 0) return null;
    return players.reduce((max, p) => (parsePlayerPrice(p) > parsePlayerPrice(max) ? p : max), players[0]);
  };

  const targetPriciest = getMostExpensive(targetPlayers);
  const myPriciest = getMostExpensive(myPlayers);

  // Best Points-to-Price Bargain Player (Efficiency)
  const getBestValuePlayer = (players: Player[]) => {
    if (players.length === 0) return null;
    const calcEff = (p: Player) => {
      const cost = parsePlayerPrice(p);
      const pts = Number(p.point) || 0;
      return cost > 0 ? pts / cost : 0;
    };
    return players.reduce((max, p) => (calcEff(p) > calcEff(max) ? p : max), players[0]);
  };

  const targetValuePick = getBestValuePlayer(targetPlayers);
  const myValuePick = getBestValuePlayer(myPlayers);

  // Best player by position line
  const getBestPosPlayer = (players?: Player[]) => {
    if (!players || players.length === 0) return null;
    return players.reduce((max, p) => ((Number(p.point) || 0) > (Number(max.point) || 0) ? p : max), players[0]);
  };

  // Positional Points Sum
  const sumPosPts = (players: Player[] = []) => players.reduce((acc, p) => acc + (Number(p.point) || 0), 0);

  const targetPos = {
    GK: sumPosPts(targetTeam.starting?.GK),
    DEF: sumPosPts(targetTeam.starting?.DEF),
    MID: sumPosPts(targetTeam.starting?.MID),
    FWD: sumPosPts(targetTeam.starting?.FWD),
  };

  const myPos = {
    GK: sumPosPts(myTeam?.starting?.GK),
    DEF: sumPosPts(myTeam?.starting?.DEF),
    MID: sumPosPts(myTeam?.starting?.MID),
    FWD: sumPosPts(myTeam?.starting?.FWD),
  };

  const positions = ["GK", "DEF", "MID", "FWD"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-border/60 bg-background/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-text-primary">
                Head-to-Head Comparison
              </h3>
              <p className="text-[10px] sm:text-xs text-text-muted">
                Squad metrics, player values & position breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-background border border-border text-text-muted hover:text-text-primary active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Side-by-Side Header Profile Cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Target Team */}
            <div className="bg-background/60 border border-secondary/40 rounded-2xl p-2.5 sm:p-3 text-center space-y-0.5">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-secondary">Viewing Team</span>
              <h4 className="text-xs sm:text-sm font-black text-text-primary truncate">
                {targetTeam.teamName || "Manager Team"}
              </h4>
              <p className="text-[9px] sm:text-[10px] text-text-muted truncate">{targetTeam.managers}</p>
            </div>

            {/* My Team */}
            <div className="bg-background/60 border border-primary/40 rounded-2xl p-2.5 sm:p-3 text-center space-y-0.5">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-primary">Your Team</span>
              <h4 className="text-xs sm:text-sm font-black text-text-primary truncate">
                {myTeam?.teamName || "My Team"}
              </h4>
              <p className="text-[9px] sm:text-[10px] text-text-muted truncate">{myTeam?.managers || "You"}</p>
            </div>
          </div>

          {/* Core Metric Head-to-Head */}
          <div className="bg-background/40 border border-border/60 rounded-2xl p-3 space-y-2">
            <h4 className="text-[10px] font-black uppercase text-text-muted tracking-wider">
              Core Performance Metrics
            </h4>

            <div className="space-y-1 text-xs font-mono">
              {/* Rank */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface/60 border border-border/40">
                <span className="font-black text-text-primary font-outfit text-xs">#{targetTeam.rank}</span>
                <span className="text-[10px] font-sans font-bold text-text-muted uppercase">Overall Rank</span>
                <span className="font-black text-primary font-outfit text-xs">#{myTeam?.rank ?? "-"}</span>
              </div>

              {/* Total Points */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface/60 border border-border/40">
                <span className="font-black text-secondary">{targetTeam.totalPoints} pts</span>
                <span className="text-[10px] font-sans font-bold text-text-muted uppercase">Total Points</span>
                <span className="font-black text-primary">{myTeam?.totalPoints ?? 0} pts</span>
              </div>

              {/* Gameweek Score */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface/60 border border-border/40">
                <span className="font-black text-emerald-400">{targetTeam.gwPoints} pts</span>
                <span className="text-[10px] font-sans font-bold text-text-muted uppercase">GW Score</span>
                <span className="font-black text-emerald-400">{myTeam?.gwPoints ?? 0} pts</span>
              </div>
            </div>
          </div>

          {/* Best Players by Position Matchup */}
          <div className="bg-background/40 border border-border/60 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-secondary">
              <Award className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Best Players by Position
              </span>
            </div>

            <div className="space-y-1.5">
              {positions.map((pos) => {
                const targetBest = getBestPosPlayer(targetTeam.starting?.[pos]);
                const myBest = getBestPosPlayer(myTeam?.starting?.[pos]);

                const targetPts = Number(targetBest?.point) || 0;
                const myPts = Number(myBest?.point) || 0;

                return (
                  <div key={pos} className="bg-surface/50 border border-border/40 rounded-xl p-2 flex items-center justify-between gap-2 text-xs">
                    {/* Target Best */}
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-secondary bg-secondary/10 px-1 py-0.5 rounded shrink-0">{pos}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-text-primary text-[11px] leading-tight break-words">{targetBest?.name || "N/A"}</p>
                        <p className="text-[9px] text-text-muted leading-none font-mono mt-0.5">{targetPts} pts</p>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold text-text-muted font-mono uppercase shrink-0 px-1">VS</span>

                    {/* My Best */}
                    <div className="min-w-0 flex-1 flex items-center justify-end text-right gap-1.5">
                      <div className="min-w-0">
                        <p className="font-bold text-text-primary text-[11px] leading-tight break-words">{myBest?.name || "N/A"}</p>
                        <p className="text-[9px] text-text-muted leading-none font-mono mt-0.5">{myPts} pts</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 px-1 py-0.5 rounded shrink-0">{pos}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Squad Financial & Player Values Comparison */}
          <div className="bg-background/40 border border-border/60 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Player Values & Squad Valuation
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              {/* Total Starting XI Value */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface/60 border border-border/40">
                <span className="font-black text-amber-400">
                  {targetTotalVal > 0 ? `£${targetTotalVal.toFixed(1)}m` : "N/A"}
                </span>
                <span className="text-[10px] font-sans font-bold text-text-muted uppercase">Starting XI Value</span>
                <span className="font-black text-amber-400">
                  {myTotalVal > 0 ? `£${myTotalVal.toFixed(1)}m` : "N/A"}
                </span>
              </div>

              {/* Average Player Price */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface/60 border border-border/40">
                <span className="font-black text-text-primary">£{targetAvgPrice}m</span>
                <span className="text-[10px] font-sans font-bold text-text-muted uppercase">Avg Player Cost</span>
                <span className="font-black text-text-primary">£{myAvgPrice}m</span>
              </div>
            </div>
          </div>

          {/* Marquee & Value Player Matchup */}
          <div className="bg-background/40 border border-border/60 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-secondary">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Most Expensive & Value Players
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Target Team Marquee Player */}
              <div className="bg-surface/50 border border-border/40 rounded-xl p-2 space-y-1">
                <span className="text-[8px] font-sans font-bold text-text-muted uppercase block">Priciest Asset</span>
                {targetPriciest ? (
                  <div className="flex items-center justify-between min-w-0">
                    <div className="min-w-0 pr-1">
                      <p className="font-bold text-text-primary text-[11px] leading-tight break-words">{targetPriciest.name}</p>
                      <p className="text-[9px] text-text-muted">{targetPriciest.position}</p>
                    </div>
                    <span className="font-black font-mono text-amber-400 text-xs shrink-0">{formatPrice(targetPriciest)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted">N/A</span>
                )}
              </div>

              {/* My Team Marquee Player */}
              <div className="bg-surface/50 border border-border/40 rounded-xl p-2 space-y-1">
                <span className="text-[8px] font-sans font-bold text-text-muted uppercase block">Priciest Asset</span>
                {myPriciest ? (
                  <div className="flex items-center justify-between min-w-0">
                    <div className="min-w-0 pr-1">
                      <p className="font-bold text-text-primary text-[11px] leading-tight break-words">{myPriciest.name}</p>
                      <p className="text-[9px] text-text-muted">{myPriciest.position}</p>
                    </div>
                    <span className="font-black font-mono text-amber-400 text-xs shrink-0">{formatPrice(myPriciest)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted">N/A</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              {/* Target Team Best Value Pick */}
              <div className="bg-surface/50 border border-border/40 rounded-xl p-2 space-y-1">
                <span className="text-[8px] font-sans font-bold text-text-muted uppercase block">Best Value (Pts/£)</span>
                {targetValuePick ? (
                  <div className="flex items-center justify-between min-w-0">
                    <div className="min-w-0 pr-1">
                      <p className="font-bold text-text-primary text-[11px] leading-tight break-words">{targetValuePick.name}</p>
                      <p className="text-[9px] text-text-muted">{targetValuePick.point} pts</p>
                    </div>
                    <span className="font-black font-mono text-emerald-400 text-xs shrink-0">{formatPrice(targetValuePick)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted">N/A</span>
                )}
              </div>

              {/* My Team Best Value Pick */}
              <div className="bg-surface/50 border border-border/40 rounded-xl p-2 space-y-1">
                <span className="text-[8px] font-sans font-bold text-text-muted uppercase block">Best Value (Pts/£)</span>
                {myValuePick ? (
                  <div className="flex items-center justify-between min-w-0">
                    <div className="min-w-0 pr-1">
                      <p className="font-bold text-text-primary text-[11px] leading-tight break-words">{myValuePick.name}</p>
                      <p className="text-[9px] text-text-muted">{myValuePick.point} pts</p>
                    </div>
                    <span className="font-black font-mono text-emerald-400 text-xs shrink-0">{formatPrice(myValuePick)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Positional Head-to-Head Breakdown */}
          <div className="bg-background/40 border border-border/60 rounded-2xl p-3 space-y-2">
            <h4 className="text-[10px] font-black uppercase text-text-muted tracking-wider">
              Positional Lineup Points
            </h4>

            <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
              {positions.map((pos) => {
                const targetScore = targetPos[pos];
                const myScore = myPos[pos];
                const targetWinning = targetScore > myScore;
                const myWinning = myScore > targetScore;

                return (
                  <div key={pos} className="bg-surface/50 border border-border/30 rounded-xl p-1.5 space-y-1">
                    <span className="text-[9px] font-sans font-bold text-text-muted uppercase block">{pos}</span>
                    <div className="flex items-center justify-around text-xs">
                      <span className={`font-black ${targetWinning ? "text-emerald-400" : "text-text-primary"}`}>
                        {targetScore}
                      </span>
                      <span className="text-[9px] text-text-muted font-sans">vs</span>
                      <span className={`font-black ${myWinning ? "text-emerald-400" : "text-text-primary"}`}>
                        {myScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
