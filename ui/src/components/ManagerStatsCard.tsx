import Button from "./common/Button";
import Dollar from "./icons/Dollar";
import { Group } from "./icons/Group";
import AngleRight from "./icons/AngleRight";
import { ArrowRight } from "./icons/ArrowRight";
import { ManagerDetailsResponse } from "../features/manager/types";

interface ManagerStatsCardProps {
  navigateToPickTeam: () => void;
  navigateToTeamPoints: () => void;
  managerDetails: ManagerDetailsResponse
}

const ManagerStatsCard = ({ navigateToPickTeam, navigateToTeamPoints, managerDetails }: ManagerStatsCardProps) => {
  return (
    <>
      {/* Header Card with Gradient */}
      <div className="bg-gradient-to-br  from-dark-primary rounded-3xl via-dark-primary to-dark-primary p-6 relative text-dark-bg">
        {/* User Info */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{managerDetails?.team}</h1>
            <h1 className="text-sm">Managed By </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{managerDetails?.managers}</span>
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
          <p className="text-sm text-center mb-3 opacity-90">Gameweek {managerDetails?.gw}</p>
          <div className="flex items-end justify-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold">{managerDetails?.avg}</p>
              <p className="text-xs mt-1 opacity-80">Average</p>
            </div>
            <div className="text-center">
              <p className="text-6xl font-bold">{managerDetails?.totalGWScore}</p>
              <p className="text-sm mt-1 flex items-center justify-center gap-1">
                Points
                <AngleRight height="4" width="4" />
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{managerDetails?.highest}</p>
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
            disabled={true}
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
