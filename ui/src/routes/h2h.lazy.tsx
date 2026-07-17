import { createLazyFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "./ProtectedRoute";
import { useState, useMemo } from "react";
import { useMyH2HLeagues, useH2HStandings, useH2HLeagueFixtures } from "../features/h2h/hooks";
import { useManagerDetails } from "../features/manager/hooks";
import { H2HLeague, H2HStanding, H2HFixture } from "../features/h2h/types";
import { Shield, Swords, ChevronDown, Calendar, Crown, Clock } from "lucide-react";
import { useTeamDetails } from "../features/standings/hooks";

export const Route = createLazyFileRoute("/h2h")({
  component: () => (
    <ProtectedRoute>
      <H2HPage />
    </ProtectedRoute>
  ),
});

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

const compileTeamTotals = (details: any) => {
  const totals = {
    minutes: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    yellowCards: 0,
    redCards: 0,
    penaltyMissed: 0,
    penaltySaved: 0,
    saves: 0,
    tackles: 0,
    clearances: 0,
    blocks: 0,
    recoveries: 0,
    captainPoints: 0,
    totalPoints: details?.totalGWScore || 0,
  };

  if (!details) return totals;

  const starters = [
    ...(details.starting?.GK || []),
    ...(details.starting?.DEF || []),
    ...(details.starting?.MID || []),
    ...(details.starting?.FWD || []),
  ];

  starters.forEach((p: any) => {
    const s = p.stats;
    if (s) {
      totals.minutes += s.minutesPlayed || 0;
      totals.goals += s.goals || 0;
      totals.assists += s.goalAssist || 0;
      if (s.cleanSheet > 0 && (p.position === 'GK' || p.position === 'DEF' || p.position === 'MID')) {
        totals.cleanSheets += s.cleanSheet;
      }
      totals.yellowCards += s.yellowCards || 0;
      totals.redCards += s.redCards || 0;
      totals.penaltyMissed += s.penaltyMissed || 0;
      totals.penaltySaved += s.penaltySaved || 0;
      totals.saves += s.saves || 0;
      totals.tackles += s.totalTackle || 0;
      totals.clearances += s.totalClearance || 0;
      totals.blocks += s.outfielderBlock || 0;
      totals.recoveries += s.ballRecovery || 0;
    }
    if (p.isCaptain || p.isViceCaptain) {
      totals.captainPoints += p.point || 0;
    }
  });

  return totals;
};

function H2HFixtureDetails({ homeTeamId, awayTeamId, gameweek }: { homeTeamId: string; awayTeamId: string; gameweek: number }) {
  const { data: homeDetails, isLoading: homeLoading } = useTeamDetails(homeTeamId, gameweek);
  const { data: awayDetails, isLoading: awayLoading } = useTeamDetails(awayTeamId, gameweek);

  if (homeLoading || awayLoading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const homeTotals = compileTeamTotals(homeDetails);
  const awayTotals = compileTeamTotals(awayDetails);

  const statRows = [
    { key: 'minutes', label: 'Minutes Played' },
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'cleanSheets', label: 'Clean Sheets' },
    { key: 'yellowCards', label: 'Yellow Cards' },
    { key: 'redCards', label: 'Red Cards' },
    { key: 'penaltyMissed', label: 'Penalty Miss' },
    { key: 'penaltySaved', label: 'Penalty Save' },
    { key: 'saves', label: 'Saves' },
    { key: 'tackles', label: 'Tackles' },
    { key: 'clearances', label: 'Clearances' },
    { key: 'blocks', label: 'Blocks' },
    { key: 'recoveries', label: 'Recoveries' },
    { key: 'captainPoints', label: 'Captain/VC Points' },
    { key: 'totalPoints', label: 'Total Points', highlight: true },
  ];

  return (
    <div 
      className="border-t border-white/5 pt-4 mt-3 animate-in fade-in slide-in-from-top-1 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with Team names */}
      <div className="grid grid-cols-3 text-center mb-3 pb-2 border-b border-white/5">
        <div className="text-xs font-black text-violet-400 truncate px-1">
          {homeDetails?.team_name || 'Home Team'}
        </div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest self-center">
          TEAM STATS
        </div>
        <div className="text-xs font-black text-violet-400 truncate px-1">
          {awayDetails?.team_name || 'Away Team'}
        </div>
      </div>

      {/* Stats list */}
      <div className="space-y-1">
        {statRows.map((row) => {
          const valHome = homeTotals[row.key as keyof typeof homeTotals] ?? 0;
          const valAway = awayTotals[row.key as keyof typeof awayTotals] ?? 0;

          // Determine colors based on higher value (except for cards and penalty misses where lower is better)
          const isLowerBetter = ['yellowCards', 'redCards', 'penaltyMissed'].includes(row.key);
          const isHomeWinner = isLowerBetter ? valHome < valAway : valHome > valAway;
          const isAwayWinner = isLowerBetter ? valAway < valHome : valAway > valHome;
          const isDraw = valHome === valAway;

          const homeColor = isDraw 
            ? 'text-gray-300' 
            : isHomeWinner 
              ? 'text-emerald-400 font-extrabold' 
              : 'text-gray-500';

          const awayColor = isDraw 
            ? 'text-gray-300' 
            : isAwayWinner 
              ? 'text-emerald-400 font-extrabold' 
              : 'text-gray-500';

          if (row.highlight) {
            return (
              <div 
                key={row.key} 
                className="grid grid-cols-3 items-center py-2.5 px-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center font-black mt-2"
              >
                <div className="text-sm text-violet-300 font-mono">
                  {valHome}
                </div>
                <div className="text-xs text-white uppercase tracking-wider">
                  {row.label}
                </div>
                <div className="text-sm text-violet-300 font-mono">
                  {valAway}
                </div>
              </div>
            );
          }

          return (
            <div 
              key={row.key} 
              className="grid grid-cols-3 items-center py-1.5 px-3 hover:bg-white/[0.02] rounded-lg transition-colors text-center text-xs"
            >
              <div className={`font-mono ${homeColor}`}>
                {valHome}
              </div>
              <div className="text-[10px] text-gray-400 font-medium">
                {row.label}
              </div>
              <div className={`font-mono ${awayColor}`}>
                {valAway}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



function H2HPage() {
  const { data: leagues = [], isLoading } = useMyH2HLeagues();
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overall' | 'fixtures'>('overall');
  const [fixtureFilter, setFixtureFilter] = useState<'mine' | 'all'>('mine');
  const [selectedGw, setSelectedGw] = useState<number | null>(null);
  const [expandedFixtureId, setExpandedFixtureId] = useState<string | null>(null);

  const handleFixtureClick = (fixtureId: string, isFinished: boolean) => {
    if (!isFinished) return;
    setExpandedFixtureId(prev => prev === fixtureId ? null : fixtureId);
  };

  // Auto-select the first league if none selected
  const selectedLeague = leagues.find((l: H2HLeague) => l._id === selectedLeagueId) || leagues[0];
  if (selectedLeague && !selectedLeagueId) {
    setSelectedLeagueId(selectedLeague._id);
  }

  const { data: standingsData, isLoading: standingsLoading } = useH2HStandings(selectedLeagueId ?? '');
  const { data: fixturesData, isLoading: fixturesLoading } = useH2HLeagueFixtures(selectedLeagueId ?? '');
  const { data: managerDetails } = useManagerDetails();

  const uniqueGameweeks = useMemo(() => {
    return [...new Set(fixturesData?.fixtures?.map((f: H2HFixture) => f.gameweek) || [])].sort((a, b) => a - b);
  }, [fixturesData]);

  // Set default selected gameweek to the latest gameweek that is completed, or first one
  useMemo(() => {
    if (uniqueGameweeks.length > 0 && selectedGw === null) {
      // Find the latest completed gw in our fixtures list, or default to current gameweek
      const completedGwsInFixtures = fixturesData?.fixtures
        ?.filter((f: H2HFixture) => f.status === 'completed')
        .map((f: H2HFixture) => f.gameweek) || [];
      const maxCompletedGw = completedGwsInFixtures.length > 0 ? Math.max(...completedGwsInFixtures) : null;
      
      // Default to maxCompletedGw + 1 if possible, or maxCompletedGw, or first
      if (maxCompletedGw !== null) {
        const nextGw = maxCompletedGw + 1;
        if (uniqueGameweeks.includes(nextGw)) {
          setSelectedGw(nextGw);
        } else {
          setSelectedGw(maxCompletedGw);
        }
      } else {
        setSelectedGw(uniqueGameweeks[0]);
      }
    }
  }, [uniqueGameweeks, fixturesData, selectedGw]);

  const filteredFixtures = useMemo(() => {
    let list = fixturesData?.fixtures || [];
    
    // Filter by gameweek
    if (selectedGw !== null) {
      list = list.filter((f: H2HFixture) => f.gameweek === selectedGw);
    }
    
    // Filter by user's team
    if (fixtureFilter === 'mine') {
      const myTeamId = managerDetails?.managerTeam?._id;
      if (myTeamId) {
        list = list.filter((f: H2HFixture) => f.homeTeam?._id === myTeamId || f.awayTeam?._id === myTeamId);
      }
    }
    
    return list;
  }, [fixturesData, selectedGw, fixtureFilter, managerDetails]);

  return (
    <div className="flex flex-col h-[calc(100dvh-48px-80px)] lg:h-[calc(100vh-48px)] bg-background text-white overflow-hidden font-outfit">
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-none flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Swords className="w-6 h-6 text-violet-400" />
            Head to Head
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Challenge other managers in your H2H league.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leagues.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/25 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-lg text-gray-300 font-semibold">No H2H League</p>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
            You haven't been added to any H2H league yet. Ask an admin to create one and add your team.
          </p>
        </div>
      ) : (
        <>
          {/* League Selector (Only show if multiple leagues exist) */}
          {leagues.length > 1 && (
            <div className="px-4 mb-2 flex-none">
              <div className="relative">
                <select
                  value={selectedLeagueId ?? ''}
                  onChange={(e) => setSelectedLeagueId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-violet-500 appearance-none cursor-pointer"
                >
                  {leagues.map((l: H2HLeague) => (
                    <option key={l._id} value={l._id} className="bg-[#1b142d] text-white">
                      {l.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mx-4 mt-2 mb-3 flex border-b border-[var(--color-border-divider)] shrink-0">
            <button
              onClick={() => setActiveTab("overall")}
              className={`flex-1 pb-2 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative cursor-pointer
                ${activeTab === "overall" ? "text-violet-400" : "text-text-muted/60 hover:text-white"}`}
            >
              Standings Table
              {activeTab === "overall" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("fixtures")}
              className={`flex-1 pb-2 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative cursor-pointer
                ${activeTab === "fixtures" ? "text-violet-400" : "text-text-muted/60 hover:text-white"}`}
            >
              Fixtures & Results
              {activeTab === "fixtures" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
              )}
            </button>
          </div>

          {/* Summary / Info Bar */}
          {selectedLeague && (
            <div className="mx-4 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between mb-3 text-[11px] text-gray-400 flex-none">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                GW {selectedLeague.gameweekStart} – {selectedLeague.gameweekEnd}
              </span>
              <span className="font-semibold text-white uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                {selectedLeague.name}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-violet-400" />
                {selectedLeague.fantasyTeams?.length || 0} teams
              </span>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col px-4">
            
            {/* Headers for standings tab */}
            {activeTab === 'overall' && !standingsLoading && standingsData?.standings && (
              <div className="flex items-center justify-between text-[10px] font-bold text-[#c8c8c8]/50 uppercase tracking-wider px-2 pb-2 flex-none">
                <div className="w-8 text-center">Rank</div>
                <div className="flex-1 text-left pl-3">Team</div>
                <div className="w-6 text-center">P</div>
                <div className="w-6 text-center">W</div>
                <div className="w-6 text-center">D</div>
                <div className="w-6 text-center">L</div>
                <div className="w-12 text-center hidden md:block">PF</div>
                <div className="w-12 text-center hidden md:block">PA</div>
                <div className="w-8 text-center">Diff</div>
                <div className="w-12 text-right pr-2">Pts</div>
              </div>
            )}

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-2.5">
              {activeTab === 'overall' ? (
                standingsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-white/5 border border-white/5 rounded-2xl animate-pulse"
                    />
                  ))
                ) : standingsData?.standings && standingsData.standings.length > 0 ? (
                  standingsData.standings.map((team: H2HStanding, idx: number) => {
                    const isMe = team.teamId === managerDetails?.managerTeam?._id || team.teamName === managerDetails?.team;
                    const crest = getTeamIcon(team.teamName, idx);
                    const manager = getManagerName(team.teamName, idx);
                    const diff = team.gf - team.ga;

                    return (
                      <div
                        key={team.teamId}
                        className={`flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 ${
                          isMe
                            ? 'bg-[#211433]/70 border border-violet-500/45 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                            : 'bg-white/5 border border-white/[0.03] hover:bg-white/10'
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-8 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-white">{idx + 1}</span>
                        </div>

                        {/* Avatar */}
                        <div className="relative pl-1 flex-shrink-0">
                          {idx === 0 && (
                            <Crown className="w-3.5 h-3.5 text-yellow-400 absolute -top-2.5 left-3 rotate-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10 animate-pulse" />
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${crest.bg}`}>
                            {crest.emoji}
                          </div>
                        </div>

                        {/* Name and Manager */}
                        <div className="flex-1 pl-2.5 min-w-0">
                          <p className="text-[12px] font-bold text-white leading-snug truncate">{team.teamName}</p>
                          <p className="text-[9px] text-[#c8c8c8]/50 truncate mt-0.5">{manager}</p>
                        </div>

                        {/* Stats */}
                        <div className="w-6 text-center text-xs text-gray-300 font-medium flex-shrink-0">
                          {team.played}
                        </div>
                        <div className="w-6 text-center text-xs text-gray-400 font-medium flex-shrink-0">
                          {team.won}
                        </div>
                        <div className="w-6 text-center text-xs text-gray-400 font-medium flex-shrink-0">
                          {team.drawn}
                        </div>
                        <div className="w-6 text-center text-xs text-gray-400 font-medium flex-shrink-0">
                          {team.lost}
                        </div>
                        <div className="w-12 text-center text-xs text-gray-300 font-medium hidden md:block flex-shrink-0">
                          {team.gf}
                        </div>
                        <div className="w-12 text-center text-xs text-gray-400 font-medium hidden md:block flex-shrink-0">
                          {team.ga}
                        </div>

                        {/* Diff */}
                        <div className={`w-8 text-center text-xs font-semibold flex-shrink-0 ${
                          diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-gray-400'
                        }`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </div>

                        {/* Points */}
                        <div className="w-12 text-right pr-2 font-black text-[12px] text-violet-400 flex-shrink-0">
                          {team.pts}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    No standings calculated yet.
                  </div>
                )
              ) : (
                /* Fixtures Tab */
                fixturesLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-white/5 border border-white/5 rounded-2xl animate-pulse"
                    />
                  ))
                ) : (
                  <div className="space-y-3 pb-8">
                    {/* Fixture Filter & Gameweek selector */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFixtureFilter('mine')}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            fixtureFilter === 'mine'
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                              : 'bg-white/5 text-text-muted/50 border border-white/[0.06] hover:text-white'
                          }`}
                        >
                          Your Matchups
                        </button>
                        <button
                          onClick={() => setFixtureFilter('all')}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            fixtureFilter === 'all'
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                              : 'bg-white/5 text-text-muted/50 border border-white/[0.06] hover:text-white'
                          }`}
                        >
                          All Matchups
                        </button>
                      </div>

                      {uniqueGameweeks.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">GW:</span>
                          <select
                            value={selectedGw ?? ''}
                            onChange={(e) => setSelectedGw(e.target.value ? Number(e.target.value) : null)}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                          >
                            {uniqueGameweeks.map((gw) => (
                              <option key={gw} value={gw} className="bg-[#1b142d] text-white">
                                GW {gw}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Fixtures List */}
                    {filteredFixtures.length === 0 ? (
                      <div className="text-center py-12 text-[#c8c8c8]/40">
                        <p className="text-sm font-medium">No matchups found</p>
                        <p className="text-xs mt-1">Select another gameweek or filter option.</p>
                      </div>
                    ) : (
                      filteredFixtures.map((fixture: H2HFixture) => {
                        const isHomeMe = fixture.homeTeam?._id === managerDetails?.managerTeam?._id;
                        const isAwayMe = fixture.awayTeam?._id === managerDetails?.managerTeam?._id;
                        const isRelevant = isHomeMe || isAwayMe;
                        const isFinished = fixture.status === 'completed';
                        const isExpanded = expandedFixtureId === fixture._id;

                        return (
                          <div
                            key={fixture._id}
                            onClick={() => handleFixtureClick(fixture._id, isFinished)}
                            className={`rounded-2xl transition-all duration-200 p-4 ${
                              isFinished ? 'cursor-pointer font-medium' : 'cursor-default'
                            } ${
                              isExpanded
                                ? 'bg-white/[0.06] border border-violet-500/30 shadow-[0_0_16px_rgba(139,92,246,0.2)]'
                                : isRelevant
                                ? 'bg-violet-500/[0.06] border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.1)] hover:bg-violet-500/[0.08]'
                                : 'bg-white/5 border border-white/[0.03] hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              {/* Home Team */}
                              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                                <span className={`text-sm font-extrabold truncate leading-tight ${
                                  isFinished && fixture.winner === fixture.homeTeam?._id ? 'text-emerald-400' : 'text-white'
                                }`}>
                                  {fixture.homeTeam?.name || 'TBD'}
                                </span>
                              </div>

                              {/* Score/Center Area */}
                              <div className="px-4 flex flex-col items-center justify-center shrink-0 min-w-[95px]">
                                {isFinished ? (
                                  <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-2.5 py-0.5 shadow-inner">
                                    <span className={`text-sm font-black font-mono ${fixture.winner === fixture.homeTeam?._id ? 'text-emerald-400' : 'text-white'}`}>
                                      {fixture.homeScore ?? 0}
                                    </span>
                                    <span className="text-[10px] font-black text-text-muted/60 font-mono">―</span>
                                    <span className={`text-sm font-black font-mono ${fixture.winner === fixture.awayTeam?._id ? 'text-emerald-400' : 'text-white'}`}>
                                      {fixture.awayScore ?? 0}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[9px] font-black text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-md font-mono">VS</span>
                                )}
                                <span className="text-[8px] font-bold mt-1 text-gray-500 uppercase tracking-wider font-mono">
                                  {isFinished ? "FT" : `GW ${fixture.gameweek}`}
                                </span>
                              </div>

                              {/* Away Team */}
                              <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
                                <span className={`text-sm font-extrabold truncate leading-tight text-right ${
                                  isFinished && fixture.winner === fixture.awayTeam?._id ? 'text-emerald-400' : 'text-white'
                                }`}>
                                  {fixture.awayTeam?.name || 'TBD'}
                                </span>
                              </div>
                            </div>

                            {/* Label and Click Instructions */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                              {isRelevant ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                  <span className="text-[9px] font-bold text-violet-400/80 uppercase tracking-wider">Your Matchup</span>
                                </div>
                              ) : (
                                <div />
                              )}
                              {isFinished && (
                                <span className="text-[8px] font-bold text-violet-400/60 uppercase tracking-wider hover:text-violet-300">
                                  {isExpanded ? 'Click to collapse' : 'Click to view details'}
                                </span>
                              )}
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                              <H2HFixtureDetails
                                homeTeamId={fixture.homeTeam._id}
                                awayTeamId={fixture.awayTeam._id}
                                gameweek={fixture.gameweek}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )
              )}

              {/* Footer */}
              {!isLoading && standingsData?.standings && standingsData.standings.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 pt-4 text-[10px] text-text-muted/45">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Computed from completed gameweeks</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}