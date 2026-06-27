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
      <div className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-6 sm:p-8">
        
        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

        <div className="relative z-10">
          {/* User Info */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight drop-shadow-sm mb-1">{managerDetails?.team}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-white/90">
                  {Array.isArray(managerDetails?.managers) ? managerDetails.managers.join(', ') : managerDetails?.managers}
                </span>
                <img
                  src="https://flagcdn.com/w20/in.png"
                  alt="India flag"
                  className="w-5 h-3 rounded shadow-sm"
                />
              </div>
            </div>
            <button 
              onClick={navigateToTeamPoints} 
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2.5 transition-all duration-200 active:scale-95 shadow-sm border border-white/10 backdrop-blur-sm"
              aria-label="View Team Points"
            >
              <ArrowRight height={5} width={5} />
            </button>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <div className="inline-block px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
              Gameweek {managerDetails?.gw}
            </div>
            
            <div className="flex items-end justify-between sm:justify-start sm:gap-12">
              <div className="flex flex-col items-start">
                <p className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-1">Average</p>
                <p className="text-3xl sm:text-4xl font-bold">{managerDetails?.avg}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-1">Points</p>
                <p className="text-5xl sm:text-6xl font-black drop-shadow-sm">{managerDetails?.totalGWScore}</p>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-1">Highest</p>
                <p className="text-3xl sm:text-4xl font-bold">{managerDetails?.highest}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => navigateToPickTeam()}
              className="flex-1 bg-white hover:bg-gray-50 text-indigo-900 font-bold rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-md"
            >
              <Group />
              <span>Pick Team</span>
            </button>

            <button
              disabled={true}
              className="flex-1 bg-black/20 text-white/50 cursor-not-allowed font-bold rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 backdrop-blur-sm border border-white/10"
            >
              <Dollar height={5} width={5} />
              <span>Transfers</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerStatsCard;
