interface GWStatsCardsProps {
  avg?: number;
  totalGWScore?: number;
  highest?: number;
}

const GWStatsCards = ({ avg, totalGWScore, highest }: GWStatsCardsProps) => {
  return (
    <div className="flex-none bg-white px-16">
      <div className="flex items-center justify-between max-w-md mx-auto gap-1">
        <div className="text-center">
          <p className="text-lg font-bold text-[#2a1134]">{avg}</p>
          <p className="text-sm text-gray-600 mt-1">Average</p>
        </div>

        <div className="relative">
          <div className="text-center bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl px-4 py-4 shadow-lg">
            <p className="text-2xl font-bold text-white">{totalGWScore}</p>
            <p className="text-sm text-white mt-1">Total Pts</p>
          </div>
        </div>

        <button className="text-center group">
          <p className="text-lg font-bold text-[#2a1134]">{highest}</p>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            Highest
          </p>
        </button>
      </div>
    </div>
  );
};
export default GWStatsCards;
