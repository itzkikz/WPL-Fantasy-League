import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  SlidersHorizontal,
  Bell,
  Trophy,
  ChevronRight,
  BarChart3,
  Clock,
  Crown
} from "lucide-react";
import { ViewTransitions } from "../../types/viewTransitions";
import { useStandings, useStandingsFixtures } from "../../features/standings/hooks";
import { useManagerDetails } from "../../features/manager/hooks";
import dayjs from "dayjs";

const MOCK_MANAGERS: Record<string, string> = {
  "The Invincibles": "Rahul Sharma",
  "Kiran FC": "Kiran Nandakumar",
  "Blue Devils": "Amit Verma",
  "Goal Diggers": "Sneha Iyer",
  "Pitch Perfect": "Vikram Mehta",
  "Net Busters": "Rohit Singh",
  "Kings XI": "Neha Kapoor",
  "Vamos FC": "Arjun Patel",
  "Red Warriors": "Manish Reddy",
  "Thunderbolts": "Pooja Nair"
};

const getManagerName = (teamName: string, index: number) => {
  if (MOCK_MANAGERS[teamName]) return MOCK_MANAGERS[teamName];
  const defaultNames = ["Rahul Sharma", "Kiran Nandakumar", "Amit Verma", "Sneha Iyer", "Vikram Mehta", "Rohit Singh", "Neha Kapoor", "Arjun Patel", "Manish Reddy", "Pooja Nair"];
  return defaultNames[index % defaultNames.length];
};

const getTeamIcon = (teamName: string, index: number) => {
  const icons = [
    { bg: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20', emoji: '⚽' },
    { bg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', emoji: '🔮' },
    { bg: 'bg-red-500/10 text-red-500 border border-red-500/20', emoji: '👹' },
    { bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', emoji: '⚡' },
    { bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', emoji: '🛡️' },
    { bg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20', emoji: '🛸' },
    { bg: 'bg-pink-500/10 text-pink-400 border border-pink-500/20', emoji: '👑' },
    { bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', emoji: '⭐' },
    { bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', emoji: '⚔️' },
    { bg: 'bg-slate-500/10 text-slate-400 border border-slate-500/20', emoji: '⚽' }
  ];
  return icons[index % icons.length];
};

const StandingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overall' | 'fixtures'>('overall');
  const { data: standings, isLoading } = useStandings();
  const { data: managerDetails } = useManagerDetails();
  const { data: fixturesResponse, isLoading: isLoadingFixtures } = useStandingsFixtures();

  const gameweekNumber = fixturesResponse?.gameweek || 15;
  const fixturesList = fixturesResponse?.fixtures || [];

  const handleTeamClick = (teamId: string) => {
    navigate({
      to: "/standings/$teamId",
      params: { teamId },
      viewTransition: ViewTransitions.forward,
    });
  };

  // Find user's stats
  const myTeamIndex = standings?.findIndex(t => t.team === managerDetails?.team) ?? -1;
  const myTeam = myTeamIndex !== -1 ? standings![myTeamIndex] : null;
  const myRank = myTeamIndex !== -1 ? myTeamIndex + 1 : 2;
  const myPosChange = myTeam?.pos_change ?? 1;
  const totalPoints = myTeam ? myTeam.total : "1,234";
  const gwPoints = myTeam ? myTeam.current_gw : 56;
  const overallRankPercent = myTeamIndex !== -1 ? `Top ${Math.max(1, Math.round(((myTeamIndex + 1) / standings!.length) * 100))}%` : "Top 2%";

  return (
    <div className="flex flex-col h-[calc(100dvh-48px-80px)] lg:h-[calc(100vh-48px)] bg-[#0d021a] text-white overflow-hidden font-outfit">

      {/* 3. Navigation Tabs */}
      <div className="mx-4 mt-3 mb-4 flex border-b border-[#2d1b54] shrink-0">
        <button
          onClick={() => setActiveTab("overall")}
          className={`flex-1 pb-2 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative cursor-pointer
            ${activeTab === "overall" ? "text-violet-300" : "text-[#a594c9]/60 hover:text-white"}`}
        >
          Overall Standings
          {activeTab === "overall" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("fixtures")}
          className={`flex-1 pb-2 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative cursor-pointer
            ${activeTab === "fixtures" ? "text-violet-300" : "text-[#a594c9]/60 hover:text-white"}`}
        >
          Fixtures
          {activeTab === "fixtures" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
          )}
        </button>
      </div>

      {/* Summary Card (only on overall) */}
      {activeTab === 'overall' && (
        <div className="mx-4 p-4 rounded-2xl bg-[radial-gradient(circle_at_68%_20%,rgba(139,92,246,.35),transparent_32%),linear-gradient(135deg,#6f28a9_0%,#291344_48%,#15102a_100%)] border border-white/10 flex items-center justify-between mb-4 flex-none shadow-xl">
          <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rotate-45 scale-110" />
            <Trophy className="w-6 h-6 text-white relative z-10" />
          </div>

          <div className="flex-1 grid grid-cols-4 gap-1 ml-4 text-center">
            <div>
              <p className="text-[10px] text-[#c8c8c8]/60 font-medium">Your Rank</p>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-xl font-black text-white">{myRank}</span>
                {myPosChange !== 0 ? (
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${myPosChange > 0 ? 'text-success' : 'text-danger'}`}>
                    {myPosChange > 0 ? `▲` : `▼`} {Math.abs(myPosChange)}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#c8c8c8]/40">-</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-[#c8c8c8]/60 font-medium">Total Points</p>
              <p className="text-xl font-black text-white mt-0.5">{totalPoints}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#c8c8c8]/60 font-medium">GW Points</p>
              <p className="text-xl font-black text-success mt-0.5">{gwPoints}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#c8c8c8]/60 font-medium">Overall Rank</p>
              <p className="text-xl font-black text-white mt-0.5">{overallRankPercent}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main List Area */}
      <div className="flex-1 overflow-hidden flex flex-col px-4">
        {/* Column Headers */}
        {activeTab === 'overall' && (
          <div className="flex items-center justify-between text-[11px] font-bold text-[#c8c8c8]/50 uppercase tracking-wider px-3 pb-2.5 flex-none">
            <div className="w-10 text-left">Rank</div>
            <div className="flex-1 text-left pl-3">Manager</div>
            <div className="w-20 text-center">GW Points</div>
            <div className="w-24 text-right pr-6">Total Points</div>
          </div>
        )}

        {/* Scrollable List Container */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-2.5">
          {isLoading ? (
            [...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`h-16 bg-white/5 border border-white/5 rounded-2xl skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
              />
            ))
          ) : activeTab === 'overall' ? (
            standings?.map((r, i) => {
              const isMe = r.team === managerDetails?.team;
              const posChange = r.pos_change ?? 0;
              const crest = getTeamIcon(r.team, i);
              const manager = r.manager || getManagerName(r.team, i);

              return (
                <div
                  key={r.team_id}
                  onClick={() => handleTeamClick(r.team_id)}
                  style={{ viewTransitionName: `team-row-${r.team_id}` }}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 ${isMe
                    ? 'bg-[#211433]/70 border border-primary/45 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                    : 'bg-white/5 border border-white/[0.03] hover:bg-white/10'
                    }`}
                >
                  {/* Rank & Change column */}
                  <div className="w-10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-base font-black text-white">{i + 1}</span>
                    {posChange !== 0 ? (
                      <span className={`text-[9px] font-bold flex items-center gap-0.5 mt-0.5 ${posChange > 0 ? 'text-success' : 'text-danger'}`}>
                        {posChange > 0 ? `▲` : `▼`}{Math.abs(posChange)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#c8c8c8]/30 mt-0.5">-</span>
                    )}
                  </div>

                  {/* Team Crest Avatar */}
                  <div className="relative pl-2 flex-shrink-0">
                    {i === 0 && (
                      <Crown className="w-4 h-4 text-yellow-400 absolute -top-2.5 left-4 rotate-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10 animate-pulse" />
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${crest.bg}`}>
                      {crest.emoji}
                    </div>
                  </div>

                  {/* Name column */}
                  <div className="flex-1 pl-3.5 min-w-0">
                    <p className="text-[14px] font-bold text-white leading-snug truncate">{r.team}</p>
                    <p className="text-[11px] text-[#c8c8c8]/50 truncate mt-0.5">{manager}</p>
                  </div>

                  {/* GW points */}
                  <div className="w-20 text-center font-black text-[14px] text-success flex-shrink-0">
                    {r.current_gw}
                  </div>

                  {/* Total points & Arrow */}
                  <div className="w-24 flex items-center justify-end gap-2.5 flex-shrink-0 text-right">
                    <span className="text-[14px] font-black text-white">{r.total}</span>
                    <ChevronRight className="w-4 h-4 text-[#c8c8c8]/30" />
                  </div>
                </div>
              );
            })
          ) : (
            /* Fixtures tab displaying real fixtures of current gameweek */
            isLoadingFixtures ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-16 bg-white/5 border border-white/5 rounded-2xl skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
                />
              ))
            ) : fixturesList.length > 0 ? (
              <div className="space-y-3 pb-8">
                <div className="text-center py-2.5 bg-violet-950/20 border border-[#2d1b54]/50 rounded-xl mb-4 flex items-center justify-center gap-1.5 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-ping" />
                  <p className="text-xs font-black uppercase tracking-wider text-violet-300 font-mono">Gameweek {gameweekNumber} Fixtures</p>
                </div>

                {fixturesList.map((fix: any) => {
                  const startTime = dayjs(fix.startTimestamp * 1000).format("ddd, D MMM • h:mm A");
                  const isFinished = fix.status?.type === "finished";
                  const isInProgress = fix.status?.type === "inprogress";

                  return (
                    <div
                      key={fix.fixtureId}
                      className="bg-white/5 border border-white/[0.03] hover:bg-white/10 rounded-2xl p-4 flex items-center justify-between transition-all duration-200"
                    >
                      {/* Home Team */}
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        {fix.homeTeam.photo ? (
                          <img src={fix.homeTeam.photo} className="w-8 h-8 object-contain shrink-0" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-black text-xs shrink-0 text-white font-mono" style={{ backgroundColor: fix.homeTeam.color }}>
                            {fix.homeTeam.shortName}
                          </div>
                        )}
                        <span className="text-sm font-extrabold text-white truncate leading-tight">{fix.homeTeam.name}</span>
                      </div>

                      {/* Score / VS Center Area */}
                      <div className="px-4 flex flex-col items-center justify-center shrink-0 min-w-[95px]">
                        {isFinished || isInProgress ? (
                          <div className="flex items-center gap-2.5 bg-[#0d021a] border border-[#2d1b54] rounded-xl px-2.5 py-0.5 shadow-inner">
                            <span className="text-sm font-black text-white font-mono">{fix.homeScore?.display ?? 0}</span>
                            <span className="text-[10px] font-black text-[#a594c9]/60 font-mono">―</span>
                            <span className="text-sm font-black text-white font-mono">{fix.awayScore?.display ?? 0}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-md font-mono">VS</span>
                        )}
                        <span className={`text-[8px] font-bold mt-1.5 uppercase tracking-wider
                          ${isInProgress ? "text-rose-400 animate-pulse font-black" : "text-[#a594c9]/50"}`}>
                          {isInProgress ? "LIVE" : isFinished ? "FT" : startTime}
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex items-center gap-3 justify-end min-w-0">
                        <span className="text-sm font-extrabold text-white truncate leading-tight text-right">{fix.awayTeam.name}</span>
                        {fix.awayTeam.photo ? (
                          <img src={fix.awayTeam.photo} className="w-8 h-8 object-contain shrink-0" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-black text-xs shrink-0 text-white font-mono" style={{ backgroundColor: fix.awayTeam.color }}>
                            {fix.awayTeam.shortName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-[#c8c8c8]/40 text-center">
                <p className="text-sm font-medium">No Fixtures Scheduled</p>
                <p className="text-xs mt-1">No fixtures mapped to Gameweek {gameweekNumber}.</p>
              </div>
            )
          )}

          {/* Last updated footer label */}
          {!isLoading && standings && standings.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 pt-4 text-[11px] text-[#c8c8c8]/40">
              <Clock className="w-3.5 h-3.5" />
              <span>Last updated: 2 mins ago</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Call to Action footer
      {activeTab === 'overall' && !isLoading && (
        <div className="absolute bottom-20 left-0 right-0 px-4 py-3 bg-[#0d021a]/95 backdrop-blur-md border-t border-white/5 flex-none z-10">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xs flex items-center justify-between active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(139,92,246,0.25)]"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-white/80" />
              <span>View Gameweek Breakdown</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/80" />
          </button>
        </div>
      )} */}

    </div>
  );
};

export default StandingsPage;
