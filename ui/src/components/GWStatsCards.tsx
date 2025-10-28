interface GWStatsCardsProps {
  avg?: number;
  totalGWScore?: number;
  highest?: number;
}

const GWStatsCards = ({ avg, totalGWScore, highest }: GWStatsCardsProps) => {
  return (
    <div className="flex-none px-16">
      <div className="flex items-center justify-between max-w-md mx-auto gap-1">
        <div className="text-center">
          <p className="text-lg font-bold">{avg}</p>
          <p className="text-sm mt-1">Average</p>
        </div>

        <div className="relative">
          <div className="text-center bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl px-4 py-4 shadow-lg">
            <p className="text-2xl font-bold text-white dark:text-[#1e0021]">{totalGWScore}</p>
            <p className="text-sm text-white dark:text-[#1e0021] mt-1">Total Pts</p>
          </div>
        </div>

        <button className="text-center group">
          <p className="text-lg font-bold">{highest}</p>
          <p className="text-sm mt-1 flex items-center gap-1">
            Highest
          </p>
        </button>
      </div>
    </div>
  );
};
export default GWStatsCards;
