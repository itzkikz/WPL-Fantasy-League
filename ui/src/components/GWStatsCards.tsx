interface GWStatsCardsProps {
  avg?: number;
  totalGWScore?: number;
  highest?: number;
}

const GWStatsCards = ({ avg, totalGWScore, highest }: GWStatsCardsProps) => {
  return (
    <div className="flex-none px-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between max-w-md mx-auto gap-1">
        <div className="text-center">
          <p className="text-lg font-bold">{avg}</p>
          <p className="text-sm mt-1">Average</p>
        </div>

        <div className="relative">
          <div className="text-center bg-linear-to-br from-light-primary to-light-primary rounded-2xl px-4 py-4 shadow-lg">
            <p className="text-2xl font-bold">{totalGWScore}</p>
            <p className="text-sm mt-1">Total Pts</p>
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
