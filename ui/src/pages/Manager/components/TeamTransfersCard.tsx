import React from "react";
import dayjs from "dayjs";
import { UserMinus, UserPlus, RotateCcw, ArrowLeftRight } from "lucide-react";
import { Transfer } from "../../../features/transfers/types";

interface TeamTransfersCardProps {
  transfers?: Transfer[];
}

const formatValue = (v: number | null | undefined): string => {
  if (v == null) return "—";
  return `${v} M`;
};

export const TeamTransfersCard: React.FC<TeamTransfersCardProps> = ({ transfers = [] }) => {
  const entries = transfers
    .filter((t) => t.type === "swap" || t.type === "release" || t.type === "sign")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (entries.length === 0) return null;

  return (
    <div className="bg-background/60 border border-border/60 rounded-2xl p-3 sm:p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <RotateCcw className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider break-words">
            Transfer History
          </span>
        </div>
        <span className="text-[10px] font-black font-mono text-indigo-400 shrink-0">
          {entries.length} transfer{entries.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {entries.map((t) => {
          const isRelease = t.type === "release";
          const isSwap = t.type === "swap";
          const player = isRelease ? t.playerOut : t.playerIn;

          if (isSwap) {
            return (
              <div
                key={t._id}
                className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-2"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold min-w-0">
                    <span className="text-emerald-400 truncate">{t.playerIn?.name || "?"}</span>
                    <span className="text-[10px] text-text-muted shrink-0">→</span>
                    <span className="text-rose-400 truncate">{t.playerOut?.name || "?"}</span>
                  </div>
                  <p className="text-[9px] font-bold text-text-muted flex items-center gap-1 mt-0.5">
                    Swapped
                    <span className="text-text-muted">•</span>
                    {dayjs(t.date).format("DD MMM YYYY")}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0 text-[10px] font-mono font-black leading-tight">
                  <span className="text-emerald-400">{formatValue(t.playerIn?.auctionPrice)}</span>
                  <span className="text-rose-400">{formatValue(t.playerOut?.auctionPrice)}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={t._id}
              className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 ${
                isRelease
                  ? "border-rose-500/20 bg-rose-500/5"
                  : "border-emerald-500/20 bg-emerald-500/5"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isRelease ? (
                  <UserMinus className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold truncate ${isRelease ? "text-rose-400" : "text-emerald-400"}`}>
                    {player?.name || "Unknown"}
                  </p>
                  <p className="text-[9px] font-bold text-text-muted flex items-center gap-1 mt-0.5">
                    {isRelease ? "Released" : "Signed"}
                    <span className="text-text-muted">•</span>
                    {dayjs(t.date).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black font-mono text-text-primary shrink-0">
                {formatValue(player?.auctionPrice)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
