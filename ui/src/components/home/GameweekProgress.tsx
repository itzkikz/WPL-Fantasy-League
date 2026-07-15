import { GameweekProgress as GameweekProgressType } from "../../features/home/types";

interface GameweekProgressProps {
  data: GameweekProgressType;
}

const GameweekProgress = ({ data }: GameweekProgressProps) => {
  const steps = [
    { label: "Team Selected", completed: data.teamSelected },
    { label: "Transfers Made", completed: data.transfersMade },
    { label: "Captain Chosen", completed: data.captainChosen },
    { label: "Confirm Team", completed: data.teamConfirmed },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const gwNumber = data.deadline.split(",")[0]?.replace("Deadline: ", "") || "12";

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-text-primary">
          Gameweek {gwNumber}
        </h3>
        <div className="flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-[11px] text-text-secondary">
            {data.deadline}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4">
        <span className="text-[11px] text-text-secondary">
          {completedCount}/{steps.length} completed
        </span>
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between relative">
        <div
          className="absolute h-0.5 bg-border rounded-full"
          style={{ top: "20px", left: "12.5%", right: "12.5%" }}
        />
        <div
          className="absolute h-0.5 bg-secondary rounded-full transition-all duration-300 ease-out"
          style={{
            top: "20px",
            left: "12.5%",
            width:
              completedCount <= 1
                ? "0%"
                : `${((completedCount - 1) / (steps.length - 1)) * 75}%`,
          }}
        />

        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1 relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors duration-200 ${
                step.completed
                  ? "bg-secondary text-bg"
                  : "bg-border text-text-secondary"
              }`}
            >
              {step.completed ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>
            <p className="text-[10px] text-center text-text-secondary leading-tight max-w-[60px]">
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameweekProgress;
