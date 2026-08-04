import { useNavigate } from "@tanstack/react-router";
import { useHomePage, useMyFixtures } from "../../features/home/hooks";
import TeamOverview from "../../components/home/TeamOverview";
import LeagueStatistics from "../../components/home/LeagueStatistics";
import GameweekProgress from "../../components/home/GameweekProgress";
import UpcomingFixture from "../../components/home/UpcomingFixture";
import PlayerSpotlight from "../../components/home/PlayerSpotlight";
import PointsBreakdown from "../../components/home/PointsBreakdown";
import RecentGameweeks from "../../components/home/RecentGameweeks";
import { Crown, Target, Activity, ShieldCheck, Square, Users, Clock, Star, Shield, Trophy, ArrowRight, Sparkles, Goal } from "lucide-react";
import PlayerListCard from "../../components/home/PlayerListCard";
import SeasonStats from "../../components/home/SeasonStats";
import LeagueStandings from "../../components/home/LeagueStandings";
import TeamFormation from "../../components/home/TeamFormation";
import SquadValue from "../../components/home/SquadValue";
import YourPlayersCard from "../../components/home/YourPlayersCard";
import QuickActionsRow from "../../components/home/QuickActions";
import FantasyNews from "../../components/home/FantasyNews";
import { useUserStore } from "../../store/useUserStore";

const HomePage = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const isRegularUser = user?.role === "user";

  // Disable dashboard & my-fixtures API queries if role is "user"
  const { data, isLoading, error } = useHomePage({ enabled: !isRegularUser });
  const { data: myFixturesData } = useMyFixtures({ enabled: !isRegularUser });

  // Dedicated view for regular user role (non-manager account)
  if (isRegularUser) {
    return (
      <div className="min-h-screen bg-background text-text-primary p-3 lg:p-6 font-outfit">
        <div className="max-w-4xl mx-auto space-y-6 pt-2">
          {/* Spectator Banner */}
          <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-purple-300" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-[11px] font-semibold text-purple-300">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Fan / Spectator Account</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
                  You are not managing a fantasy team yet
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Once the League Administrator assigns you to a fantasy squad, you'll be able to manage your roster, select captains, make transfers, and track your live manager points! In the meantime, feel free to explore overall league standings and player statistics below.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate({ to: "/standings" })}
              className="group p-6 rounded-2xl bg-surface border border-border hover:border-purple-500/40 transition-all text-left flex flex-col justify-between h-40 shadow-md hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary mb-1">League Standings</h3>
                <p className="text-xs text-text-secondary">View live leaderboards, manager points, and team rankings.</p>
              </div>
            </button>

            <button
              onClick={() => navigate({ to: "/stats" })}
              className="group p-6 rounded-2xl bg-surface border border-border hover:border-purple-500/40 transition-all text-left flex flex-col justify-between h-40 shadow-md hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Activity className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary mb-1">Player & League Stats</h3>
                <p className="text-xs text-text-secondary">Explore player form, goals, assists, and match statistics.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-3 py-4 space-y-3 lg:px-0 lg:py-0">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`h-28 bg-surface rounded-[10px] skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Failed to load homepage data</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold active:opacity-70 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-primary font-semibold mb-1">No Data Available</p>
          <p className="text-text-secondary text-sm">Your dashboard will appear here once data is ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto w-full px-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-3 lg:max-w-none lg:px-0 lg:pb-0 lg:pt-0">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-5">
          <div className="col-span-2 lg:col-span-4">
            <TeamOverview
              teamName={data.teamOverview.teamName}
              logo={data.teamOverview.logo}
              managers={data.teamOverview.managers}
              overallRank={String(data.teamOverview.rank)}
              rankChange={String(Math.abs(data.teamOverview.rankChange))}
              totalPoints={String(data.teamOverview.totalPoints)}
              gameweekPoints={data.teamOverview.gwPoints}
              onClick={() => navigate({ to: "/my-team" })}
            />
          </div>

          <div className="col-span-2 lg:col-span-4">
            <UpcomingFixture
              fixtures={myFixturesData?.fixtures || []}
              gameweek={myFixturesData?.gameweek || data.upcomingMatch?.gameweek}
            />
          </div>

          <div className="lg:col-span-2">
            <LeagueStatistics
              stats={[
                { icon: Users, label: "Total Managers", value: String(data.leagueStats.totalManagers), iconColor: "text-text", circleClass: "border border-white/10 bg-white/5" },
                { icon: Clock, label: "GW Average", value: String(data.leagueStats.avgPointsPerGW), iconColor: "text-indigo-400", circleClass: "border border-indigo-500/30 bg-indigo-500/5" },
                { icon: Star, label: "Highest Points", value: String(data.leagueStats.highestGW), iconColor: "text-pink-400", circleClass: "border border-pink-500/30 bg-pink-500/5" },
                { icon: Shield, label: "Total Teams", value: String(data.leagueStats.totalTeams), iconColor: "text-rose-400", circleClass: "border border-rose-500/30 bg-rose-500/5" },
              ]}
            />
          </div>
          <div className="lg:col-span-2">
            <GameweekProgress
              gameweek={data.teamOverview.gameweek}
              deadlineLabel={data.gameweekProgress.deadline}
              startDate={data.gameweekProgress.startDate}
              endDate={data.gameweekProgress.endDate}
              badge={<Crown className="w-8 h-8 text-white/20" />}
            />
          </div>
          <div className="lg:col-span-2">
            <LeagueStandings
              standings={data.leagueStandings}
              myTeam={data.teamOverview.teamName}
            />
          </div>
          <div className="lg:col-span-2">
            <PlayerSpotlight
              photo={data.playerSpotlight?.player?.photo}
              name={data.playerSpotlight?.player?.name}
              club={data.playerSpotlight?.player?.fullTeamName}
              position={data.playerSpotlight?.player?.position}
              formHistory={data.playerSpotlight?.formHistory || []}
              points={data.playerSpotlight?.gameweekPoints}
              stats={data.playerSpotlight?.stats}
            />
          </div>
          <div>
            <PlayerListCard
              title="Top Players"
              subtitle="This Gameweek"
              players={data.topPlayers.map(p => ({
                name: p.name,
                meta: p.team,
                position: p.position,
                value: `${p.points} pts`,
                photo: p.photo
              }))}
            />
          </div>
          <div>
            <PlayerListCard
              title="Best Performers"
              subtitle="This Season"
              players={data.bestPerformers.map(p => ({
                name: p.name,
                meta: p.team,
                position: p.position,
                value: `${p.points} pts`,
                photo: p.photo
              }))}
            />
          </div>
          <div >
            <RecentGameweeks
              data={data.recentGameweeks.map(rg => ({ label: `GW${rg.gameweek}`, value: rg.points }))}
            />
          </div>
          <div>
             <PointsBreakdown
              total={String(data.pointsBreakdown?.totalPoints)}
              segments={(() => {
                const pb = data.pointsBreakdown;
                if (!pb) return [];
                const tp = Math.max(pb.totalPoints || 1, 1);
                const pct = (pts: number) => Math.round((Math.abs(pts) / tp) * 100);
                return [
                  { label: "Goals", value: pb.goals, percent: pct(pb.goals), color: "var(--color-success)" },
                  { label: "Assists", value: pb.assists, percent: pct(pb.assists), color: "var(--color-info)" },
                  { label: "Clean Sheets", value: pb.cleanSheet, percent: pct(pb.cleanSheet), color: "#818cf8" },
                  { label: "Appearance", value: pb.appearancePoints, percent: pct(pb.appearancePoints), color: "var(--color-warning)" },
                  { label: "Defensive", value: pb.defensive, percent: pct(pb.defensive), color: "#2dd4bf" },
                  { label: "Penalty Save", value: pb.penaltySaved, percent: pct(pb.penaltySaved), color: "#34d399" },
                  { label: "Saves", value: pb.saves, percent: pct(pb.saves), color: "#a78bfa" },
                  { label: "Yellow Cards", value: pb.yellowCards, percent: pct(pb.yellowCards), color: "#fbbf24" },
                  { label: "Red Cards", value: pb.redCards, percent: pct(pb.redCards), color: "#f87171" },
                  { label: "Penalty Miss", value: pb.penaltyMissed, percent: pct(pb.penaltyMissed), color: "#fb923c" },
                ].filter(s => s.value !== 0);
              })()}
            />
          </div>
          <div className="col-span-2 lg:col-span-4">
            <SeasonStats
              stats={[
                { icon: Target, label: "Total Points", value: `${data.seasonStats.totalPoints} pts`, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
                { icon: Activity, label: "Avg / GW", value: `${data.seasonStats.avgPoints} pts`, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10 border-indigo-500/20" },
                { icon: ShieldCheck, label: "Highest GW", value: `${data.seasonStats.highestPoints} pts`, colorClass: "text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/20" },
                { icon: Trophy, label: "Overall Rank", value: `#${data.seasonStats.totalRank}`, colorClass: "text-purple-400", bgClass: "bg-purple-500/10 border-purple-500/20" },
                { icon: Goal, label: "Goals Scored", value: `${data.seasonStats.totalGoals ?? 0}`, colorClass: "text-rose-400", bgClass: "bg-rose-500/10 border-rose-500/20" },
                { icon: Shield, label: "Clean Sheets", value: `${data.seasonStats.cleanSheets ?? 0}`, colorClass: "text-teal-400", bgClass: "bg-teal-500/10 border-teal-500/20" },
              ]}
            />
          </div>
          

          <div className="col-span-2 lg:col-span-4">
            <TeamFormation
              formation={data.squadComposition.formation || "4-4-2"}
              squad={{
                goalkeepers: 1,
                defenders: data.squadComposition.defenders,
                midfielders: data.squadComposition.midfielders,
                forwards: data.squadComposition.forwards,
              }}
            />
          </div>
          <div className="col-span-2 sm:col-span-1 lg:col-span-2">
            <SquadValue
              totalValue={`£${(data.squadInfo.totalValue ?? (data.squadInfo.teamValue + data.squadInfo.bank)).toFixed(1)}M`}
              bank={`£${data.squadInfo.bank.toFixed(1)}M`}
              teamValue={`£${data.squadInfo.teamValue.toFixed(1)}M`}
              totalBudget={data.squadInfo.totalBudget}
              utilisation={data.squadInfo.utilisation}
              bonus={data.squadInfo.bonus}
              fine={data.squadInfo.fine}
            />
          </div>
          <div className="col-span-2 sm:col-span-1 lg:col-span-2">
            <YourPlayersCard
              selected={data.squadComposition.total}
              total={15}
              yourPlayers={data.yourPlayers}
              onCta={() => navigate({ to: "/my-team" })}
            />
          </div>

          {/* <div className="col-span-2 lg:col-span-4">
            <QuickActionsRow />
          </div> */}
          <div className="col-span-2 lg:col-span-4">
            <FantasyNews />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
