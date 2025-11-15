interface GWTabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GWTabSwitcher = ({ activeTab, setActiveTab }: GWTabSwitcherProps) => {
  return (
    <div className="flex-none px-4 py-2">
      <div className="max-w-md mx-auto rounded-sm p-1 flex bg-light-surface dark:bg-dark-surface">
        <button
          onClick={() => setActiveTab("pitch")}
          className={`flex-1 py-2 px-4 rounded-sm text-sm font-semibold transition-colors ${
            activeTab === "pitch"
              ? "bg-light-bg dark:bg-dark-bg shadow-sm"
              : ""
          }`}
        >
          Pitch
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-2 px-4 rounded-sm text-sm font-semibold transition-colors ${
            activeTab === "list"
              ? "bg-light-bg dark:bg-dark-bg shadow-sm"
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
