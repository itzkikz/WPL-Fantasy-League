import { X, Star, Layers } from "lucide-react";
import { Player } from "../../../features/players/types";

interface PlayerActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: (Player & { teamColor?: string; shirtNumber?: number }) | null;
  onMakeCaptain: (player: Player) => void;
  onMakeViceCaptain: (player: Player) => void;
  onSubstitute: (player: Player) => void;
  getPlayerPrice: (player: Player) => string;
}

const PlayerActionModal = ({
  isOpen,
  onClose,
  player,
  onMakeCaptain,
  onMakeViceCaptain,
  onSubstitute,
  getPlayerPrice,
}: PlayerActionModalProps) => {
  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-elevated border border-border rounded-t-3xl sm:rounded-3xl shadow-modal overflow-hidden z-10 animate-in slide-in-from-bottom-5 duration-300">
        {/* Modal Header */}
        <div className="bg-card p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10"
              style={{ backgroundColor: player.teamColor || "#ccc" }}
            >
              <span className="text-xs font-bold text-white font-mono">{player.shirtNumber || "—"}</span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">{player.name}</h3>
              <p className="text-[11px] text-text-muted">{player.position} • {player.team} • {getPlayerPrice(player)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
 
        {/* Action Options list */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => onMakeCaptain(player)}
            className="w-full bg-surface/50 hover:bg-card/75 border border-border/60 rounded-xl p-3 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-white block">Make Captain</span>
              <span className="text-[9px] text-text-muted">Double points this gameweek.</span>
            </div>
          </button>
 
          <button
            onClick={() => onMakeViceCaptain(player)}
            className="w-full bg-surface/50 hover:bg-card/75 border border-border/60 rounded-xl p-3 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-400/10 text-slate-300 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-white block">Make Vice Captain</span>
              <span className="text-[9px] text-text-muted">Backup double points source.</span>
            </div>
          </button>
 
          <button
            onClick={() => onSubstitute(player)}
            className="w-full bg-surface/50 hover:bg-card/75 border border-border/60 rounded-xl p-3 flex items-center gap-3 text-left active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-white block">Substitute Player</span>
              <span className="text-[9px] text-text-muted">Swap starters with bench.</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerActionModal;
