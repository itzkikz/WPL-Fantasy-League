interface GWStatsCardsProps {
  avg?: number;
  totalGWScore?: number;
  highest?: number;
}

const GWStatsCards = ({ avg, totalGWScore, highest }: GWStatsCardsProps) => {
  return (
    <div className="flex-none px-4 py-1.5">
      <div className="flex items-center justify-between max-w-md mx-auto gap-2 bg-white dark:bg-white/5 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-white/10">
        
        {/* Average */}
        <div className="flex-1 text-center py-1 px-1">
          <p className="text-base font-bold text-gray-800 dark:text-gray-100">{avg}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">Average</p>
        </div>

        {/* Total Points (Highlighted) */}
        <div className="flex-1 text-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl py-2 px-1 shadow-md shadow-indigo-500/25 transform -translate-y-1">
          <p className="text-xl font-black text-white leading-none">{totalGWScore}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/90 mt-0.5">Total Pts</p>
        </div>

        {/* Highest */}
        <div className="flex-1 text-center py-1 px-1">
          <p className="text-base font-bold text-gray-800 dark:text-gray-100">{highest}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">Highest</p>
        </div>

      </div>
    </div>
  );
};
export default GWStatsCards;
