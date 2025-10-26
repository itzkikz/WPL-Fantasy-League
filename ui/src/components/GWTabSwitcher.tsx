interface GWTabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GWTabSwitcher = ({ activeTab, setActiveTab }: GWTabSwitcherProps) => {
  return (
    <div className="flex-none px-4 py-4 bg-white">
      <div className="max-w-md mx-auto bg-gray-100 rounded-sm p-1 flex">
        <button
          onClick={() => setActiveTab("pitch")}
          className={`flex-1 py-2 px-4 rounded-sm text-sm font-semibold transition-colors ${
            activeTab === "pitch"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600"
          }`}
        >
          Pitch
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-2 px-4 rounded-sm text-sm font-semibold transition-colors ${
            activeTab === "list"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600"
          }`}
        >
          List
        </button>
      </div>
    </div>
  );
};

export default GWTabSwitcher;
