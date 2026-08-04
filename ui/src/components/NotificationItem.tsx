import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { X, Bell, CalendarDays, Trophy, ArrowLeftRight, Newspaper } from "lucide-react";

dayjs.extend(relativeTime);

type KindConfig = {
  key: string;
  match: RegExp;
  icon: typeof Bell;
  iconColor: string;
  bg: string;
  border: string;
  bar: string;
};

const KINDS: KindConfig[] = [
  {
    key: "gameweek",
    match: /gameweek|fixture|match|deadline|kick\s*off|schedule|kickoff/i,
    icon: CalendarDays,
    iconColor: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    bar: "bg-indigo-400",
  },
  {
    key: "points",
    match: /point|score|result|breakdown|standing|rank/i,
    icon: Trophy,
    iconColor: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    bar: "bg-amber-400",
  },
  {
    key: "transfer",
    match: /transfer|substitut|swap|bid|auction|squad|line\s*up|captain|lineup/i,
    icon: ArrowLeftRight,
    iconColor: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-400",
  },
  {
    key: "news",
    match: /player|injury|news|update|announcement|info/i,
    icon: Newspaper,
    iconColor: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    bar: "bg-sky-400",
  },
  {
    key: "general",
    match: /.*/,
    icon: Bell,
    iconColor: "text-secondary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    bar: "bg-secondary",
  },
];

const detectKind = (title: string, message: string): KindConfig => {
  const haystack = `${title} ${message}`;
  return KINDS.find((k) => k.match.test(haystack)) || KINDS[KINDS.length - 1];
};

const NotificationItem = ({
  title,
  message,
  time,
  unread,
  onOpen,
  onDismiss,
}: {
  title: string;
  message: string;
  time: number;
  unread?: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}) => {
  const kind = detectKind(title, message);
  const Icon = kind.icon;
  const relative = dayjs(time).fromNow();
  const full = dayjs(time).format("ddd, D MMM YYYY • h:mm A");

  return (
    <div
      onClick={onOpen}
      className={`relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
        unread
          ? "bg-card border-primary/30 shadow-[0_0_14px_rgba(139,92,246,0.08)]"
          : "bg-surface border-border hover:bg-white/5"
      }`}
    >
      {unread && <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${kind.bar}`} />}

      <div
        className={`w-10 h-10 rounded-xl border ${kind.bg} ${kind.border} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-5 h-5 ${kind.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-sm font-bold leading-snug ${unread ? "text-white" : "text-text-secondary"}`}>
            {title}
          </h3>
          {unread && <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5" />}
        </div>
        <p className="text-xs text-text-muted leading-relaxed mt-1">{message}</p>
        {time && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-text-muted/70">{relative}</span>
            <span className="text-[9px] text-text-muted/40">•</span>
            <span className="text-[10px] text-text-muted/40">{full}</span>
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Dismiss notification"
          className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted/60 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all flex-shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
