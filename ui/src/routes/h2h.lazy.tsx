import { createLazyFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "./ProtectedRoute";
import { useState, useMemo } from "react";
import { useMyH2HLeagues, useH2HStandings, useH2HLeagueFixtures } from "../features/h2h/hooks";
import { useManagerDetails } from "../features/manager/hooks";
import { H2HLeague, H2HStanding, H2HFixture } from "../features/h2h/types";
import { Shield, Swords, ChevronDown, Calendar, Crown, Clock, Eye, X, LayoutGrid, BarChart3 } from "lucide-react";
import { useTeamDetails } from "../features/standings/hooks";
import { Modal } from "../components/common/Modal";

export const Route = createLazyFileRoute("/h2h")({
  component: () => (
    <ProtectedRoute>
      <H2HPage />
    </ProtectedRoute>
  ),
});



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

function isMyTeam(team: any, managerDetails: any) {
  if (!team || !managerDetails) return false;
  const myName = (managerDetails.team || "").trim().toLowerCase();
  const myId = (
    managerDetails.teamId ||
    managerDetails.managerTeam?._id ||
    managerDetails.managerTeam?.team_id ||
    managerDetails._id ||
    ""
  ).toString();

  const teamName = (team.name || team.teamName || "").trim().toLowerCase();
  const teamId = (team._id || team.id || team.teamId || "").toString();

  const matchId = Boolean(myId) && Boolean(teamId) && myId === teamId;
  const matchName = Boolean(myName) && Boolean(teamName) && myName === teamName;

  return matchId || matchName;
}

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
    interceptions: 0,
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
    const s = p.playerStats?.current_week;
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
      totals.interceptions += s.interceptionWon || 0;
      totals.recoveries += s.ballRecovery || 0;
    }
    if (p.isCaptain || p.isViceCaptain) {
      totals.captainPoints += p.point || 0;
    }
  });

  return totals;
};

const POSITION_GROUPS: { key: 'GK' | 'DEF' | 'MID' | 'FWD'; label: string }[] = [
  { key: 'GK', label: 'Goalkeeper' },
  { key: 'DEF', label: 'Defenders' },
  { key: 'MID', label: 'Midfielders' },
  { key: 'FWD', label: 'Forwards' },
];

const PlayerRow = ({ player, accent }: { player: any; accent: 'secondary' | 'primary' }) => (
  <div className="flex items-center justify-between gap-1.5 py-1.5 px-2 rounded-lg bg-background/40 border border-border/40 min-w-0">
    <div className="flex items-center gap-1.5 min-w-0">
      {(player.isCaptain || player.isViceCaptain) && (
        <span
          className={`text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
            player.isCaptain
              ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
              : 'bg-secondary/20 text-secondary border border-secondary/40'
          }`}
        >
          {player.isCaptain ? 'C' : 'V'}
        </span>
      )}
      <span className="text-[11px] font-bold text-text-primary truncate">
        {player.name || 'Unknown'}
      </span>
    </div>
    <span className={`text-[11px] font-mono font-black shrink-0 ${accent === 'secondary' ? 'text-secondary' : 'text-primary'}`}>
      {player.point ?? 0}
    </span>
  </div>
);

function H2HFixtureModal({ fixture, isOpen, onClose }: { fixture: H2HFixture | null; isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'lineup' | 'stats'>('lineup');
  const homeTeamId = fixture?.homeTeam?._id ?? '';
  const awayTeamId = fixture?.awayTeam?._id ?? '';
  const gameweek = fixture?.gameweek ?? 0;

  const { data: homeDetails, isLoading: homeLoading } = useTeamDetails(homeTeamId, gameweek);
  const { data: awayDetails, isLoading: awayLoading } = useTeamDetails(awayTeamId, gameweek);

  const isLoading = homeLoading || awayLoading;
  const homeTotals = compileTeamTotals(homeDetails);
  const awayTotals = compileTeamTotals(awayDetails);

  const homeTeamName = fixture?.homeTeam?.name || homeDetails?.team_name || 'Home Team';
  const awayTeamName = fixture?.awayTeam?.name || awayDetails?.team_name || 'Away Team';

  const getStarters = (details: any, pos: 'GK' | 'DEF' | 'MID' | 'FWD') => details?.starting?.[pos] || [];

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
    { key: 'interceptions', label: 'Interceptions' },
    { key: 'recoveries', label: 'Recoveries' },
    { key: 'captainPoints', label: 'Captain/VC Points' },
    { key: 'totalPoints', label: 'Total Points', highlight: true },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60 bg-background/50 flex-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary">Fixture Details</h3>
            <p className="text-[10px] text-text-muted font-medium">GW {gameweek} · Player vs Player</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-background border border-border text-text-muted hover:text-text-primary active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Score strip */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-border/40 bg-elevated/40 flex-none">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {fixture?.homeTeam?.logo && (
            <img src={fixture.homeTeam.logo} alt={`${homeTeamName} logo`} className="w-7 h-7 object-contain shrink-0" />
          )}
          <span className="text-xs font-extrabold text-text-primary truncate">{homeTeamName}</span>
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-2.5 py-1 shadow-inner shrink-0">
          <span className="text-base font-black font-mono text-text-primary">{fixture?.homeScore ?? 0}</span>
          <span className="text-[10px] font-black text-text-muted font-mono">—</span>
          <span className="text-base font-black font-mono text-text-primary">{fixture?.awayScore ?? 0}</span>
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-end gap-2 text-right">
          <span className="text-xs font-extrabold text-text-primary truncate">{awayTeamName}</span>
          {fixture?.awayTeam?.logo && (
            <img src={fixture.awayTeam.logo} alt={`${awayTeamName} logo`} className="w-7 h-7 object-contain shrink-0" />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 flex-none">
        <button
          onClick={() => setActiveTab('lineup')}
          className={`flex-1 flex items-center justify-center gap-1.5 pb-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all relative cursor-pointer ${
            activeTab === 'lineup' ? 'text-secondary' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Starting Lineup
          {activeTab === 'lineup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-1.5 pb-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all relative cursor-pointer ${
            activeTab === 'stats' ? 'text-secondary' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Team Stats
          {activeTab === 'stats' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
        </button>
      </div>

      {/* Body */}
      <div className="p-4 overflow-y-auto flex-1">
        {isLoading ? (
          <div className="py-10 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'lineup' ? (
          <div className="space-y-4">
            {/* Team labels */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] font-black text-secondary truncate">{homeTeamName}</p>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] font-black text-primary truncate">{awayTeamName}</p>
              </div>
            </div>

            {POSITION_GROUPS.map((group) => {
              const homePlayers = getStarters(homeDetails, group.key);
              const awayPlayers = getStarters(awayDetails, group.key);
              if (homePlayers.length === 0 && awayPlayers.length === 0) return null;

              return (
                <div key={group.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{group.label}</span>
                    <span className="text-[8px] font-black text-secondary bg-secondary/10 px-1.5 py-0.5 rounded font-mono">{group.key}</span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      {homePlayers.length > 0 ? (
                        homePlayers.map((p: any, i: number) => <PlayerRow key={i} player={p} accent="secondary" />)
                      ) : (
                        <div className="h-8 rounded-lg bg-background/30 border border-dashed border-border/50 flex items-center justify-center text-[9px] text-text-muted">No lineup</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {awayPlayers.length > 0 ? (
                        awayPlayers.map((p: any, i: number) => <PlayerRow key={i} player={p} accent="primary" />)
                      ) : (
                        <div className="h-8 rounded-lg bg-background/30 border border-dashed border-border/50 flex items-center justify-center text-[9px] text-text-muted">No lineup</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Header with Team names */}
            <div className="grid grid-cols-3 text-center mb-3 pb-2 border-b border-border/60">
              <div className="text-[11px] font-black text-secondary truncate px-1">{homeTeamName}</div>
              <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest self-center">TEAM STATS</div>
              <div className="text-[11px] font-black text-primary truncate px-1">{awayTeamName}</div>
            </div>

            {/* Stats list */}
            {statRows.map((row) => {
              const valHome = homeTotals[row.key as keyof typeof homeTotals] ?? 0;
              const valAway = awayTotals[row.key as keyof typeof awayTotals] ?? 0;

              // Determine colors based on higher value (except for cards and penalty misses where lower is better)
              const isLowerBetter = ['yellowCards', 'redCards', 'penaltyMissed'].includes(row.key);
              const isHomeWinner = isLowerBetter ? valHome < valAway : valHome > valAway;
              const isAwayWinner = isLowerBetter ? valAway < valHome : valAway > valHome;
              const isDraw = valHome === valAway;

              const homeColor = isDraw
                ? 'text-text-secondary'
                : isHomeWinner
                  ? 'text-emerald-400 font-extrabold'
                  : 'text-text-muted';

              const awayColor = isDraw
                ? 'text-text-secondary'
                : isAwayWinner
                  ? 'text-emerald-400 font-extrabold'
                  : 'text-text-muted';

              if (row.highlight) {
                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-3 items-center py-2.5 px-3 rounded-xl bg-secondary/15 border border-secondary/30 text-center font-black mt-2"
                  >
                    <div className="text-sm text-secondary font-mono">{valHome}</div>
                    <div className="text-xs text-text-primary uppercase tracking-wider">{row.label}</div>
                    <div className="text-sm text-primary font-mono">{valAway}</div>
                  </div>
                );
              }

              return (
                <div
                  key={row.key}
                  className="grid grid-cols-3 items-center py-1.5 px-3 hover:bg-elevated/40 rounded-lg transition-colors text-center text-xs"
                >
                  <div className={`font-mono ${homeColor}`}>{valHome}</div>
                  <div className="text-[10px] text-text-muted font-medium">{row.label}</div>
                  <div className={`font-mono ${awayColor}`}>{valAway}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}



function H2HPage() {
  const { data: leagues = [], isLoading } = useMyH2HLeagues();
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overall' | 'fixtures'>('overall');
  const [fixtureFilter, setFixtureFilter] = useState<'mine' | 'all'>('mine');
  const [selectedGw, setSelectedGw] = useState<number | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<H2HFixture | null>(null);

  const handleFixtureClick = (fixture: H2HFixture, isFinished: boolean, isLive: boolean) => {
    if (!isFinished && !isLive) return;
    setSelectedFixture(fixture);
  };

  // Auto-select the first league if none selected
  const selectedLeague = leagues.find((l: H2HLeague) => l._id === selectedLeagueId) || leagues[0];
  if (selectedLeague && !selectedLeagueId) {
    setSelectedLeagueId(selectedLeague._id);
  }

  const { data: standingsData, isLoading: standingsLoading } = useH2HStandings(selectedLeagueId ?? '');
  const { data: fixturesData, isLoading: fixturesLoading } = useH2HLeagueFixtures(selectedLeagueId ?? '');
  const { data: managerDetails } = useManagerDetails();

  const isSpectator = !managerDetails;

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
    
    // Filter by user's team (spectators see all matchups)
    const effectiveFilter = isSpectator ? 'all' : fixtureFilter;
    if (effectiveFilter === 'mine') {
      list = list.filter((f: H2HFixture) => 
        isMyTeam(f.homeTeam, managerDetails) || isMyTeam(f.awayTeam, managerDetails)
      );
    }
    
    return list;
  }, [fixturesData, selectedGw, fixtureFilter, isSpectator, managerDetails]);

  return (
    <div className="flex flex-col flex-1 bg-background text-text-primary overflow-hidden font-outfit">
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-none flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2.5">
            <Swords className="w-6 h-6 text-violet-400" />
            Head to Head
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Challenge other managers in your H2H league.</p>
          {isSpectator && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mt-2 px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary">
              <Eye className="w-3.5 h-3.5" />
              Spectator Mode
            </span>
          )}
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
          <p className="text-lg text-text-primary font-semibold">No H2H League</p>
          <p className="text-sm text-text-muted mt-2 max-w-xs mx-auto">
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
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                >
                  {leagues.map((l: H2HLeague) => (
                    <option key={l._id} value={l._id} className="bg-card text-text-primary">
                      {l.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mx-4 mt-2 mb-3 flex border-b border-[var(--color-border-divider)] shrink-0">
            <button
              onClick={() => setActiveTab("overall")}
              className={`flex-1 pb-2 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative cursor-pointer
                ${activeTab === "overall" ? "text-secondary" : "text-text-muted hover:text-text-primary"}`}
            >
              Standings Table
              {activeTab === "overall" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("fixtures")}
              className={`flex-1 pb-2 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative cursor-pointer
                ${activeTab === "fixtures" ? "text-secondary" : "text-text-muted hover:text-text-primary"}`}
            >
              Fixtures & Results
              {activeTab === "fixtures" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
              )}
            </button>
          </div>

          {/* Summary / Info Bar */}
          {selectedLeague && (
            <div className="mx-4 px-4 py-2.5 rounded-xl bg-card border border-border flex items-center justify-between mb-3 text-[11px] text-text-muted flex-none">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                GW {selectedLeague.gameweekStart} – {selectedLeague.gameweekEnd}
              </span>
              <span className="font-semibold text-text-primary uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-secondary/15 border border-secondary/30">
                {selectedLeague.name}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-secondary" />
                {selectedLeague.fantasyTeams?.length || 0} teams
              </span>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col px-4">
            
            {/* Headers for standings tab */}
            {activeTab === 'overall' && !standingsLoading && standingsData?.standings && (
              <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 pb-2 flex-none">
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
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-[calc(5.25rem+env(safe-area-inset-bottom))] space-y-2.5">
              {activeTab === 'overall' ? (
                standingsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-surface border border-border rounded-2xl animate-pulse"
                    />
                  ))
                ) : standingsData?.standings && standingsData.standings.length > 0 ? (
                  standingsData.standings.map((team: H2HStanding, idx: number) => {
                    const isMe = isMyTeam(team, managerDetails);
                    const crest = getTeamIcon(team.teamName, idx);
                    const diff = team.gf - team.ga;

                    return (
                      <div
                        key={team.teamId}
                        className={`flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 ${
                          isMe
                            ? 'bg-secondary/15 border border-secondary/40 shadow-sm'
                            : 'bg-surface border border-border hover:bg-elevated/50'
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-8 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-text-primary">{idx + 1}</span>
                        </div>

                        {/* Avatar */}
                        <div className="relative pl-1 flex-shrink-0">
                          {idx === 0 && (
                            <Crown className="w-3.5 h-3.5 text-yellow-400 absolute -top-2.5 left-3 rotate-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10 animate-pulse" />
                          )}
                          {team.logo ? (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-border bg-background">
                              <img src={team.logo} alt={`${team.teamName} logo`} className="w-7 h-7 object-contain" />
                            </div>
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${crest.bg}`}>
                              {crest.emoji}
                            </div>
                          )}
                        </div>

                        {/* Team Name */}
                        <div className="flex-1 pl-2.5 min-w-0">
                          <p className="text-[12px] font-bold text-text-primary leading-snug truncate">{team.teamName}</p>
                        </div>

                        {/* Stats */}
                        <div className="w-6 text-center text-xs text-text-secondary font-medium flex-shrink-0">
                          {team.played}
                        </div>
                        <div className="w-6 text-center text-xs text-text-muted font-medium flex-shrink-0">
                          {team.won}
                        </div>
                        <div className="w-6 text-center text-xs text-text-muted font-medium flex-shrink-0">
                          {team.drawn}
                        </div>
                        <div className="w-6 text-center text-xs text-text-muted font-medium flex-shrink-0">
                          {team.lost}
                        </div>
                        <div className="w-12 text-center text-xs text-text-secondary font-medium hidden md:block flex-shrink-0">
                          {team.gf}
                        </div>
                        <div className="w-12 text-center text-xs text-text-muted font-medium hidden md:block flex-shrink-0">
                          {team.ga}
                        </div>

                        {/* Diff */}
                        <div className={`w-8 text-center text-xs font-semibold flex-shrink-0 ${
                          diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-text-muted'
                        }`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </div>

                        {/* Points */}
                        <div className="w-12 text-right pr-2 font-black text-[12px] text-secondary flex-shrink-0">
                          {team.pts}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-text-muted text-sm">
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
                        {!isSpectator && (
                          <button
                            onClick={() => setFixtureFilter('mine')}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              fixtureFilter === 'mine'
                                ? 'bg-secondary/20 text-secondary border border-secondary/30'
                                : 'bg-surface text-text-muted border border-border hover:text-text-primary'
                            }`}
                          >
                            Your Matchups
                          </button>
                        )}
                        <button
                          onClick={() => setFixtureFilter('all')}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isSpectator || fixtureFilter === 'all'
                              ? 'bg-secondary/20 text-secondary border border-secondary/30'
                              : 'bg-surface text-text-muted border border-border hover:text-text-primary'
                          }`}
                        >
                          All Matchups
                        </button>
                      </div>

                      {uniqueGameweeks.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-text-muted font-bold uppercase">GW:</span>
                          <select
                            value={selectedGw ?? ''}
                            onChange={(e) => setSelectedGw(e.target.value ? Number(e.target.value) : null)}
                            className="px-2 py-1 bg-card border border-border rounded-lg text-xs font-semibold text-text-primary focus:outline-none focus:border-secondary cursor-pointer"
                          >
                            {uniqueGameweeks.map((gw) => (
                              <option key={gw} value={gw} className="bg-card text-text-primary">
                                GW {gw}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Fixtures List */}
                    {filteredFixtures.length === 0 ? (
                      <div className="text-center py-12 text-text-muted">
                        <p className="text-sm font-medium">No matchups found</p>
                        <p className="text-xs mt-1">Select another gameweek or filter option.</p>
                      </div>
                    ) : (
                      filteredFixtures.map((fixture: H2HFixture) => {
                        const isHomeMe = isMyTeam(fixture.homeTeam, managerDetails);
                        const isAwayMe = isMyTeam(fixture.awayTeam, managerDetails);
                        const isRelevant = isHomeMe || isAwayMe;
                        const isFinished = fixture.status === 'completed';
                        const isLive = fixture.status === 'live';

                        return (
                          <div
                            key={fixture._id}
                            onClick={() => handleFixtureClick(fixture, isFinished, isLive)}
                            className={`rounded-2xl transition-all duration-200 p-4 ${
                              isFinished || isLive ? 'cursor-pointer font-medium' : 'cursor-default'
                            } ${
                              isRelevant
                                ? 'bg-secondary/10 border border-secondary/30 shadow-card hover:bg-secondary/15'
                                : 'bg-surface border border-border hover:bg-elevated/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              {/* Home Team */}
                              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                                {fixture.homeTeam?.logo ? (
                                  <img src={fixture.homeTeam.logo} alt={`${fixture.homeTeam?.name} logo`} className="w-7 h-7 object-contain shrink-0" />
                                ) : null}
                                <span className={`text-sm font-extrabold truncate leading-tight ${
                                  isFinished && fixture.winner === fixture.homeTeam?._id ? 'text-emerald-400' : 'text-text-primary'
                                }`}>
                                  {fixture.homeTeam?.name || 'TBD'}
                                </span>
                              </div>

                              {/* Score/Center Area */}
                              <div className="px-4 flex flex-col items-center justify-center shrink-0 min-w-[95px]">
                                {isFinished || isLive ? (
                                  <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-2.5 py-0.5 shadow-inner">
                                    <span className={`text-sm font-black font-mono ${isFinished && fixture.winner === fixture.homeTeam?._id ? 'text-emerald-400' : 'text-text-primary'}`}>
                                      {fixture.homeScore ?? 0}
                                    </span>
                                    <span className="text-[10px] font-black text-text-muted font-mono">―</span>
                                    <span className={`text-sm font-black font-mono ${isFinished && fixture.winner === fixture.awayTeam?._id ? 'text-emerald-400' : 'text-text-primary'}`}>
                                      {fixture.awayScore ?? 0}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[9px] font-black text-secondary bg-secondary/15 border border-secondary/30 px-2.5 py-0.5 rounded-md font-mono">VS</span>
                                )}
                                <span className={`text-[8px] font-bold mt-1 uppercase tracking-wider font-mono ${isLive ? 'text-emerald-400 animate-pulse' : 'text-text-muted'}`}>
                                  {isLive ? "LIVE" : isFinished ? "FT" : `GW ${fixture.gameweek}`}
                                </span>
                              </div>

                              {/* Away Team */}
                              <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
                                <span className={`text-sm font-extrabold truncate leading-tight text-right ${
                                  isFinished && fixture.winner === fixture.awayTeam?._id ? 'text-emerald-400' : 'text-text-primary'
                                }`}>
                                  {fixture.awayTeam?.name || 'TBD'}
                                </span>
                                {fixture.awayTeam?.logo ? (
                                  <img src={fixture.awayTeam.logo} alt={`${fixture.awayTeam?.name} logo`} className="w-7 h-7 object-contain shrink-0" />
                                ) : null}
                              </div>
                            </div>

                            {/* Label and Click Instructions */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                              {isRelevant ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                                  <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">Your Matchup</span>
                                </div>
                              ) : (
                                <div />
                              )}
                              {(isFinished || isLive) && (
                                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-secondary uppercase tracking-wider">
                                  <Eye className="w-3 h-3" />
                                  Click to view details
                                </span>
                              )}
                            </div>
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

          {/* Fixture details modal */}
          <H2HFixtureModal
            fixture={selectedFixture}
            isOpen={!!selectedFixture}
            onClose={() => setSelectedFixture(null)}
          />
        </>
      )}
    </div>
  );
}