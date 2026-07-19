import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, LayoutGrid, Award, ShieldAlert, List } from "lucide-react";
import { useManagerDetails } from "../../features/manager/hooks";
import { useTeamDetails, useStandings } from "../../features/standings/hooks";
import PitchPlayerCard from "../../components/PitchPlayerCard";
import PlayerStatsModal from "../Standings/components/PlayerStatsModal";
import { Player } from "../../features/players/types";
import { getPlayerDisplayPrice } from "../../libs/helpers/player";
import "../Manager/MyTeamPage.css";

const getRowJustify = (count: number) => {
  if (count <= 1) return "justify-center";
  return "justify-evenly";
};

const GameweekBreakdownPage = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: "/gameweek-breakdown" });
  const gw = search.gw;

  const [activeTab, setActiveTab] = useState<"squad" | "points">("squad");
  const [squadView, setSquadView] = useState<"pitch" | "list">("pitch");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Queries
  const { data: standings, isLoading: isStandingsLoading } = useStandings();
  const { data: managerDetails, isLoading: isManagerLoading } = useManagerDetails();

  // Resolve manager's team_id by matching the team name from standings, or use search param teamId if specified
  const paramTeamId = search.teamId;
  const myStanding = standings?.find((s) => s.team === managerDetails?.team);
  const teamId = paramTeamId || myStanding?.team_id || "";

  const { data: teamDetails, isLoading: isDetailsLoading, isError } = useTeamDetails(teamId, gw);

  const { avg, highest, totalGWScore, starting, bench } = teamDetails || {};

  const compileTeamTotals = () => {
    const totals = {
      minutes: { count: 0, points: 0, suffix: " mins" },
      goals: { count: 0, points: 0, suffix: "" },
      assists: { count: 0, points: 0, suffix: "" },
      cleanSheets: { count: 0, points: 0, suffix: "" },
      yellowCards: { count: 0, points: 0, suffix: "" },
      redCards: { count: 0, points: 0, suffix: "" },
      penaltyMissed: { count: 0, points: 0, suffix: "" },
      penaltySaved: { count: 0, points: 0, suffix: "" },
      saves: { count: 0, points: 0, suffix: "" },
      tackles: { count: 0, points: 0, suffix: "" },
      clearances: { count: 0, points: 0, suffix: "" },
      blocks: { count: 0, points: 0, suffix: "" },
      recoveries: { count: 0, points: 0, suffix: "" },
      defensivePoints: { count: 0, points: 0, suffix: "" },
    };

    if (!starting) return totals;

    const starters = [
      ...(starting.GK || []),
      ...(starting.DEF || []),
      ...(starting.MID || []),
      ...(starting.FWD || []),
    ];

    const captainPlayer = starters.find((p) => p.isCaptain);
    const captainPlayed = !!(captainPlayer?.playerStats?.current_week?.minutesPlayed > 0);

    starters.forEach((p: any) => {
      const s = p.playerStats?.current_week;
      if (!s) return;

      let multiplier = 1;
      if (p.isCaptain && captainPlayed) {
        multiplier = 2;
      } else if (p.isViceCaptain && !captainPlayed) {
        multiplier = 2;
      }

      const position = p.position;

      // Minutes Played
      const minutes = s.minutesPlayed || 0;
      if (minutes > 0) {
        totals.minutes.count += minutes;
        totals.minutes.points += (minutes >= 60 ? 2 : 1) * multiplier;
      }

      // Goals
      const goals = s.goals || 0;
      if (goals > 0) {
        let goalPts = 0;
        if (position === "GK") goalPts = goals * 10;
        else if (position === "DEF") goalPts = goals * 6;
        else if (position === "MID") goalPts = goals * 5;
        else if (position === "FWD") goalPts = goals * 4;
        
        totals.goals.count += goals;
        totals.goals.points += goalPts * multiplier;
      }

      // Assists
      const assists = s.goalAssist || 0;
      if (assists > 0) {
        totals.assists.count += assists;
        totals.assists.points += (assists * 3) * multiplier;
      }

      // Clean Sheets
      const cleanSheet = s.cleanSheet || 0;
      if (cleanSheet > 0) {
        let csPts = 0;
        if (position === "GK" || position === "DEF") csPts = 4;
        else if (position === "MID") csPts = 1;

        if (csPts > 0) {
          totals.cleanSheets.count += cleanSheet;
          totals.cleanSheets.points += csPts * multiplier;
        }
      }

      // Yellow Cards
      const yellow = s.yellowCards || 0;
      if (yellow > 0) {
        totals.yellowCards.count += yellow;
        totals.yellowCards.points += (yellow * -1) * multiplier;
      }

      // Red Cards
      const red = s.redCards || 0;
      if (red > 0) {
        totals.redCards.count += red;
        totals.redCards.points += (red * -3) * multiplier;
      }

      // Penalty Missed
      const penMissed = s.penaltyMissed || 0;
      if (penMissed > 0) {
        totals.penaltyMissed.count += penMissed;
        totals.penaltyMissed.points += (penMissed * -2) * multiplier;
      }

      // Penalty Saved
      const penSaved = s.penaltySaved || 0;
      if (penSaved > 0) {
        totals.penaltySaved.count += penSaved;
        totals.penaltySaved.points += (penSaved * 5) * multiplier;
      }

      // Saves
      const saves = s.saves || 0;
      if (saves > 0) {
        totals.saves.count += saves;
        totals.saves.points += Math.floor(saves / 3) * multiplier;
      }

      // Defensive counts
      const tck = s.totalTackle || 0;
      const clr = s.totalClearance || 0;
      const blk = s.outfielderBlock || 0;
      const rec = s.ballRecovery || 0;

      totals.tackles.count += tck;
      totals.clearances.count += clr;
      totals.blocks.count += blk;
      totals.recoveries.count += rec;

      // Defensive points contribution
      const defCont = tck + clr + blk + rec;
      if (defCont > 0) {
        let defPts = 0;
        if (position === "DEF") {
          defPts = Math.floor(defCont / 10) * 2;
        } else {
          defPts = Math.floor(defCont / 12) * 2;
        }
        totals.defensivePoints.points += defPts * multiplier;
      }
    });

    return totals;
  };

  const getPlayerPrice = (p: Player) => {
    return getPlayerDisplayPrice(p);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowOverlay(true);
  };

  const isLoading = isManagerLoading || isStandingsLoading || (!!teamId && isDetailsLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70dvh] bg-background text-white select-none">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-secondary">Loading breakdown...</p>
      </div>
    );
  }

  if (isError || (!isLoading && !teamId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70dvh] bg-background text-rose-400 p-6 text-center select-none">
        <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
        <p className="text-sm font-extrabold mb-3">Failed to load gameweek details.</p>
        <button
          onClick={() => navigate({ to: "/my-team" })}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/30"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-white font-outfit select-none overflow-hidden">
      {/* Header Navigation Bar */}
      <header className="flex items-center gap-4 px-4 py-3 bg-surface border-b border-[var(--color-border-divider)] sticky top-0 z-30 shrink-0">
        <button
          onClick={() => {
            if (paramTeamId) {
              navigate({ to: "/manager-overview", search: { teamId: paramTeamId } });
            } else {
              navigate({ to: "/my-team", search: { tab: "history" } });
            }
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-background hover:bg-white/5 border border-border text-white active:scale-95 transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-black tracking-tight">
            Gameweek {gw} Breakdown
          </h1>
          <p className="text-[10px] md:text-xs text-text-muted font-medium mt-0.5">
            Viewing points and line-up for Gameweek {gw}
          </p>
        </div>
      </header>

      {/* Tabs Selector Bar */}
      <div className="mx-4 mt-3 flex items-center border-b border-[var(--color-border-divider)] shrink-0 pb-1.5">
        <div className="flex w-full">
          <button
            onClick={() => setActiveTab("squad")}
            className={`pb-1 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer flex-1 flex items-center justify-center gap-1.5 min-h-[36px]
              ${activeTab === "squad" ? "text-secondary font-black" : "text-text-muted/60 hover:text-white"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Squad
            {activeTab === "squad" && (
              <div className="absolute bottom-[-7px] left-0 right-0 h-0.5 bg-secondary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("points")}
            className={`pb-1 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer flex-1 flex items-center justify-center gap-1.5 min-h-[36px]
              ${activeTab === "points" ? "text-secondary font-black" : "text-text-muted/60 hover:text-white"}`}
          >
            <Award className="w-3.5 h-3.5" />
            Points
            {activeTab === "points" && (
              <div className="absolute bottom-[-7px] left-0 right-0 h-0.5 bg-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 flex flex-col min-h-0 ${(activeTab === "squad" && squadView === "pitch") ? "overflow-hidden" : "overflow-y-auto"} px-4 py-3`}>
        {activeTab === "squad" && (
          <div className="flex justify-end mb-2 max-w-2xl mx-auto w-full shrink-0">
            <div className="flex bg-card border border-border rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => setSquadView("pitch")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  squadView === "pitch"
                    ? "bg-secondary text-white shadow-sm"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Pitch
              </button>
              <button
                onClick={() => setSquadView("list")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  squadView === "list"
                    ? "bg-secondary text-white shadow-sm"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>
          </div>
        )}

        {activeTab === "squad" ? (
          squadView === "pitch" ? (
            /* Pitch View Container */
            <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-border shadow-card bg-background flex-1 min-h-[500px] flex flex-col animate-in fade-in duration-300">
              {/* Pitch image layer */}
              <div className="pitch-bg">
                <img
                  src="/pitch.png"
                  className="pitch-image-layer"
                  alt="Tactical pitch layout"
                />
              </div>

              {/* Players Overlay */}
              <div className="absolute top-0 inset-x-0 bottom-[110px] z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4">
                {starting && (["GK", "DEF", "MID", "FWD"] as const).map((pos) => {
                  const players = starting[pos] || [];
                  return (
                    <div key={pos} className={`flex w-full ${getRowJustify(players.length)} pointer-events-auto`}>
                      {players.map((player) => {
                        const enrichedPlayer = {
                          ...player,
                          price: getPlayerPrice(player),
                        };
                        return (
                          <div
                            key={player.id}
                            className="rounded-xl p-0.5 transition-all hover:scale-105 duration-300"
                          >
                            <PitchPlayerCard
                              player={enrichedPlayer}
                              showPriceAndPoints={true}
                              isSmall={false}
                              onClick={() => handlePlayerClick(player)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Bench Strip Container inside the Pitch Card */}
              <div className="absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border flex justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
                {(bench || []).map((player, idx) => {
                  const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
                  const enrichedPlayer = {
                    ...player,
                    price: getPlayerPrice(player),
                  };

                  return (
                    <div
                      key={player.id}
                      className="flex flex-col items-center relative rounded-xl p-0.5 transition-all hover:scale-105 duration-300 shrink-0 min-w-[64px]"
                    >
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">
                        {label}
                      </span>
                      <PitchPlayerCard
                        player={enrichedPlayer}
                        showPriceAndPoints={true}
                        isSmall={true}
                        onClick={() => handlePlayerClick(player)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* List View Table */
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card max-w-3xl mx-auto w-full flex flex-col animate-in fade-in duration-300">
              <div className="overflow-y-auto overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_rgba(45,27,84,0.4)]">
                    <tr className="bg-card border-b border-border text-text-muted uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4 text-center">Price</th>
                      <th className="py-3 px-4 text-center">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 font-medium text-white">
                    {starting && Object.entries(starting).flatMap(([pos, players]) =>
                      (players || []).map((player) => (
                        <tr key={player.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handlePlayerClick(player)}>
                          <td className="py-2.5 px-4 font-bold text-white">
                            <div className="flex items-center gap-3">
                              {/* Player Image Thumbnail */}
                              <div
                                className="w-8 h-8 rounded-full border overflow-hidden bg-indigo-950 flex items-center justify-center shrink-0 shadow-sm"
                                style={{ borderColor: player?.teamColor || "#A855F7" }}
                              >
                                {player?.photo ? (
                                  <img
                                    src={player.photo}
                                    alt=""
                                    className="w-full h-full object-cover object-top"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                      const fallbackContainer = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                                      if (fallbackContainer) (fallbackContainer as HTMLElement).style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="w-full h-full flex items-center justify-center bg-gradient-to-b from-indigo-950 to-indigo-900"
                                  style={{ display: player?.photo ? "none" : "flex" }}
                                >
                                  <svg className="w-4.5 h-4.5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                  </svg>
                                </div>
                              </div>

                              {/* Name & Metadata */}
                              <div className="flex flex-col justify-center gap-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="truncate">{player.name}</span>
                                  {player.isCaptain && <span className="bg-secondary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono shrink-0">C</span>}
                                  {player.isViceCaptain && <span className="bg-text-muted text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono shrink-0">V</span>}
                                  {player.subIn && <span className="bg-emerald-900/90 border border-emerald-400 text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0">IN</span>}
                                </div>
                                <span className="text-[10px] font-semibold text-text-muted/70 uppercase tracking-wider">
                                  {player.position} • {player.team}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center text-white">{getPlayerPrice(player)}</td>
                          <td className="py-3.5 px-4 text-center text-[var(--color-success-bright)] font-mono font-extrabold">{player.point}</td>
                        </tr>
                      ))
                    )}
                    {(bench || []).map((player, idx) => {
                      const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
                      return (
                        <tr key={player.id} className="hover:bg-white/5 transition-colors bg-black/10 cursor-pointer" onClick={() => handlePlayerClick(player)}>
                          <td className="py-2.5 px-4 font-bold text-text-muted">
                            <div className="flex items-center gap-3">
                              {/* Player Image Thumbnail */}
                              <div
                                className="w-8 h-8 rounded-full border overflow-hidden bg-indigo-950 flex items-center justify-center shrink-0 shadow-sm opacity-70"
                                style={{ borderColor: player?.teamColor || "#94a3b8" }}
                              >
                                {player?.photo ? (
                                  <img
                                    src={player.photo}
                                    alt=""
                                    className="w-full h-full object-cover object-top"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                      const fallbackContainer = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                                      if (fallbackContainer) (fallbackContainer as HTMLElement).style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="w-full h-full flex items-center justify-center bg-gradient-to-b from-indigo-950 to-indigo-900"
                                  style={{ display: player?.photo ? "none" : "flex" }}
                                >
                                  <svg className="w-4.5 h-4.5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                  </svg>
                                </div>
                              </div>

                              {/* Name & Metadata */}
                              <div className="flex flex-col justify-center gap-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="truncate">{player.name}</span>
                                  {player.subOut && <span className="bg-rose-900/90 border border-rose-400 text-rose-300 text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0">OUT</span>}
                                </div>
                                <span className="text-[10px] font-semibold text-text-muted/50 uppercase tracking-wider">
                                  {label} • {player.team}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center text-text-muted/65">{getPlayerPrice(player)}</td>
                          <td className="py-3.5 px-4 text-center text-text-muted/65 font-mono font-extrabold">{player.point}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Points View Content */
          <div className="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full animate-in fade-in duration-300">
            {/* Stats Summary Panel */}
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-card grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Score</span>
                <span className="text-sm md:text-lg font-black text-[var(--color-success-bright)] mt-0.5 font-mono">
                  {totalGWScore ?? 0} pts
                </span>
              </div>

              <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
                <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Average</span>
                <span className="text-sm md:text-lg font-black text-white mt-0.5 font-mono">
                  {avg ?? 0} pts
                </span>
              </div>

              <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
                <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Highest</span>
                <span className="text-sm md:text-lg font-black text-white mt-0.5 font-mono">
                  {highest ?? 0} pts
                </span>
              </div>
            </div>

            {/* List View Table */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card flex flex-col w-full flex-1">
              <div className="overflow-y-auto overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_rgba(45,27,84,0.4)]">
                    <tr className="bg-card border-b border-border text-text-muted uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="py-3 px-4">Stat Type</th>
                      <th className="py-3 px-4 text-center">Compiled Count</th>
                      <th className="py-3 px-4 text-center">Points Formed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 font-medium text-white">
                    {(() => {
                      const totals = compileTeamTotals();
                      const rows = [
                        { label: "Minutes Played", ...totals.minutes },
                        { label: "Goals", ...totals.goals },
                        { label: "Assists", ...totals.assists },
                        { label: "Clean Sheet", ...totals.cleanSheets },
                        { label: "Yellow Card", ...totals.yellowCards },
                        { label: "Red Card", ...totals.redCards },
                        { label: "Penalty Miss", ...totals.penaltyMissed },
                        { label: "Penalty Save", ...totals.penaltySaved },
                        { label: "Saves", ...totals.saves },
                        { label: "Tackles", ...totals.tackles },
                        { label: "Clearances", ...totals.clearances },
                        { label: "Blocks", ...totals.blocks },
                        { label: "Recovery", ...totals.recoveries },
                        { label: "Defensive Actions Points", ...totals.defensivePoints, isPointsOnly: true },
                      ];

                      return rows.map((row) => {
                        const isDefensiveActionRaw = ["Tackles", "Clearances", "Blocks", "Recovery"].includes(row.label);
                        const pointsVal = (row as any).isPointsOnly
                          ? `${row.points > 0 ? "+" : ""}${row.points} pts`
                          : isDefensiveActionRaw
                            ? "—"
                            : `${row.points > 0 ? "+" : ""}${row.points} pts`;

                        const pointsColor = row.points > 0 
                          ? "text-[var(--color-success-bright)]" 
                          : row.points < 0 
                            ? "text-rose-400" 
                            : "text-text-muted/65";

                        return (
                          <tr key={row.label} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">
                              {row.label}
                            </td>
                            <td className="py-3.5 px-4 text-center text-white font-mono">
                              {row.count}{(row as any).suffix}
                            </td>
                            <td className={`py-3.5 px-4 text-center font-mono font-extrabold ${pointsColor}`}>
                              {pointsVal}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player Selection Actions Overlay Modal */}
      <PlayerStatsModal
        isOpen={showOverlay}
        onClose={() => {
          setShowOverlay(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
        playerStats={selectedPlayer?.playerStats}
        pickMyTeam={false}
      />
    </div>
  );
};

export default GameweekBreakdownPage;
