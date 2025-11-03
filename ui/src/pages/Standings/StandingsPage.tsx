import { useNavigate } from "@tanstack/react-router";
import { useStandings } from "../../features/standings/hooks";
import ScrollableTable from "../../components/ScrollableTable";
import ScrollableTableSkeleton from "../../components/skeletons/ScrollableTableSkeleton";
import { useEffect, useState } from "react";
import Overlay from "../../components/common/Overlay";
import Button from "../../components/common/Button";

const StandingsPage = () => {
  const navigate = useNavigate();
  const { data: standings, isLoading, error } = useStandings();
  const [showUpdateOverlay, setShowUpdateOverlay] = useState(false);

  const handleTeamClick = (teamName: string) => {
    navigate({
      to: "/standings/$teamName",
      params: { teamName },
    });
  };

  useEffect(() => {
    const seen = localStorage.getItem("update_1.1.0_seen"); // change version key per update
    console.log(seen);
    if (seen === "false" || seen === undefined || seen === null)
      setShowUpdateOverlay(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem("update_1.1.0_seen", "true");
    setShowUpdateOverlay(false);
  };

  return (
    <>
      <div className="flex-none px-4 pt-4 pb-3 border-b border-[#ebe5eb] dark:border-[#541e5d]">
        {/* <h2 className="text-center text-2xl font-semibold text-[#33003b]">
          Arsenal
        </h2> */}
        <p className="mt-2 text-xs text-center">
          Last updated: <b>{standings && standings[0]?.last_update_date}</b>
          (Local Time)
        </p>
      </div>
      {isLoading ? (
        <ScrollableTableSkeleton />
      ) : (
        <ScrollableTable content={standings} onClick={handleTeamClick} />
      )}
      <Overlay
        isOpen={showUpdateOverlay}
        onClose={handleClose}
        showBackButton={false}
        children={
          <div className="flex-1">
            <div className="flex pt-4 justify-center">
              <h2 className="text-2xl text-center justify-center font-bold mb-1">
                What’s New
              </h2>
            </div>
            <div className="flex-1 text-center items-center justify-center px-6 pt-6 pb-4">
              {" "}
              <ul className="text-left space-y-2 mb-4">
                <li>
                  👨‍💼 <b>Manager Login</b> — Access your team securely.
                </li>
                <li>
                  ⚙️ <b>Manage Your Team</b> — Edit and organize your lineup.
                </li>
                <li>
                  🧠 <b>Pick Team</b> — Build your dream squad faster.
                </li>
              </ul>
              <p className="text-sm text-gray-600 italic mb-5">
                🔒 All login passwords are <b>end-to-end encrypted</b> — your
                data stays private and secure.
              </p>
              {/* <button
                onClick={handleClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                
              </button> */}
              <Button width="w-1/2" label="Got it!" onClick={handleClose} />
            </div>
          </div>
        }
      />
    </>
  );
};

export default StandingsPage;
