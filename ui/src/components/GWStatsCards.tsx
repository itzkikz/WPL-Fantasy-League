interface GWStatsCardsProps {
  avg?: number;
  totalGWScore?: number;
  highest?: number;
}

const GWStatsCards = ({ avg, totalGWScore, highest }: GWStatsCardsProps) => {
  return (
    <div className="flex-none px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto gap-3 bg-white dark:bg-white/5 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-white/10">
        
        {/* Average */}
        <div className="flex-1 text-center py-2 px-1">
          <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">{avg}</p>
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Average</p>
        </div>

        {/* Total Points (Highlighted) */}
        <div className="flex-1 text-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl py-3 px-2 shadow-lg shadow-indigo-500/25 transform -translate-y-2">
          <p className="text-2xl md:text-3xl font-black text-white">{totalGWScore}</p>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/90 mt-1">Total Pts</p>
        </div>

        {/* Highest */}
        <div className="flex-1 text-center py-2 px-1">
          <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">{highest}</p>
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Highest</p>
        </div>

      </div>
    </div>
  );
};
export default GWStatsCards;
