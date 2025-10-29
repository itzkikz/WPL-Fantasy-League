interface GWTabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GWTabSwitcher = ({ activeTab, setActiveTab }: GWTabSwitcherProps) => {
  return (
    <div className="flex-none px-4 py-4">
      <div className="max-w-md mx-auto rounded-sm p-1 flex bg-[#ebe5eb] dark:bg-[#41054b]">
        <button
          onClick={() => setActiveTab("pitch")}
          className={`flex-1 py-2 px-4 rounded-sm text-sm font-semibold transition-colors ${
            activeTab === "pitch"
              ? "bg-white dark:bg-[#28002b] shadow-sm"
              : ""
          }`}
        >
          Pitch
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-2 px-4 rounded-sm text-sm font-semibold transition-colors ${
            activeTab === "list"
              ? "bg-white dark:bg-[#28002b] shadow-sm"
              : ""
          }`}
        >
          List
        </button>
      </div>
    </div>
  );
};

export default GWTabSwitcher;
