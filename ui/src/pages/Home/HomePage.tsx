import { useNavigate } from "@tanstack/react-router";
import { useHomePage } from "../../features/home/hooks";
import TeamOverview from "../../components/home/TeamOverview";
import LeagueStatistics from "../../components/home/LeagueStatistics";
import GameweekProgress from "../../components/home/GameweekProgress";
import UpcomingFixture from "../../components/home/UpcomingFixture";
import PlayerSpotlight from "../../components/home/PlayerSpotlight";
import PointsBreakdown from "../../components/home/PointsBreakdown";
import RecentGameweeks from "../../components/home/RecentGameweeks";
import { Crown, Target, Activity, ShieldCheck, Square, Users, Clock, Star, Repeat } from "lucide-react";
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

  if (isLoading) {
    return (
      <div data-theme="dark" className="min-h-screen bg-bg px-3 py-4 space-y-3 lg:px-0 lg:py-0">
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
      <div data-theme="dark" className="min-h-screen bg-bg flex items-center justify-center px-4">
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
      <div data-theme="dark" className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-primary font-semibold mb-1">No Data Available</p>
          <p className="text-text-secondary text-sm">Your dashboard will appear here once data is ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="dark" className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto w-full px-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-3 lg:max-w-none lg:px-0 lg:pb-0 lg:pt-0">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-5">
          <div className="col-span-2 lg:col-span-4">
            <TeamOverview
              teamName={data.teamOverview.teamName}
              overallRank={String(data.teamOverview.rank)}
              rankChange={String(Math.abs(data.teamOverview.rankChange))}
              totalPoints={String(data.teamOverview.totalPoints)}
              gameweekPoints={data.teamOverview.gwPoints}
              onClick={() => navigate({ to: "/manager" })}
            />
          </div>

          <div className="lg:col-span-2">
            <LeagueStatistics
              stats={[
                { icon: Users, label: "Total Managers", value: String(data.leagueStandings?.length || 0), iconColor: "text-text-primary", circleClass: "border border-white/10 bg-white/5" },
                { icon: Clock, label: "GW Average", value: String(data.leagueStats.avgPointsPerGW), iconColor: "text-indigo-400", circleClass: "border border-indigo-500/30 bg-indigo-500/5" },
                { icon: Star, label: "Highest Points", value: String(data.leagueStats.highestGW), iconColor: "text-pink-400", circleClass: "border border-pink-500/30 bg-pink-500/5" },
                { icon: Repeat, label: "Transfers Made", value: String(data.teamOverview.transfers), iconColor: "text-rose-400", circleClass: "border border-rose-500/30 bg-rose-500/5" },
              ]}
            />
          </div>
          <div className="lg:col-span-2">
            <GameweekProgress
              gameweek={data.teamOverview.gameweek}
              deadlineLabel={data.gameweekProgress.deadline}
              badge={<Crown className="w-8 h-8 text-white/20" />}
            />
          </div>

          <div className="lg:col-span-2">
            <UpcomingFixture
              gameweek={data.upcomingMatch?.gameweek}
              date={data.upcomingMatch?.kickoffTime.split(", ")[0]}
              time={data.upcomingMatch?.kickoffTime.split(", ")[1] || data.upcomingMatch?.kickoffTime}
              homeTeam={{ code: data.upcomingMatch?.homeTeamShort, bg: "bg-rose-600" }}
              awayTeam={{ code: data.upcomingMatch?.awayTeamShort, bg: "bg-blue-600" }}
            />
          </div>
          <div className="lg:col-span-2">
            <PlayerSpotlight
              photo={data.playerSpotlight?.player.photo}
              name={data.playerSpotlight?.player.name}
              club={data.playerSpotlight?.player.fullTeamName}
              position={data.playerSpotlight?.player.position}
              points={String(data.playerSpotlight?.gameweekPoints)}
              goals={data.playerSpotlight?.stats.goals}
              assists={data.playerSpotlight?.stats.assists}
            />
          </div>

          <div className="lg:col-span-2">
            <PointsBreakdown
              total={String(data.pointsBreakdown?.totalPoints)}
              segments={[
                { label: "Goals", value: data.pointsBreakdown?.goals * 6, percent: data.pointsBreakdown?.totalPoints ? Math.round(((data.pointsBreakdown.goals * 6) / Math.max(data.pointsBreakdown.totalPoints, 1)) * 100) : 0, color: "var(--color-success)" },
                { label: "Assists", value: data.pointsBreakdown?.assists * 3, percent: data.pointsBreakdown?.totalPoints ? Math.round(((data.pointsBreakdown.assists * 3) / Math.max(data.pointsBreakdown.totalPoints, 1)) * 100) : 0, color: "var(--color-info)" },
                { label: "Clean Sheets", value: data.pointsBreakdown?.cleanSheet * 4, percent: data.pointsBreakdown?.totalPoints ? Math.round(((data.pointsBreakdown.cleanSheet * 4) / Math.max(data.pointsBreakdown.totalPoints, 1)) * 100) : 0, color: "var(--color-primary)" },
                { label: "Minutes / Other", value: Math.max(0, data.pointsBreakdown?.totalPoints - (data.pointsBreakdown?.goals * 6 + data.pointsBreakdown?.assists * 3 + data.pointsBreakdown?.cleanSheet * 4)), percent: data.pointsBreakdown?.totalPoints ? Math.max(0, 100 - (Math.round(((data.pointsBreakdown.goals * 6) / Math.max(data.pointsBreakdown.totalPoints, 1)) * 100) + Math.round(((data.pointsBreakdown.assists * 3) / Math.max(data.pointsBreakdown.totalPoints, 1)) * 100) + Math.round(((data.pointsBreakdown.cleanSheet * 4) / Math.max(data.pointsBreakdown.totalPoints, 1)) * 100))) : 0, color: "var(--color-warning)" },
              ]}
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
              onCta={() => navigate({ to: "/manager" })}
            />
          </div>

          <div className="col-span-2 lg:col-span-4">
            <QuickActionsRow />
          </div>

          <div className="col-span-2 lg:col-span-4">
            <FantasyNews />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

