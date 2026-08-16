import React from "react";
import { Modal } from "../../../components/common/Modal";
import {
  X,
  Clock,
  Goal,
  Footprints,
  Shield,
  Zap,
  Hand,
  TriangleAlert,
  Crown,
  Trophy,
} from "lucide-react";

interface Rule {
  label: string;
  value: string;
  positive?: boolean;
  note?: string;
}

interface RuleSection {
  title: string;
  icon: React.ReactNode;
  iconClass: string;
  rules: Rule[];
}

// Mirrors the scoring engine in server/src/lib/points.ts
const SECTIONS: RuleSection[] = [
  {
    title: "Match Appearance",
    icon: <Clock className="w-3.5 h-3.5" />,
    iconClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    rules: [
      { label: "Played 60+ minutes", value: "+2", positive: true },
      { label: "Played under 60 minutes", value: "+1", positive: true },
      { label: "Did not play", value: "0" },
    ],
  },
  {
    title: "Goals",
    icon: <Goal className="w-3.5 h-3.5" />,
    iconClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    rules: [
      { label: "Goalkeeper", value: "+10", positive: true },
      { label: "Defender", value: "+6", positive: true },
      { label: "Midfielder", value: "+5", positive: true },
      { label: "Forward", value: "+4", positive: true },
    ],
  },
  {
    title: "Assists",
    icon: <Footprints className="w-3.5 h-3.5" />,
    iconClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    rules: [
      { label: "Per assist", value: "+3", positive: true },
    ],
  },
  {
    title: "Clean Sheet",
    icon: <Shield className="w-3.5 h-3.5" />,
    iconClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    rules: [
      { label: "Goalkeeper / Defender", value: "+4", positive: true },
      { label: "Midfielder", value: "+1", positive: true },
      { label: "Forward", value: "0" },
    ],
  },
  {
    title: "Defensive Contributions",
    icon: <Zap className="w-3.5 h-3.5" />,
    iconClass: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    rules: [
      {
        label: "10+ actions (Defender)",
        value: "+2",
        positive: true,
        note: "Flat bonus when the threshold is reached",
      },
      {
        label: "12+ actions (GK / Mid / Fwd)",
        value: "+2",
        positive: true,
        note: "Flat bonus when the threshold is reached",
      },
      {
        label: "Counted actions",
        value: "—",
        note: "Tackles + clearances + blocks + interceptions + ball recoveries (per match)",
      },
    ],
  },
  {
    title: "Goalkeeper Extras",
    icon: <Hand className="w-3.5 h-3.5" />,
    iconClass: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    rules: [
      { label: "Penalty saved", value: "+5", positive: true },
      { label: "Every 3 saves", value: "+1", positive: true },
    ],
  },
  {
    title: "Discipline",
    icon: <TriangleAlert className="w-3.5 h-3.5" />,
    iconClass: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    rules: [
      { label: "Yellow card", value: "-1" },
      { label: "Red card", value: "-3" },
      { label: "Penalty missed", value: "-2" },
    ],
  },
];

export default function PointsSystemModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-border/60 bg-background/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-text-primary">
              Points System
            </h3>
            <p className="text-[10px] sm:text-xs text-text-muted">
              How player points are calculated
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-background border border-border text-text-muted hover:text-text-primary active:scale-95 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-card border border-border/60 rounded-2xl p-3 sm:p-3.5"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className={`p-1.5 rounded-lg border ${section.iconClass} shrink-0`}
              >
                {section.icon}
              </div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-text-primary">
                {section.title}
              </h4>
            </div>
            <div className="space-y-1.5">
              {section.rules.map((rule) => (
                <div
                  key={rule.label}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="text-text-muted font-medium break-words leading-snug">
                      {rule.label}
                    </span>
                    {rule.note && (
                      <p className="text-[9px] text-text-muted/70 leading-tight mt-0.5">
                        {rule.note}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-mono font-black shrink-0 ${
                      rule.positive
                        ? "text-emerald-400"
                        : rule.value.startsWith("-")
                        ? "text-rose-400"
                        : "text-text-muted"
                    }`}
                  >
                    {rule.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Captain note */}
        <div className="flex items-start gap-2.5 bg-secondary/10 border border-secondary/20 rounded-2xl p-3">
          <div className="p-1.5 rounded-lg bg-secondary/20 text-secondary shrink-0">
            <Crown className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-black text-text-primary leading-snug">
              Captain & Vice-Captain
            </p>
            <p className="text-[10px] text-text-muted leading-snug mt-0.5">
              The captain earns double points. The vice-captain earns double
              points when the captain doesn't play.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
