import { useEffect, useState } from "react";
import { X, Target, Clock, Star, Calendar, ArrowRightLeft, Activity, ShieldCheck, Goal, Footprints, Shield, TriangleAlert, Octagon, Ban, Sparkles, Hand, Zap, Send, Blocks, Magnet } from "lucide-react";
import { Player, PlayerStats } from "../../../features/players/types";
import { getContrastText, luminance } from "../../../libs/helpers/color";
import { getPlayerDisplayPrice } from "../../../libs/helpers/player";
import Modal from "../../../components/common/Modal";
import { useTheme } from "../../../contexts/ThemeContext";

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  playerStats?: PlayerStats | null;
  onMakeCaptain?: (player: Player) => void;
  onMakeViceCaptain?: (player: Player) => void;
  onSubstitute?: (player: Player) => void;
  pickMyTeam?: boolean;
}

const PlayerStatsModal = ({
  isOpen,
  onClose,
  player: propPlayer,
  playerStats: propStats,
  onMakeCaptain,
  onMakeViceCaptain,
  onSubstitute,
  pickMyTeam = false,
}: PlayerStatsModalProps) => {
  const { theme } = useTheme();
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [localStats, setLocalStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    if (propPlayer) {
      setLocalPlayer(propPlayer);
    }
  }, [propPlayer]);

  useEffect(() => {
    if (propStats) {
      setLocalStats(propStats);
    }
  }, [propStats]);

  const player = propPlayer || localPlayer;
  const stats = propStats || localStats;

  if (!player) return null;

  const getJerseyColor = () => {
    return stats?.team_color || player?.teamColor || "#ccc";
  };

  const getJerseyTextColor = () => {
    return stats?.team_text_color || player?.teamTextColor || "#ffffff";
  };

  const getReadableTeamColor = (color?: string) => {
    if (!color) return theme === "light" ? "#0F172A" : "#FFFFFF";
    const c = color.trim().toLowerCase();
    let isLight = c === "#ffffff" || c === "#fff" || c === "white";
    let isDark = c === "#000000" || c === "#000" || c === "black";
    if (c.startsWith("#") && (c.length === 4 || c.length === 7)) {
      try {
        const lum = luminance(c);
        if (lum > 0.75) isLight = true;
        if (lum < 0.15) isDark = true;
      } catch {}
    }
    if (theme === "light" && isLight) return "#0F172A";
    if (theme === "dark" && isDark) return "#FFFFFF";
    return color;
  };

  const formatMatchDate = (kickoff?: number | null) => {
    if (!kickoff) return "";
    try {
      return new Date(kickoff * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="center" maxWidthClass="max-w-lg">
 
        {/* Loaded Content */}
        {stats && (
          <>
            {/* 1. Modal Top Section: Jersey & Title details */}
            <div className="relative p-4 sm:p-6 bg-card border-b border-border flex items-center justify-between shrink-0 overflow-hidden">
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
                  <h2 className="text-lg md:text-xl font-black tracking-tight text-text-primary leading-tight truncate">
                    {stats.player_name || player.name}
                  </h2>
                  <p className="text-[11px] text-text-muted font-bold mt-0.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: getJerseyColor() }} />
                    {stats.team_name || stats.club}
                  </p>
                  <p className="text-[10px] font-bold mt-0.5">
                    <span className={stats.fantasy_team_name ? "text-violet-400" : "text-text-muted"}>
                      {stats.fantasy_team_name ? stats.fantasy_team_name : "Free Agent"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface hover:bg-elevated flex items-center justify-center cursor-pointer text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Stats Wrapper */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1 min-h-0">

              {/* 2. Headline Stats Grid */}
              <div className="grid grid-cols-4 gap-2 bg-card border border-border rounded-2xl p-3 text-center">
                <div>
                  <p className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider">Price</p>
                  <p className="text-xs md:text-sm font-extrabold text-text-primary mt-1">
                    {stats ? getPlayerDisplayPrice(stats) : "10.0M"}
                  </p>
                  {(() => {
                    const auctionPrice = stats?.auctionPrice;
                    if (auctionPrice == null || auctionPrice === 0) {
                      return <p className="text-[8px] text-text-muted font-bold mt-0.5">—</p>;
                    }
                    const basePrice = (stats?.price || 0) / 10;
                    const diff = Number(auctionPrice) - basePrice;
                    const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "=";
                    const color =
                      diff > 0
                        ? "text-[var(--color-success-bright)]"
                        : diff < 0
                          ? "text-[var(--color-danger-bright)]"
                          : "text-text-muted";
                    return <p className={`text-[8px] font-bold mt-0.5 ${color}`}>{`${arrow} ${Math.abs(diff).toFixed(1)}M`}</p>;
                  })()}
                </div>
                <div className="border-l border-border/40">
                  <p className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider">Points (GW)</p>
                  <p className="text-xs md:text-sm font-black text-[var(--color-success-bright)] mt-1">
                    {stats.current_week?.point || 0}
                  </p>
                </div>
                <div className="border-l border-border/40">
                  <p className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider">Total Points</p>
                  <p className="text-xs md:text-sm font-extrabold text-text-primary mt-1">
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
                            ${isCurrentGW ? "bg-emerald-500 text-white shadow-sm" : "bg-primary/20 text-primary"}`}
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

                  const items: { icon: any; iconColor: string; label: string; value: any }[] = [];
                  items.push({ icon: Clock, iconColor: "text-slate-400", label: "Mins", value: cw?.minutesPlayed === 0 ? "DNP" : cw?.minutesPlayed || 0 });
                  if (!isGK) items.push({ icon: Goal, iconColor: "text-amber-400", label: "Goals", value: cw?.goals || 0 });
                  items.push({ icon: Footprints, iconColor: "text-indigo-400", label: "Assists", value: cw?.goalAssist || 0 });
                  if (isGK || isDEF) items.push({ icon: Shield, iconColor: "text-emerald-400", label: "CS", value: Number(cw?.cleanSheet) || 0 });
                  items.push({ icon: TriangleAlert, iconColor: "text-amber-400", label: "YC", value: cw?.yellowCards || 0 });
                  items.push({ icon: Octagon, iconColor: "text-rose-400", label: "RC", value: cw?.redCards || 0 });
                  if (isGK) {
                    items.push({ icon: Ban, iconColor: "text-rose-400", label: "Pen Miss", value: cw?.penaltyMissed || 0 });
                    items.push({ icon: Sparkles, iconColor: "text-emerald-400", label: "Pen Save", value: cw?.penaltySaved || 0 });
                    items.push({ icon: Hand, iconColor: "text-violet-400", label: "Saves", value: cw?.saves || 0 });
                  } else {
                    items.push({ icon: Ban, iconColor: "text-rose-400", label: "Pen Miss", value: cw?.penaltyMissed || 0 });
                  }
                  items.push({ icon: Zap, iconColor: "text-cyan-400", label: "Tackles", value: cw?.totalTackle || 0 });
                  items.push({ icon: Send, iconColor: "text-teal-400", label: "Clear", value: cw?.totalClearance || 0 });
                  items.push({ icon: Blocks, iconColor: "text-blue-400", label: "Blocks", value: cw?.outfielderBlock || 0 });
                  items.push({ icon: Magnet, iconColor: "text-green-400", label: "Recovery", value: cw?.ballRecovery || 0 });

                  const visibleItems = items.filter((item) => item.value > 0);

                  if (visibleItems.length === 0) {
                    return (
                      <div className="bg-surface border border-border rounded-2xl p-3 text-center">
                        <p className="text-xs text-text-muted italic py-2">No stats recorded for this gameweek.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 bg-surface border border-border rounded-2xl p-3 text-center">
                      {visibleItems.map((item, i) => {
                        const Ic = item.icon;
                        return (
                          <div key={i}>
                            <Ic className={`w-3.5 h-3.5 mx-auto mb-1 ${item.iconColor}`} />
                            <p className="text-[7px] text-text-muted font-bold uppercase truncate">{item.label}</p>
                            <p className="text-xs font-black text-text-primary mt-0.5">{item.value}</p>
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
                      const cw = stats.current_week;
                      const bd = stats.points_breakdown || [];

                      if (bd.length === 0 && !(cw?.minutesPlayed > 0)) {
                        return <p className="text-xs text-text-muted italic text-center py-4">Did not play this gameweek.</p>;
                      }

                      // Points come from the server per-match breakdown (per-match rules, summed)
                      const rows: { label: string; pts: number }[] = bd.map((it: any) => ({
                        label: it.label,
                        pts: it.points,
                      }));

                      // Raw defensive counts (merged stats) shown as informational rows
                      const tackles = cw?.totalTackle || 0;
                      const clearances = cw?.totalClearance || 0;
                      const blocks = cw?.outfielderBlock || 0;
                      const recovery = cw?.ballRecovery || 0;
                      if (tackles || clearances || blocks || recovery) {
                        rows.push({ label: `Tackles (${tackles})`, pts: 0 });
                        rows.push({ label: `Clearances (${clearances})`, pts: 0 });
                        rows.push({ label: `Blocks (${blocks})`, pts: 0 });
                        rows.push({ label: `Recovery (${recovery})`, pts: 0 });
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
                            <span className="text-text-primary">Total</span>
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
                          <span className="font-extrabold" style={{ color: getReadableTeamColor(getJerseyColor()) }}>
                            {fix.my_team_short_name}
                          </span>
                          <span className="text-text-muted text-[10px]">vs</span>
                          <span className="font-extrabold truncate" style={{ color: getReadableTeamColor(fix.opponent_color) }}>
                            {fix.opponent_short_name}
                          </span>
                        </div>
 
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-wide">
                          {fix.is_home ? "Home" : "Away"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match-by-Match Split (multi-match gameweeks) */}
              {(() => {
                const matches = stats.current_week?.matches;
                if (!matches || matches.length <= 1) return null;
                return (
                  <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted border-b border-border pb-2 mb-3 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-secondary" />
                      Matches This Gameweek
                    </h4>
                    <div className="space-y-3">
                      {matches.map((m: any, idx: number) => (
                        <div key={`${m.fixtureId}-${idx}`} className="bg-card border border-border/40 rounded-xl p-3">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-secondary">
                              Match {idx + 1}
                            </span>
                            <span className="font-mono font-black text-[var(--color-success-bright)]">{m.points ?? 0} pts</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-text-muted mb-2">
                            <span className="font-bold text-text-primary">
                              {m.opponent || m.opponent_short_name || "Unknown opponent"}
                            </span>
                            <span>
                              {m.isHome === null || m.isHome === undefined
                                ? ""
                                : `${m.isHome ? "Home" : "Away"}`}{" "}
                              {m.kickoff ? `• ${formatMatchDate(m.kickoff)}` : ""}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 text-center">
                            {[
                              { label: "Mins", v: (m.stats?.minutesPlayed === 0 ? "DNP" : m.stats?.minutesPlayed ?? 0) },
                              { label: "Goals", v: m.stats?.goals ?? 0 },
                              { label: "Assists", v: m.stats?.goalAssist ?? 0 },
                              { label: "CS", v: m.stats?.cleanSheet ?? 0 },
                              { label: "Saves", v: m.stats?.saves ?? 0 },
                            ].map((cell) => (
                              <div key={cell.label} className="bg-background/60 rounded-lg py-1.5">
                                <p className="text-[7px] text-text-muted font-bold uppercase">{cell.label}</p>
                                <p className="text-xs font-black text-text-primary">{cell.v}</p>
                              </div>
                            ))}
                          </div>
                          {(m.breakdown || []).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/40 space-y-1">
                              {(m.breakdown as any[]).map((b: any, bi: number) => (
                                <div key={bi} className="flex justify-between items-center text-[10px]">
                                  <span className="text-text-muted">{b.label}</span>
                                  <span className={`font-mono font-bold ${b.points >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {b.points >= 0 ? `+${b.points}` : b.points}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

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
                          <p className="text-sm font-black text-text-primary mt-0.5">{item.value}</p>
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

                  // Preferred: server-computed season breakdown (per-match flooring applied)
                  const seasonBreakdown = stats.season_points_breakdown;
                  if (seasonBreakdown && seasonBreakdown.length > 0) {
                    for (const item of seasonBreakdown) {
                      rows.push({ label: item.label, pts: item.points });
                    }
                  } else {
                    // Fallback for stale/legacy responses: re-derive from season aggregates
                    // 1. Appearance
                    if (apps > 0) rows.push({ label: `Appearance (${apps} apps, ${apps60} × 60min+)`, pts: (apps60 * 2) + (appsUnder60 * 1) });

                    // 2. Goals
                    const goals = o?.goals || 0;
                    if (goals > 0) {
                      let gp = 0;
                      if (isGK) gp = goals * 10;
                      else if (isDEF) gp = goals * 6;
                      else if (isMID) gp = goals * 5;
                      else gp = goals * 4;
                      rows.push({ label: `Goals (${goals})`, pts: gp });
                    }

                    // 3. Assists
                    const assists = o?.goalAssist || 0;
                    if (assists > 0) rows.push({ label: `Assists (${assists})`, pts: assists * 3 });

                    // 4. Clean Sheet
                    const cs = Number(o?.cleanSheet) || 0;
                    if (cs > 0 && (isGK || isDEF)) rows.push({ label: `Clean Sheets (${cs})`, pts: cs * 4 });
                    else if (cs > 0 && isMID) rows.push({ label: `Clean Sheets (${cs})`, pts: cs * 1 });

                    // 5. Yellow Cards
                    const yellows = o?.yellowCards || 0;
                    if (yellows > 0) rows.push({ label: `Yellow Cards (${yellows})`, pts: yellows * -1 });

                    // 6. Red Cards
                    const reds = o?.redCards || 0;
                    if (reds > 0) rows.push({ label: `Red Cards (${reds})`, pts: reds * -3 });

                    // 7. Penalty Miss
                    const penMiss = o?.penaltyMissed || 0;
                    if (penMiss > 0) rows.push({ label: `Penalty Missed (${penMiss})`, pts: penMiss * -2 });

                    // 8. Penalty Save (GK only)
                    if (isGK) {
                      const penSave = o?.penaltySaved || 0;
                      if (penSave > 0) rows.push({ label: `Penalty Saved (${penSave})`, pts: penSave * 5 });
                    }

                    // 9. Saves (GK only)
                    if (isGK) {
                      const saves = o?.saves || 0;
                      if (saves >= 3) rows.push({ label: `Saves (${saves})`, pts: Math.floor(saves / 3) });
                    }

                    // 10. Defensive stats shown individually
                    const tackles = o?.totalTackle || 0;
                    const clearances = o?.totalClearance || 0;
                    const blocks = o?.outfielderBlock || 0;
                    const recovery = o?.ballRecovery || 0;
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
                  }

                  // Informational rows (0 pts) from season aggregates
                  if (mins > 0 && !(seasonBreakdown && seasonBreakdown.length > 0)) {
                    rows.push({ label: `Minutes Played (${mins})`, pts: 0 });
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
                        <span className="text-text-primary">Total</span>
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
                          ${isMax ? "text-[var(--color-success-bright)]" : "text-text-secondary"}`}>
                          {f.points}
                        </span>
 
                        {/* Bar */}
                        <div
                          style={{ height: `${barHeight}px` }}
                          className={`w-8 rounded-t-lg transition-all duration-500 scale-y-100 origin-bottom shadow-lg
                            ${isMax
                              ? "bg-gradient-to-t from-emerald-600 to-green-400 shadow-green-500/20"
                              : "bg-gradient-to-t from-secondary to-primary shadow-primary/10"}`}
                        />
 
                        {/* Gameweek tag */}
                        <span className="text-[8px] font-bold text-text-muted uppercase font-mono">
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
                {onMakeCaptain && !player.isCaptain && (
                  <button
                    onClick={() => onMakeCaptain(player)}
                    className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-amber-500/10"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Make Cap
                  </button>
                )}
                {onMakeViceCaptain && !player.isViceCaptain && (
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
    </Modal>
  );
};

export default PlayerStatsModal;
