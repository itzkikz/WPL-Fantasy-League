import { SquadInfo } from "../../features/home/types";

interface SquadValueProps {
  data: SquadInfo;
}

const SquadValue = ({ data }: SquadValueProps) => {
  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Your Squad Value</h3>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-3xl font-black text-primary">£{data.teamValue}m</p>
          <p className="text-xs text-text-secondary mt-1">Team Value</p>
        </div>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">£{data.inBank}m</p>
            <p className="text-[10px] text-text-secondary">In The Bank</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Bank</span>
          <span className="text-sm font-medium text-text-primary">£{data.bank}m</span>
        </div>
      </div>
    </div>
  );
};

export default SquadValue;
