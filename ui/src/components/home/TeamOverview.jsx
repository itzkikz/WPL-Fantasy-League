import React from "react";
import { ChevronRight, TrendingUp, Shield } from "lucide-react";

/**
 * TeamOverview - purple hero banner showing team identity + headline stats.
 *
 * Props:
 *  - teamName, crestEmoji
 *  - overallRank, rankChange
 *  - totalPoints
 *  - gameweekPoints
 *  - jerseyNumber, playerName (shown on the pitch graphic)
 */
export default function TeamOverview({
  teamName = "Kiran FC",
  crestEmoji = <Shield className="w-5 h-5" />,
  overallRank = "12,345",
  rankChange = "2,341",
  totalPoints = "1,234",
  gameweekPoints = 56,
  jerseyNumber = "11",
  playerName = "KIRAN",
  onClick,
}) {
  return (
    <div className="relative overflow-hidden rounded-[10px] bg-[radial-gradient(circle_at_68%_20%,rgba(139,92,246,.45),transparent_32%),linear-gradient(135deg,#6f28a9_0%,#291344_48%,#15102a_100%)] min-h-[105px]">
      {/* pitch graphic, right side */}
      <div className="absolute right-0 top-0 h-full w-[48%]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/55 to-emerald-950/40 [clip-path:polygon(34%_0,100%_0,100%_100%,0_100%)]" />
      </div>

      <div className="relative z-10 p-3.5 pr-[41%]">
          <button onClick={onClick} className="flex min-h-7 items-center gap-1 text-[12px] text-text-primary/65 hover:text-text-primary active:text-text-primary transition-colors">
          <span>Team</span><span className="font-semibold text-white">Overview</span>
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600/90 flex items-center justify-center text-lg shadow-lg">
            {crestEmoji}
          </div>
          <h1 className="text-text-primary text-[21px] font-bold flex items-center gap-1 whitespace-nowrap">
            {teamName} <ChevronRight className="w-4 h-4 text-text-primary/70" />
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Overall Rank" value={overallRank}>
            <span className="flex items-center gap-1 text-success text-[10px] font-semibold mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> {rankChange}
            </span>
          </Stat>
          <Stat label="Total Points" value={totalPoints} />
          <Stat label="Gameweek Points" value={gameweekPoints} valueClass="text-success" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, children, valueClass = "text-text-primary" }) {
  return (
    <div>
      <p className="text-text-primary/60 text-[10px] leading-tight mb-0.5">{label}</p>
      <p className={`text-[18px] leading-tight font-bold ${valueClass}`}>{value}</p>
      {children}
    </div>
  );
}


