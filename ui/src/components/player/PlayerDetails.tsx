import React from "react";
import { PlayerStats } from "../../features/players/types";

function getPointsImpact(stats: any, position: string) {
  if (!stats) return [];
  const items: { label: string; value: number | string; points: number }[] = [];

  const mins = stats.minutesPlayed || 0;
  const apps = stats.appearances || 0;
  const apps60 = stats.appearances60 || 0;
  const appsUnder60 = apps - apps60;

  if (apps > 0) {
    items.push({ label: "Appearance", value: `${apps} apps`, points: (apps60 * 2) + (appsUnder60 * 1) });
  }
  if (mins > 0) {
    items.push({ label: "Minutes Played", value: `${mins} min`, points: 0 });
  }

  const goals = stats.goals || 0;
  if (goals > 0) {
    let pts = 0;
    if (position === "GK") pts = goals * 10;
    else if (position === "DEF") pts = goals * 6;
    else if (position === "MID") pts = goals * 5;
    else pts = goals * 4;
    items.push({ label: `Goals (${goals})`, value: goals, points: pts });
  }

  const assists = stats.goalAssist || 0;
  if (assists > 0) {
    items.push({ label: `Assists (${assists})`, value: assists, points: assists * 3 });
  }

  const cs = Number(stats.cleanSheet) || 0;
  if (cs > 0 && (position === "GK" || position === "DEF")) {
    items.push({ label: `Clean Sheets (${cs})`, value: cs, points: cs * 4 });
  } else if (cs > 0 && position === "MID") {
    items.push({ label: `Clean Sheets (${cs})`, value: cs, points: cs * 1 });
  }

  const yellow = stats.yellowCards || 0;
  if (yellow > 0) {
    items.push({ label: `Yellow Cards (${yellow})`, value: yellow, points: yellow * -1 });
  }

  const red = stats.redCards || 0;
  if (red > 0) {
    items.push({ label: `Red Cards (${red})`, value: red, points: red * -3 });
  }

  const penMiss = stats.penaltyMissed || 0;
  if (penMiss > 0) {
    items.push({ label: `Penalty Missed (${penMiss})`, value: penMiss, points: penMiss * -2 });
  }

  if (position === "GK") {
    const penSave = stats.penaltySaved || 0;
    if (penSave > 0) {
      items.push({ label: `Penalty Saved (${penSave})`, value: penSave, points: penSave * 5 });
    }
    const saves = stats.saves || 0;
    if (saves >= 3) {
      items.push({ label: `Saves (${saves})`, value: saves, points: Math.floor(saves / 3) });
    }
  }

  const tackles = stats.totalTackle || 0;
  const clearances = stats.totalClearance || 0;
  const blocks = stats.outfielderBlock || 0;
  const recovery = stats.ballRecovery || 0;
  const defTotal = tackles + clearances + blocks + recovery;
  if (defTotal > 0) {
    const pts = position === "DEF" ? Math.floor(defTotal / 10) * 2 : Math.floor(defTotal / 12) * 2;
    if (pts > 0) {
      items.push({ label: `Tackles (${tackles})`, value: tackles, points: 0 });
      items.push({ label: `Clearances (${clearances})`, value: clearances, points: 0 });
      items.push({ label: `Blocks (${blocks})`, value: blocks, points: 0 });
      items.push({ label: `Recovery (${recovery})`, value: recovery, points: 0 });
      items.push({ label: `Defensive Bonus`, value: `÷${position === "DEF" ? 10 : 12}`, points: pts });
    }
  }

  return items;
}

export default function PlayerDetails({ playerStats }: { playerStats: PlayerStats }) {
  const position = playerStats?.position || "";
  const overallImpact = getPointsImpact(playerStats?.overall, position);
  const gwImpact = getPointsImpact(playerStats?.current_week, position);
  const totalPoints = overallImpact.reduce((sum, i) => sum + i.points, 0);

  return (
    <div className="px-6 mb-6 border-b border-[#ebe5eb] dark:border-[#541e5d]">
      {/* Quick Stats */}
      <div className="rounded-xl p-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{playerStats?.overall?.appearances ?? 0}</p>
          <p className="text-xs mt-1">Apps</p>
        </div>
        {position === "GK" ? (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold">{playerStats?.overall?.saves ?? 0}</p>
              <p className="text-xs mt-1">Saves</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{playerStats?.overall?.penaltySaved ?? 0}</p>
              <p className="text-xs mt-1">Penalty Saves</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold">{playerStats?.overall?.goals ?? 0}</p>
              <p className="text-xs mt-1">Goals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{playerStats?.overall?.goalAssist ?? 0}</p>
              <p className="text-xs mt-1">Assists</p>
            </div>
          </>
        )}
        <div className="text-center">
          <p className="text-2xl font-bold">{Number(playerStats?.overall?.cleanSheet) || 0}</p>
          <p className="text-xs mt-1">Clean Sheets</p>
        </div>
      </div>

      {/* Points Impact */}
      {overallImpact.length > 0 && (
        <div className="mt-3 rounded-xl bg-white/5 dark:bg-white/5 p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Points Impact (Season)
            </h4>
            <span className="text-xs font-bold text-emerald-400">
              {totalPoints} pts total
            </span>
          </div>
          <div className="space-y-2">
            {overallImpact.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{item.label}</span>
                <span
                  className={
                    item.points >= 0
                      ? "text-emerald-400 font-mono font-bold"
                      : "text-rose-400 font-mono font-bold"
                  }
                >
                  {item.points >= 0 ? `+${item.points}` : item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GW Points Impact */}
      {gwImpact.length > 0 && (
        <div className="mt-3 rounded-xl bg-white/5 dark:bg-white/5 p-4 border border-white/10">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
            Points Impact (Current GW)
          </h4>
          <div className="space-y-2">
            {gwImpact.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{item.label}</span>
                <span
                  className={
                    item.points >= 0
                      ? "text-emerald-400 font-mono font-bold"
                      : "text-rose-400 font-mono font-bold"
                  }
                >
                  {item.points >= 0 ? `+${item.points}` : item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {overallImpact.length === 0 && (
        <p className="text-xs text-gray-500 italic text-center py-3">
          No points recorded this season.
        </p>
      )}
    </div>
  );
}
