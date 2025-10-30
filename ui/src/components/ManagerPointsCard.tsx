import StatRow from "./StatRow";

const ManagerPointsCards = () => {
  return (
    <>
      {/* Points & Rankings Section */}
      <div className="p-6 border-b border-[#ebe5eb] dark:border-[#541e5d]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Points & Rankings</h2>
        </div>

        <div className="space-y-3">
          <StatRow label="Overall points" value={35} border={false} />
          <StatRow label="Overall points" value={35} border={false} />
          <StatRow label="Overall rank" value={35} border={false} />
          <StatRow label="Total players" value={"12,322,756"} border={false} />
          <StatRow label="Gameweek points" value={35} border={false} />
        </div>
      </div>
    </>
  );
};

export default ManagerPointsCards;
