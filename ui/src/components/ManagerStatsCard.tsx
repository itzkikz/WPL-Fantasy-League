import Button from "./common/Button";
import Dollar from "./icons/Dollar";
import { Group } from "./icons/Group";
import AngleRight from "./icons/AngleRight";
import { ArrowRight } from "./icons/ArrowRight";

interface ManagerStatsCardProps {
  navigateToPickTeam: () => void;
  navigateToTeamPoints: () => void;
}

const ManagerStatsCard = ({ navigateToPickTeam, navigateToTeamPoints }: ManagerStatsCardProps) => {
  return (
    <>
      {/* Header Card with Gradient */}
      <div className="bg-gradient-to-br from-cyan-400 rounded-3xl via-blue-500 to-purple-600 p-6 text-white relative">
        {/* User Info */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">vadakens</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">Manager</span>
              <img
                src="https://flagcdn.com/w20/in.png"
                alt="India flag"
                className="w-5 h-3"
              />
            </div>
          </div>
          <Button onClick={navigateToTeamPoints} icon={<ArrowRight height={6} width={6} />} />
          {/* <button className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
            <ArrowRight height={6} width={6} />
          </button> */}
        </div>

        {/* Stats Section */}
        <div className="mb-6">
          <p className="text-sm text-center mb-3 opacity-90">Gameweek 9</p>
          <div className="flex items-end justify-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold">46</p>
              <p className="text-xs mt-1 opacity-80">Average</p>
            </div>
            <div className="text-center">
              <p className="text-6xl font-bold">35</p>
              <p className="text-sm mt-1 flex items-center justify-center gap-1">
                Points
                <AngleRight height="4" width="4" />
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">124</p>
              <p className="text-xs mt-1 flex items-center justify-center gap-1 opacity-80">
                Highest
                <AngleRight height="3" width="3" />
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigateToPickTeam()}
            width="w-1/2"
            type="Primary"
            icon={<Group />}
            children={<span className="font-semibold">Pick Team</span>}
          />

          <Button
            width="w-1/2"
            type="Primary"
            icon={<Dollar height={5} width={5} />}
            children={<span className="font-semibold">Transfers</span>}
          />
          {/* <button disabled={true} className="flex-1 bg-purple-900/40 hover:bg-purple-900/50 backdrop-blur-sm rounded-full py-3 px-4 flex items-center justify-center gap-2 transition-colors">
            
            
          </button> */}
        </div>
      </div>
    </>
  );
};

export default ManagerStatsCard;
