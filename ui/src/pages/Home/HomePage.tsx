import { useNavigate } from "@tanstack/react-router";
import { useHomePage, useMyFixtures } from "../../features/home/hooks";
import TeamOverview from "../../components/home/TeamOverview";
import LeagueStatistics from "../../components/home/LeagueStatistics";
import GameweekProgress from "../../components/home/GameweekProgress";
import UpcomingFixture from "../../components/home/UpcomingFixture";
import PlayerSpotlight from "../../components/home/PlayerSpotlight";
import PointsBreakdown from "../../components/home/PointsBreakdown";
import RecentGameweeks from "../../components/home/RecentGameweeks";
import { Crown, Target, Activity, ShieldCheck, Square, Users, Clock, Star, Shield } from "lucide-react";
import PlayerListCard from "../../components/home/PlayerListCard";
import SeasonStats from "../../components/home/SeasonStats";
import LeagueStandings from "../../components/home/LeagueStandings";
import TeamFormation from "../../components/home/TeamFormation";
import SquadValue from "../../components/home/SquadValue";
import YourPlayersCard from "../../components/home/YourPlayersCard";
import QuickActionsRow from "../../components/home/QuickActions";
import FantasyNews from "../../components/home/FantasyNews";

const HomePage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useHomePage();
  const { data: myFixturesData } = useMyFixtures();

  if (isLoading) {
    return (
      <div data-theme="dark" className="min-h-screen bg-background px-3 py-4 space-y-3 lg:px-0 lg:py-0">
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
      <div data-theme="dark" className="min-h-screen bg-background flex items-center justify-center px-4">
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
      <div data-theme="dark" className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text font-semibold mb-1">No Data Available</p>
          <p className="text-text-secondary text-sm">Your dashboard will appear here once data is ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-text">
      <div className="mx-auto w-full px-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-3 lg:max-w-none lg:px-0 lg:pb-0 lg:pt-0">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-5">
          <div className="col-span-2 lg:col-span-4">
            <TeamOverview
              teamName={data.teamOverview.teamName}
              managers={data.teamOverview.managers}
              overallRank={String(data.teamOverview.rank)}
              rankChange={String(Math.abs(data.teamOverview.rankChange))}
              totalPoints={String(data.teamOverview.totalPoints)}
              gameweekPoints={data.teamOverview.gwPoints}
              onClick={() => navigate({ to: "/my-team" })}
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
            <UpcomingFixture
              fixtures={myFixturesData?.fixtures || []}
              gameweek={myFixturesData?.gameweek || data.upcomingMatch?.gameweek}
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

          <div className="lg:col-span-2">
            <PointsBreakdown
              total={String(data.pointsBreakdown?.totalPoints)}
              segments={(() => {
                const pb = data.pointsBreakdown;
                if (!pb) return [];
                const tp = Math.max(pb.totalPoints || 1, 1);
                const pct = (pts: number) => Math.round((Math.abs(pts) / tp) * 100);
                return [
                  { label: "Goals", value: pb.goals * 5, percent: pct(pb.goals * 5), color: "var(--color-success)" },
                  { label: "Assists", value: pb.assists * 3, percent: pct(pb.assists * 3), color: "var(--color-info)" },
                  { label: "Clean Sheets", value: pb.cleanSheet * 4, percent: pct(pb.cleanSheet * 4), color: "#818cf8" },
                  { label: "Yellow Cards", value: pb.yellowCards * -1, percent: pct(pb.yellowCards * -1), color: "#fbbf24" },
                  { label: "Red Cards", value: pb.redCards * -3, percent: pct(pb.redCards * -3), color: "#f87171" },
                  { label: "Penalty Miss", value: pb.penaltyMissed * -2, percent: pct(pb.penaltyMissed * -2), color: "#fb923c" },
                  { label: "Penalty Save", value: pb.penaltySaved * 5, percent: pct(pb.penaltySaved * 5), color: "#34d399" },
                  { label: "Saves", value: Math.floor((pb.saves || 0) / 3), percent: pct(Math.floor((pb.saves || 0) / 3)), color: "#a78bfa" },
                  { label: "Defensive", value: Math.floor(((pb.tackles || 0) + (pb.clearances || 0) + (pb.blocks || 0) + (pb.recovery || 0)) / 10) * 2, percent: pct(Math.floor(((pb.tackles || 0) + (pb.clearances || 0) + (pb.blocks || 0) + (pb.recovery || 0)) / 10) * 2), color: "#2dd4bf" },
                  { label: "Appearance", value: pb.appearancePoints || 0, percent: pct(pb.appearancePoints || 0), color: "var(--color-warning)" },
                ];
              })()}
            />
          </div>
          <div className="lg:col-span-2">
            <RecentGameweeks
              data={data.recentGameweeks.map(rg => ({ label: `GW${rg.gameweek}`, value: rg.points }))}
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
          <div>
            <SeasonStats
              stats={[
                { icon: Target, label: "Total Points", value: String(data.seasonStats.totalPoints) },
                { icon: Activity, label: "Avg. Points / GW", value: String(data.seasonStats.avgPoints) },
                { icon: ShieldCheck, label: "Highest GW", value: String(data.seasonStats.highestPoints) },
                { icon: Square, label: "Overall Rank", value: String(data.seasonStats.totalRank) },
              ]}
            />
          </div>
          <div>
            <LeagueStandings
              standings={data.leagueStandings}
              myTeam={data.teamOverview.teamName}
              limit={3}
              onViewFull={() => navigate({ to: "/standings" })}
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
          <div className="col-span-1 lg:col-span-2">
            <SquadValue
              totalValue={`£${(data.squadInfo.teamValue + data.squadInfo.bank).toFixed(1)}M`}
              bank={`£${data.squadInfo.bank.toFixed(1)}M`}
              teamValue={`£${data.squadInfo.teamValue.toFixed(1)}M`}
            />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <YourPlayersCard
              selected={data.squadComposition.total}
              total={15}
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

