interface GWTabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GWTabSwitcher = ({ activeTab, setActiveTab }: GWTabSwitcherProps) => {
  return (
    <div className="flex-none px-6 py-4">
      <div className="max-w-md mx-auto rounded-xl p-1.5 flex bg-gray-100 dark:bg-white/5 shadow-inner">
        <button
          onClick={() => setActiveTab("pitch")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === "pitch"
              ? "bg-white dark:bg-[#1a1a1a] text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200/50 dark:border-white/10"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Pitch View
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === "list"
              ? "bg-white dark:bg-[#1a1a1a] text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200/50 dark:border-white/10"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          List View
        </button>
      </div>
    </div>
  );
};

export default GWTabSwitcher;
