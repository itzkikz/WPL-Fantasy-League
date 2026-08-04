import { X, ArrowRightLeft, Star, Check, Loader2, ArrowUpRight } from "lucide-react";
import Modal from "../../../components/common/Modal";
import { Player } from "../../../features/players/types";
import { Substitutions } from "../../../store/types";

interface SaveTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  substitutions: Substitutions[];
  captain: Player | null;
  viceCaptain: Player | null;
  isSaving?: boolean;
}

const SaveTeamModal = ({
  isOpen,
  onClose,
  onConfirm,
  substitutions,
  captain,
  viceCaptain,
  isSaving = false,
}: SaveTeamModalProps) => {
  const hasChanges = substitutions.length > 0 || !!captain || !!viceCaptain;

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="responsive" maxWidthClass="max-w-md">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-4 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-extrabold text-text-primary">Confirm Changes</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Review your team updates before saving</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-surface hover:bg-elevated flex items-center justify-center cursor-pointer text-text-muted hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 overflow-y-auto">
        {!hasChanges ? (
          <p className="text-xs text-text-muted italic text-center py-6">No pending changes to save.</p>
        ) : (
          <>
            {substitutions.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-2">
                  Substitutions ({substitutions.length})
                </h4>
                <div className="space-y-2">
                  {substitutions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 bg-surface border border-border/40 rounded-xl px-3 py-2.5"
                    >
                      <span className="text-xs font-bold text-rose-400 line-through truncate min-w-0">
                        {s.swapOut.name}
                      </span>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span className="text-xs font-bold text-emerald-400 truncate min-w-0">
                        {s.swapIn.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(captain || viceCaptain) && (
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-2">
                  Captaincy
                </h4>
                <div className="space-y-2">
                  {captain && (
                    <div className="flex items-center gap-2.5 bg-surface border border-border/40 rounded-xl px-3 py-2.5">
                      <Star className="w-4 h-4 text-amber-400 fill-current shrink-0" />
                      <span className="text-xs font-bold text-text-primary">Captain</span>
                      <span className="text-xs font-black text-amber-400 truncate ml-auto min-w-0">
                        {captain.name}
                      </span>
                    </div>
                  )}
                  {viceCaptain && (
                    <div className="flex items-center gap-2.5 bg-surface border border-border/40 rounded-xl px-3 py-2.5">
                      <Star className="w-4 h-4 text-text-muted shrink-0" />
                      <span className="text-xs font-bold text-text-primary">Vice Captain</span>
                      <span className="text-xs font-black text-text-secondary truncate ml-auto min-w-0">
                        {viceCaptain.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 bg-primary/10 border border-primary/25 rounded-xl px-3 py-2.5">
              <ArrowUpRight className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p className="text-[10px] text-text-muted leading-relaxed">
                These changes will be applied to your current squad and saved for the upcoming gameweek.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 bg-card border-t border-border flex gap-2.5 shrink-0">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="flex-1 border border-border/60 text-text-muted hover:text-text-primary hover:bg-elevated font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSaving || !hasChanges}
          className="flex-1 bg-gradient-button disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border-t border-white/20 text-xs shadow-lg shadow-primary/20"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Confirm & Save"}
        </button>
      </div>
    </Modal>
  );
};

export default SaveTeamModal;
