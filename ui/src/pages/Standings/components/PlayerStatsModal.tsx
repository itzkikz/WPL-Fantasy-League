import { X, Target, Clock, Star, Trophy, TrendingUp, Calendar, ArrowRightLeft, ExternalLink, Activity, ShieldCheck } from "lucide-react";
import { usePlayerDetails } from "../../../features/players/hooks";
import { Player } from "../../../features/players/types";
import { getContrastText } from "../../../libs/helpers/color";
import { getPlayerDisplayPrice } from "../../../libs/helpers/player";

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onMakeCaptain?: (player: Player) => void;
  onMakeViceCaptain?: (player: Player) => void;
  onSubstitute?: (player: Player) => void;
  pickMyTeam?: boolean;
}

const PlayerStatsModal = ({
  isOpen,
  onClose,
  player,
  onMakeCaptain,
  onMakeViceCaptain,
  onSubstitute,
  pickMyTeam = false,
}: PlayerStatsModalProps) => {
  const { data: stats, isLoading, isError } = usePlayerDetails(player?.name || "");

  if (!isOpen || !player) return null;

  const getJerseyColor = () => {
    return stats?.team_color || player?.teamColor || "#ccc";
  };

  const getJerseyTextColor = () => {
    return stats?.team_text_color || player?.teamTextColor || "#ffffff";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-elevated border border-border rounded-3xl shadow-modal overflow-hidden z-10 flex flex-col max-h-[90vh] text-white animate-in scale-in duration-300">
 
        {/* Loading State */}
        {isLoading && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-secondary">Loading player statistics...</p>
          </div>
        )}
 
        {/* Error State */}
        {isError && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <Trophy className="w-10 h-10 text-rose-500 mb-3" />
            <p className="text-sm font-bold text-rose-300 mb-4">Failed to load statistics.</p>
            <button
              onClick={onClose}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        )}
 
        {/* Loaded Content */}
        {!isLoading && stats && (
          <>
            {/* 1. Modal Top Section: Jersey & Title details */}
            <div className="relative p-6 bg-card border-b border-border flex items-center justify-between shrink-0 overflow-hidden">
              {stats.team_logo && (
                <img
                  src={stats.team_logo}
                  alt=""
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 object-contain opacity-[0.08] pointer-events-none select-none"
                />
              )}
              <div className="flex items-center gap-4 flex-1 min-w-0 relative z-10">
                {/* Player Photo */}
                <div
                  className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-lg shrink-0 bg-background flex items-center justify-center"
                  style={{ borderColor: getJerseyColor() }}
                >
                  {stats.photo || player.photo ? (
                    <img
                      src={stats.photo || player.photo}
                      alt={stats.player_name || player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const sibling = (e.target as HTMLImageElement).nextElementSibling;
                        if (sibling) (sibling as HTMLElement).style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 bg-surface flex items-center justify-center"
                    style={{ display: stats.photo || player.photo ? "none" : "flex" }}
                  >
                    <span className="text-sm font-black text-text-muted uppercase tracking-wider font-mono">
                      {(stats.player_name || player.name).split(/\s+/).map((n: string) => n[0]).join("").substring(0, 2)}
                    </span>
                  </div>
                </div>
 
                {/* Player details */}
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-surface border border-border rounded-md px-2 py-0.5 text-[9px] uppercase font-black tracking-widest text-text-muted mb-1.5">
                    {stats.position || player.position}
                  </span>
                  <h2 className="text-lg md:text-xl font-black tracking-tight text-white leading-tight truncate">
                    {stats.player_name || player.name}
                  </h2>
                  <p className="text-[11px] text-text-muted font-bold mt-0.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: getJerseyColor() }} />
                    {stats.team_name || stats.club}
                  </p>
                  <p className="text-[10px] font-bold mt-0.5">
                    <span className={stats.fantasy_team_name ? "text-violet-400" : "text-gray-500"}>
                      {stats.fantasy_team_name ? stats.fantasy_team_name : "Free Agent"}
                    </span>
                  </p>
                </div>
              </div>
 
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
 
            {/* Scrollable Stats Wrapper */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
 
              {/* 2. Headline Stats Grid */}
              <div className="grid grid-cols-4 gap-2 bg-card border border-border rounded-2xl p-3 text-center">
                <div>
                  <p className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider">Price</p>
                  <p className="text-xs md:text-sm font-extrabold text-white mt-1">
                    {stats ? getPlayerDisplayPrice(stats) : "10.0M"}
                  </p>
                  <p className="text-[8px] text-[var(--color-success-bright)] font-bold mt-0.5">↑ 0.1M</p>
                </div>
                <div className="border-l border-border/40">
                  <p className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider">Points (GW)</p>
                  <p className="text-xs md:text-sm font-black text-[var(--color-success-bright)] mt-1">
                    {stats.current_week?.point || 0}
                  </p>
                </div>
                <div className="border-l border-border/40">
                  <p className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider">Total Points</p>
                  <p className="text-xs md:text-sm font-extrabold text-white mt-1">
                    {stats.overall?.total_point || 0}
                  </p>
                </div>
                <div className="border-l border-border/40 flex flex-col items-center">
                  <p className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider mb-1">Form</p>
                  <div className="flex gap-0.5 justify-center items-center h-full">
                    {stats.recent_form?.map((f: any, idx: number) => {
                      const isCurrentGW = idx === stats.recent_form!.length - 1;
                      return (
                        <span
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-mono font-bold
                            ${isCurrentGW ? "bg-green-500 text-black ring-1 ring-green-300" : "bg-violet-950 text-violet-300"}`}
                        >
                          {f.points}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
 
              {/* 3. Gameweek Performance Header & Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-secondary" />
                    Gameweek Performance
                  </h3>
                  <span className="text-xs font-black text-[var(--color-success-bright)] bg-[var(--color-success-bg)] border border-[var(--color-success-bright)]/20 px-2 py-0.5 rounded-md font-mono">
                    {stats.current_week?.point || 0} PTS
                  </span>
                </div>

                {(() => {
                  const pos = stats.position || player.position;
                  const cw = stats.current_week;
                  const isGK = pos === "GK";
                  const isDEF = pos === "DEF";
                  const defCont = (cw?.totalTackle || 0) + (cw?.totalClearance || 0) + (cw?.outfielderBlock || 0) + (cw?.ballRecovery || 0);

                  const items: { icon: any; iconColor: string; label: string; value: number }[] = [];
                  items.push({ icon: Clock, iconColor: "text-slate-400", label: "Mins", value: cw?.minutesPlayed || 0 });
                  if (!isGK) items.push({ icon: Trophy, iconColor: "text-amber-400", label: "Goals", value: cw?.goals || 0 });
                  items.push({ icon: Trophy, iconColor: "text-indigo-400", label: "Assists", value: cw?.goalAssist || 0 });
                  if (isGK || isDEF) items.push({ icon: Target, iconColor: "text-emerald-400", label: "CS", value: Number(cw?.cleanSheet) || 0 });
                  items.push({ icon: Target, iconColor: "text-amber-400", label: "YC", value: cw?.yellowCards || 0 });
                  items.push({ icon: Target, iconColor: "text-rose-400", label: "RC", value: cw?.redCards || 0 });
                  if (isGK) {
                    items.push({ icon: Target, iconColor: "text-rose-400", label: "Pen Miss", value: cw?.penaltyMissed || 0 });
                    items.push({ icon: Target, iconColor: "text-emerald-400", label: "Pen Save", value: cw?.penaltySaved || 0 });
                    items.push({ icon: Target, iconColor: "text-violet-400", label: "Saves", value: cw?.saves || 0 });
                  } else {
                    items.push({ icon: Target, iconColor: "text-rose-400", label: "Pen Miss", value: cw?.penaltyMissed || 0 });
                  }
                  items.push({ icon: Target, iconColor: "text-cyan-400", label: "Tackles", value: cw?.totalTackle || 0 });
                  items.push({ icon: Target, iconColor: "text-teal-400", label: "Clear", value: cw?.totalClearance || 0 });
                  items.push({ icon: Target, iconColor: "text-blue-400", label: "Blocks", value: cw?.outfielderBlock || 0 });
                  items.push({ icon: Target, iconColor: "text-green-400", label: "Recovery", value: cw?.ballRecovery || 0 });

                  return (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 bg-surface border border-border rounded-2xl p-3 text-center">
                      {items.map((item, i) => {
                        const Ic = item.icon;
                        return (
                          <div key={i}>
                            <Ic className={`w-3.5 h-3.5 mx-auto mb-1 ${item.iconColor}`} />
                            <p className="text-[7px] text-text-muted font-bold uppercase truncate">{item.label}</p>
                            <p className="text-xs font-black text-white mt-0.5">{item.value}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
 
              {/* 4. Points Breakdown & Upcoming Fixtures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Points Breakdown List */}
                <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col h-full">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted border-b border-border pb-2 mb-3">
                    Points Breakdown
                  </h4>
                  <div className="space-y-2">
                    {(() => {
                      const pos = stats.position || player.position;
                      const cw = stats.current_week;
                      const isGK = pos === "GK";
                      const isDEF = pos === "DEF";
                      const mins = cw?.minutesPlayed || 0;
                      if (mins === 0) return <p className="text-xs text-text-muted italic text-center py-4">Did not play this gameweek.</p>;

                      const rows: { label: string; pts: number }[] = [];

                      if (mins > 0) rows.push({ label: "Appearance", pts: mins >= 60 ? 2 : 1 });

                      const goals = cw?.goals || 0;
                      if (!isGK && goals > 0) {
                        let gp = 0;
                        if (isDEF) gp = goals * 6;
                        else if (pos === "MID") gp = goals * 5;
                        else gp = goals * 4;
                        rows.push({ label: `Goals (${goals})`, pts: gp });
                      }

                      const assists = cw?.goalAssist || 0;
                      if (assists > 0) rows.push({ label: `Assists (${assists})`, pts: assists * 3 });

                      const cs = Number(cw?.cleanSheet) || 0;
                      if ((isGK || isDEF) && cs > 0) rows.push({ label: `Clean Sheets (${cs})`, pts: cs * 4 });
                      else if (pos === "MID" && cs > 0) rows.push({ label: `Clean Sheets (${cs})`, pts: cs * 1 });

                      const yc = cw?.yellowCards || 0;
                      if (yc > 0) rows.push({ label: `Yellow Cards (${yc})`, pts: yc * -1 });

                      const rc = cw?.redCards || 0;
                      if (rc > 0) rows.push({ label: `Red Cards (${rc})`, pts: rc * -3 });

                      if (isGK) {
                        const penMiss = cw?.penaltyMissed || 0;
                        if (penMiss > 0) rows.push({ label: `Penalty Missed (${penMiss})`, pts: penMiss * -2 });

                        const penSave = cw?.penaltySaved || 0;
                        if (penSave > 0) rows.push({ label: `Penalty Saved (${penSave})`, pts: penSave * 5 });

                        const saves = cw?.saves || 0;
                        if (saves >= 3) rows.push({ label: `Saves (${saves})`, pts: Math.floor(saves / 3) });
                      }

                      const tackles = cw?.totalTackle || 0;
                      const clearances = cw?.totalClearance || 0;
                      const blocks = cw?.outfielderBlock || 0;
                      const recovery = cw?.ballRecovery || 0;
                      const defCont = tackles + clearances + blocks + recovery;
                      if (defCont > 0) {
                        const dp = isDEF ? Math.floor(defCont / 10) * 2 : Math.floor(defCont / 12) * 2;
                        if (dp > 0) {
                          rows.push({ label: `Tackles (${tackles})`, pts: 0 });
                          rows.push({ label: `Clearances (${clearances})`, pts: 0 });
                          rows.push({ label: `Blocks (${blocks})`, pts: 0 });
                          rows.push({ label: `Recovery (${recovery})`, pts: 0 });
                          rows.push({ label: `Defensive Bonus (÷${isDEF ? 10 : 12})`, pts: dp });
                        }
                      }

                      const total = rows.reduce((s, r) => s + r.pts, 0);

                      return (
                        <>
                          {rows.map((r, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="text-text-muted">{r.label}</span>
                              {r.pts === 0 ? (
                                <span className="text-text-muted font-mono text-[10px]">—</span>
                              ) : (
                                <span className={`font-mono font-bold ${r.pts >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                  {r.pts >= 0 ? `+${r.pts}` : r.pts}
                                </span>
                              )}
                            </div>
                          ))}
                          <div className="border-t border-border/50 pt-2.5 mt-3 flex justify-between items-center text-xs font-black">
                            <span className="text-white">Total</span>
                            <span className="text-[var(--color-success-bright)] font-mono">{total} pts</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
 
                {/* Upcoming Fixtures List */}
                <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col h-full">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted border-b border-border pb-2 mb-3 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-secondary" />
                    Upcoming Fixtures
                  </h4>
                  <div className="space-y-3 flex-1">
                    {stats.upcoming_fixtures?.map((fix: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-card border border-border/40 rounded-xl p-2">
                        <span className="font-extrabold text-secondary font-mono text-[10px]">GW{fix.gw}</span>
 
                        <div className="flex items-center gap-1.5 flex-1 justify-center px-1">
                          <span className="text-white font-extrabold">{fix.my_team_short_name}</span>
                          <span className="text-text-muted text-[10px]">vs</span>
                          <span className="text-gray-300 font-extrabold truncate" style={{ color: fix.opponent_color }}>
                            {fix.opponent_short_name}
                          </span>
                        </div>
 
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">
                          {fix.is_home ? "Home" : "Away"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
 
              {/* 5. Overall Season Statistics */}
              {(() => {
                const pos = stats.position || player.position;
                const o = stats.overall;
                const isGK = pos === "GK";
                const isDEF = pos === "DEF";

                const items: { label: string; value: number }[] = [];
                items.push({ label: "Mins", value: o?.minutesPlayed || 0 });
                if (!isGK) items.push({ label: "Goals", value: o?.goals || 0 });
                items.push({ label: "Assists", value: o?.goalAssist || 0 });
                if (isGK || isDEF) items.push({ label: "CS", value: Number(o?.cleanSheet) || 0 });
                items.push({ label: "YC", value: o?.yellowCards || 0 });
                items.push({ label: "RC", value: o?.redCards || 0 });
                if (isGK) {
                  items.push({ label: "Pen Miss", value: o?.penaltyMissed || 0 });
                  items.push({ label: "Pen Save", value: o?.penaltySaved || 0 });
                  items.push({ label: "Saves", value: o?.saves || 0 });
                } else {
                  items.push({ label: "Pen Miss", value: o?.penaltyMissed || 0 });
                }
                items.push({ label: "Tackles", value: o?.totalTackle || 0 });
                items.push({ label: "Clear", value: o?.totalClearance || 0 });
                items.push({ label: "Blocks", value: o?.outfielderBlock || 0 });
                items.push({ label: "Recovery", value: o?.ballRecovery || 0 });

                return (
                  <div className="bg-surface border border-border rounded-2xl p-4 space-y-3.5">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted border-b border-border pb-2 mb-1.5">
                      This Season Stats
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 text-center">
                      {items.map((item, i) => (
                        <div key={i} className="bg-card rounded-xl p-2">
                          <p className="text-[7px] text-text-muted font-bold uppercase truncate">{item.label}</p>
                          <p className="text-sm font-black text-white mt-0.5">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 5b. Season Points Impact */}
              <div className="bg-surface border border-border rounded-2xl p-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted border-b border-border pb-2 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                  Points Impact (Season)
                </h4>
                {(() => {
                  const o = stats.overall;
                  const pos = stats.position || player.position;
                  const mins = o?.minutesPlayed || 0;
                  if (mins === 0) return <p className="text-xs text-text-muted italic text-center py-3">Did not play this season.</p>;

                  const isGK = pos === "GK";
                  const isDEF = pos === "DEF";
                  const isMID = pos === "MID";
                  const apps = o?.appearances || 0;
                  const apps60 = o?.appearances60 || 0;
                  const appsUnder60 = apps - apps60;

                  const rows: { label: string; pts: number }[] = [];

                  // 1. Appearance
                  if (apps > 0) rows.push({ label: `Appearance (${apps} apps, ${apps60} × 60min+)`, pts: (apps60 * 2) + (appsUnder60 * 1) });

                  // 2. Minutes Played
                  if (mins > 0) rows.push({ label: `Minutes Played (${mins})`, pts: 0 });

                  // 3. Goals
                  const goals = o?.goals || 0;
                  if (goals > 0) {
                    let gp = 0;
                    if (isGK) gp = goals * 10;
                    else if (isDEF) gp = goals * 6;
                    else if (isMID) gp = goals * 5;
                    else gp = goals * 4;
                    rows.push({ label: `Goals (${goals})`, pts: gp });
                  }

                  // 4. Assists
                  const assists = o?.goalAssist || 0;
                  if (assists > 0) rows.push({ label: `Assists (${assists})`, pts: assists * 3 });

                  // 5. Clean Sheet
                  const cs = Number(o?.cleanSheet) || 0;
                  if (cs > 0 && (isGK || isDEF)) rows.push({ label: `Clean Sheets (${cs})`, pts: cs * 4 });
                  else if (cs > 0 && isMID) rows.push({ label: `Clean Sheets (${cs})`, pts: cs * 1 });

                  // 6. Yellow Cards
                  const yellows = o?.yellowCards || 0;
                  if (yellows > 0) rows.push({ label: `Yellow Cards (${yellows})`, pts: yellows * -1 });

                  // 7. Red Cards
                  const reds = o?.redCards || 0;
                  if (reds > 0) rows.push({ label: `Red Cards (${reds})`, pts: reds * -3 });

                  // 8. Penalty Miss
                  const penMiss = o?.penaltyMissed || 0;
                  if (penMiss > 0) rows.push({ label: `Penalty Missed (${penMiss})`, pts: penMiss * -2 });

                  // 9. Penalty Save (GK only)
                  if (isGK) {
                    const penSave = o?.penaltySaved || 0;
                    if (penSave > 0) rows.push({ label: `Penalty Saved (${penSave})`, pts: penSave * 5 });
                  }

                  // 10. Saves (GK only)
                  if (isGK) {
                    const saves = o?.saves || 0;
                    if (saves >= 3) rows.push({ label: `Saves (${saves})`, pts: Math.floor(saves / 3) });
                  }

                  // 11-14. Defensive stats shown individually
                  const tackles = o?.totalTackle || 0;
                  const clearances = o?.totalClearance || 0;
                  const blocks = o?.outfielderBlock || 0;
                  const recovery = o?.ballRecovery || 0;
                  const defCont = tackles + clearances + blocks + recovery;
                  if (defCont > 0) {
                    const dp = isDEF ? Math.floor(defCont / 10) * 2 : Math.floor(defCont / 12) * 2;
                    if (dp > 0) {
                      rows.push({ label: `Tackles (${ tackles})`, pts: 0 });
                      rows.push({ label: `Clearances (${clearances})`, pts: 0 });
                      rows.push({ label: `Blocks (${blocks})`, pts: 0 });
                      rows.push({ label: `Recovery (${recovery})`, pts: 0 });
                      rows.push({ label: `Defensive Bonus (÷${isDEF ? 10 : 12})`, pts: dp });
                    }
                  }

                  const total = rows.reduce((s, r) => s + r.pts, 0);

                  return (
                    <>
                      <div className="space-y-2">
                        {rows.map((r, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-text-muted">{r.label}</span>
                            {r.pts === 0 ? (
                              <span className="text-text-muted font-mono text-[10px]">—</span>
                            ) : (
                              <span className={`font-mono font-bold ${r.pts >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {r.pts >= 0 ? `+${r.pts}` : r.pts}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border/50 pt-2.5 mt-3 flex justify-between items-center text-xs font-black">
                        <span className="text-white">Total</span>
                        <span className="text-[var(--color-success-bright)] font-mono">{total} pts</span>
                      </div>
                    </>
                  );
                })()}
              </div>
 
              {/* 6. Recent Form (Bar Chart) */}
              <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted border-b border-border pb-2">
                  Recent Form (Last 5 Gameweeks)
                </h4>
 
                <div className="flex items-end justify-around h-32 pt-6 relative px-2">
                  {stats.recent_form?.map((f: any, idx: number) => {
                    // Normalize bar height based on points. Max height is 80px (for 15 points or more)
                    const barHeight = Math.min(80, Math.max(8, f.points * 6.5));
                    const isMax = idx === stats.recent_form!.length - 1; // Highlight last gameweek
 
                    return (
                       <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                        {/* Point value tooltip */}
                        <span className={`text-[10px] font-extrabold font-mono transition-all duration-300 opacity-80 group-hover:scale-110
                          ${isMax ? "text-[var(--color-success-bright)]" : "text-violet-300"}`}>
                          {f.points}
                        </span>
 
                        {/* Bar */}
                        <div
                          style={{ height: `${barHeight}px` }}
                          className={`w-8 rounded-t-lg transition-all duration-500 scale-y-100 origin-bottom shadow-lg
                            ${isMax
                              ? "bg-gradient-to-t from-emerald-600 to-green-400 shadow-green-500/20"
                              : "bg-gradient-to-t from-violet-700 to-violet-500 shadow-violet-500/10 hover:from-violet-600"}`}
                        />
 
                        {/* Gameweek tag */}
                        <span className="text-[8px] font-bold text-gray-500 uppercase font-mono">
                          GW{f.gw}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
 
            {/* 7. Action Footer Buttons */}
            {pickMyTeam && (onMakeCaptain || onMakeViceCaptain || onSubstitute) ? (
              <div className="p-5 bg-card border-t border-border flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full">
                {onMakeCaptain && (
                  <button
                    onClick={() => onMakeCaptain(player)}
                    className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-amber-500/10"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Make Cap
                  </button>
                )}
                {onMakeViceCaptain && (
                  <button
                    onClick={() => onMakeViceCaptain(player)}
                    className="w-full sm:flex-1 bg-slate-400 hover:bg-slate-300 text-black font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-slate-400/10"
                  >
                    <Star className="w-4 h-4" />
                    Make Vc
                  </button>
                )}
                {onSubstitute && (
                  <button
                    onClick={() => onSubstitute(player)}
                    className="w-full sm:flex-1 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-green-500/10"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Substitute
                  </button>
                )}
              </div>
            ) : (
              <div className="p-5 bg-card border-t border-border flex items-center gap-3 shrink-0">
                {/* <button className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border-t border-white/20 text-xs md:text-sm shadow-lg shadow-violet-600/20">
                  <ArrowRightLeft className="w-4 h-4" />
                  Compare Player
                </button>
                
                <button className="flex-1 border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 font-bold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs md:text-sm">
                  <ExternalLink className="w-4 h-4" />
                  View Player Profile
                </button> */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerStatsModal;
