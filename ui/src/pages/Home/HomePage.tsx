import { useNavigate } from "@tanstack/react-router";
import { useHomePage } from "../../features/home/hooks";
import { ViewTransitions } from "../../types/viewTransitions";
import TeamOverviewCard from "../../components/home/TeamOverviewCard";
import GameweekProgress from "../../components/home/GameweekProgress";
import UpcomingMatch from "../../components/home/UpcomingMatch";
import LeagueStatsRow from "../../components/home/LeagueStatsRow";
import MiniLeagueStandings from "../../components/home/MiniLeagueStandings";
import RecentGameweeks from "../../components/home/RecentGameweeks";
import TopPlayersList from "../../components/home/TopPlayersList";
import PlayerSpotlight from "../../components/home/PlayerSpotlight";
import PointsBreakdown from "../../components/home/PointsBreakdown";
import SeasonStats from "../../components/home/SeasonStats";
import BestPerformers from "../../components/home/BestPerformers";
import FixtureDifficulty from "../../components/home/FixtureDifficulty";
import SquadValue from "../../components/home/SquadValue";
import SquadComposition from "../../components/home/SquadComposition";
import YourPlayers from "../../components/home/YourPlayers";
import MiniLeague from "../../components/home/MiniLeague";
import InviteEarn from "../../components/home/InviteEarn";

const HomePage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useHomePage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg px-4 py-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`h-32 bg-surface rounded-2xl skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Failed to load homepage data</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-bg px-4 py-2 rounded-full text-sm font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleTeamClick = () => {
    navigate({ to: "/manager" });
  };

  return (
    <div className="min-h-screen bg-bg animate-in fade-in duration-500 overflow-hidden">
      <div className="px-4 py-6 space-y-4 pb-24 lg:pb-6">
        {/* Team Overview */}
        <TeamOverviewCard data={data.teamOverview} onClick={handleTeamClick} />

        {/* Gameweek Progress */}
        <GameweekProgress data={data.gameweekProgress} />

        {/* Upcoming Match */}
        <UpcomingMatch data={data.upcomingMatch} />

        {/* League Stats Row (Horizontal Scroll) */}
        <LeagueStatsRow data={data.leagueStats} />

        {/* League Standings Mini Table */}
        <MiniLeagueStandings
          standings={data.leagueStandings}
          onViewAll={() => navigate({ to: "/standings" })}
        />

        {/* Recent Gameweeks Chart */}
        <RecentGameweeks gameweeks={data.recentGameweeks} />

        {/* Top Players This Gameweek */}
        <TopPlayersList
          players={data.topPlayers}
          onViewAll={() => navigate({ to: "/stats" })}
        />

        {/* Player Spotlight */}
        <PlayerSpotlight data={data.playerSpotlight} />

        {/* Points Breakdown */}
        <PointsBreakdown data={data.pointsBreakdown} />

        {/* Season Stats with Chart */}
        <SeasonStats
          data={data.seasonStats}
          gameweeks={data.recentGameweeks}
          onViewAll={() => navigate({ to: "/stats" })}
        />

        {/* Best Performers Season */}
        <BestPerformers
          performers={data.bestPerformers}
          onViewAll={() => navigate({ to: "/stats" })}
        />

        {/* Fixture Difficulty */}
        <FixtureDifficulty fixtures={data.fixtureDifficulty} />

        {/* Squad Value */}
        <SquadValue data={data.squadInfo} />

        {/* Squad Composition */}
        <SquadComposition
          data={data.squadComposition}
          onViewMore={() => navigate({ to: "/manager" })}
        />

        {/* Your Players */}
        <YourPlayers
          goalkeepers={data.yourPlayers.goalkeepers}
          defenders={data.yourPlayers.defenders}
          midfielders={data.yourPlayers.midfielders}
          forwards={data.yourPlayers.forwards}
          onViewAll={() => navigate({ to: "/manager" })}
        />

        {/* Mini League */}
        <MiniLeague
          standings={data.miniLeague}
          onViewAll={() => navigate({ to: "/standings" })}
        />

        {/* Invite & Earn */}
        <InviteEarn />
      </div>
    </div>
  );
};

export default HomePage;
