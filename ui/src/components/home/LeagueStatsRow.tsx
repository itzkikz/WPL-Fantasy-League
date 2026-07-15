import { LeagueStats as LeagueStatsType } from "../../features/home/types";

interface LeagueStatsRowProps {
  data: LeagueStatsType;
}

const LeagueStatsRow = ({ data }: LeagueStatsRowProps) => {
  const stats = [
    { label: "Total Points", value: data.totalPoints.toLocaleString() },
    { label: "Overall Rank", value: data.overallRank.toLocaleString() },
    { label: "Avg. Pts/GW", value: data.avgPointsPerGW.toFixed(1) },
    { label: "Highest GW", value: data.highestGW },
    { label: "Team Value", value: `£${data.teamValue}m` },
  ];

  return (
    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex-none bg-dark-surface rounded-xl p-3 shadow-lg min-w-[100px]"
        >
          <p className="text-[10px] text-text-secondary mb-1">{stat.label}</p>
          <p className="text-sm font-bold text-text-primary">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default LeagueStatsRow;
