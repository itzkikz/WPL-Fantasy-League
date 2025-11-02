import { Standings } from "../features/standings/types";
import AngleDown from "./icons/AngleDown";
import AngleUp from "./icons/AngleUp";
import Neutral from "./icons/Neutral";

const Delta = ({ d }: { d: Standings["pos_change"] }) => {
  if (d > 0)
    return (
      <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2fa550] text-white">
        <AngleUp height="3" width="3" />
      </div>
    );
  if (d < 0)
    return (
      <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ed0628] text-white">
        <AngleDown height="3" width="3" />
      </div>
    );
  return (
    <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#541e5d] text-gray-600">
      <Neutral />
    </div>
  );
};

export default Delta;
