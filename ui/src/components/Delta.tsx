import { Standings } from "../features/standings/types";
import AngleDown from "./icons/AngleDown";
import AngleUp from "./icons/AngleUp";
import Neutral from "./icons/Neutral";

const Delta = ({ d }: { d: Standings["pos_change"] }) => {
  if (d > 0)
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-light-secondary dark:bg-dark-secondary">
        <AngleUp height="3" width="3" />
      </div>
    );
  if (d < 0)
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-light-accent dark:bg-dark-accent">
        <AngleDown height="3" width="3" />
      </div>
    );
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-light-primary dark:bg-dark-primary">
      <Neutral />
    </div>
  );
};

export default Delta;
