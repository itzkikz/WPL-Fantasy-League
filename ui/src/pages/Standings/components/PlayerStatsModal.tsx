import { X, Target, Clock, Star, Trophy, TrendingUp, Calendar, ArrowRightLeft, ExternalLink, Activity } from "lucide-react";
import { usePlayerDetails } from "../../../features/players/hooks";
import { Player } from "../../../features/players/types";
import { getContrastText } from "../../../libs/helpers/color";

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onMakeCaptain?: (player: Player) => void;
  onMakeViceCaptain?: (player: Player) => void;
  onSubstitute?: (player: Player) => void;
}

const PlayerStatsModal = ({
  isOpen,
  onClose,
  player,
  onMakeCaptain,
  onMakeViceCaptain,
  onSubstitute,
}: PlayerStatsModalProps) => {
  const { data: stats, isLoading, isError } = usePlayerDetails(player?.name || "");

  if (!isOpen || !player) return null;

  const getJerseyColor = () => {
    return stats?.team_color || player?.teamColor || "#ccc";
  };

  const getJerseyTextColor = () => {
    return stats?.team_text_color || player?.teamTextColor || "#ffffff";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#0d041e] border border-[#2d1b54] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] text-white animate-in scale-in duration-300">

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-violet-300">Loading player statistics...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <Trophy className="w-10 h-10 text-rose-500 mb-3" />
            <p className="text-sm font-bold text-rose-300 mb-4">Failed to load statistics.</p>
            <button
              onClick={onClose}
              className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && stats && (
          <>
            {/* 1. Modal Top Section: Jersey & Title details */}
            <div className="relative p-6 bg-[#160b30] border-b border-[#2d1b54] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Player Photo */}
                <div
                  className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-lg shrink-0 bg-[#0d041e] flex items-center justify-center"
                  style={{ borderColor: getJerseyColor() }}
                >
                  {stats.photo || player.photo ? (
                    <img
                      src={stats.photo || player.photo}
                      alt={stats.player_name || player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const sibling = (e.target as HTMLImageElement).nextElementSibling;
                        if (sibling) (sibling as HTMLElement).style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 bg-[#1b1035] flex items-center justify-center"
                    style={{ display: stats.photo || player.photo ? "none" : "flex" }}
                  >
                    <span className="text-sm font-black text-[#a594c9] uppercase tracking-wider font-mono">
                      {(stats.player_name || player.name).split(/\s+/).map((n: string) => n[0]).join("").substring(0, 2)}
                    </span>
                  </div>
                </div>

                {/* Player details */}
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-[#24154a] border border-[#3e2482] rounded-md px-2 py-0.5 text-[9px] uppercase font-black tracking-widest text-[#a594c9] mb-1.5">
                    {stats.position || player.position}
                  </span>
                  <h2 className="text-lg md:text-xl font-black tracking-tight text-white leading-tight truncate">
                    {stats.player_name || player.name}
                  </h2>
                  <p className="text-[11px] text-[#a594c9] font-bold mt-0.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: getJerseyColor() }} />
                    {stats.team_name || stats.club}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Stats Wrapper */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">

              {/* 2. Headline Stats Grid */}
              <div className="grid grid-cols-5 gap-2 bg-[#160b30]/40 border border-[#2d1b54]/50 rounded-2xl p-3 text-center">
                <div>
                  <p className="text-[8px] font-extrabold text-[#a594c9] uppercase tracking-wider">Price</p>
                  <p className="text-xs md:text-sm font-extrabold text-white mt-1">
                    {stats.price ? (stats.price / 10).toFixed(1) + "M" : "5.0M"}
                  </p>
                  <p className="text-[8px] text-green-400 font-bold mt-0.5">↑ 0.1M</p>
                </div>
                <div className="border-l border-[#2d1b54]/40">
                  <p className="text-[8px] font-extrabold text-[#a594c9] uppercase tracking-wider">Points (GW)</p>
                  <p className="text-xs md:text-sm font-black text-[#00ffcc] mt-1">
                    {stats.current_week?.point || 0}
                  </p>
                </div>
                <div className="border-l border-[#2d1b54]/40">
                  <p className="text-[8px] font-extrabold text-[#a594c9] uppercase tracking-wider">Total Points</p>
                  <p className="text-xs md:text-sm font-extrabold text-white mt-1">
                    {stats.overall?.total_point || 0}
                  </p>
                </div>
                <div className="border-l border-[#2d1b54]/40">
                  <p className="text-[8px] font-extrabold text-[#a594c9] uppercase tracking-wider">Ownership</p>
                  <p className="text-xs md:text-sm font-extrabold text-white mt-1">
                    {stats.ownership || 0}%
                  </p>
                </div>
                <div className="border-l border-[#2d1b54]/40 flex flex-col items-center">
                  <p className="text-[8px] font-extrabold text-[#a594c9] uppercase tracking-wider mb-1">Form</p>
                  <div className="flex gap-0.5 justify-center items-center h-full">
                    {stats.recent_form?.map((f: any, idx: number) => {
                      const isCurrentGW = idx === stats.recent_form!.length - 1;
                      return (
                        <span
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-mono font-bold
                            ${isCurrentGW ? "bg-green-500 text-black ring-1 ring-green-300" : "bg-violet-950 text-violet-300"}`}
                        >
                          {f.points}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Gameweek Performance Header & Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#a594c9] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-violet-400" />
                    Gameweek Performance
                  </h3>
                  <span className="text-xs font-black text-[#00ffcc] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md font-mono">
                    {stats.current_week?.point || 0} PTS
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2 bg-[#12082b]/80 border border-[#2d1b54] rounded-2xl p-3 text-center">
                  <div>
                    <Trophy className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Goals</p>
                    <p className="text-xs font-black text-white mt-0.5">{stats.current_week?.goals || 0}</p>
                  </div>
                  <div>
                    <Trophy className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Assists</p>
                    <p className="text-xs font-black text-white mt-0.5">{stats.current_week?.goalAssist || 0}</p>
                  </div>
                  <div>
                    <Target className="w-4 h-4 mx-auto text-[#00ffcc] mb-1" />
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Shots</p>
                    <p className="text-xs font-black text-white mt-0.5">{stats.current_week?.totalShots || 0}</p>
                  </div>
                  <div>
                    <Trophy className="w-4 h-4 mx-auto text-violet-400 mb-1" />
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Passes</p>
                    <p className="text-xs font-black text-white mt-0.5">{stats.current_week?.totalPass || 0}</p>
                  </div>
                  <div>
                    <Clock className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Mins</p>
                    <p className="text-xs font-black text-white mt-0.5">{stats.current_week?.minutesPlayed || 0}</p>
                  </div>
                  <div>
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500 mx-auto mb-1" />
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Bonus</p>
                    <p className="text-xs font-black text-white mt-0.5">{stats.current_week?.isPom ? 3 : 0}</p>
                  </div>
                </div>
              </div>

              {/* 4. Points Breakdown & Upcoming Fixtures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Points Breakdown List */}
                <div className="bg-[#12082b]/80 border border-[#2d1b54] rounded-2xl p-4 flex flex-col h-full">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-[#a594c9] border-b border-[#2d1b54] pb-2 mb-3">
                    Points Breakdown
                  </h4>
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[160px] pr-1">
                    {stats.points_breakdown && stats.points_breakdown.length > 0 ? (
                      stats.points_breakdown.map((b: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-[#a594c9]">{b.label}</span>
                          <span className={b.points >= 0 ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                            {b.points >= 0 ? `+${b.points}` : b.points} pts
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#a594c9] italic text-center py-4">Did not play this gameweek.</p>
                    )}
                  </div>
                  <div className="border-t border-[#2d1b54]/50 pt-2.5 mt-3 flex justify-between items-center text-xs font-black">
                    <span className="text-white">Total</span>
                    <span className="text-[#00ffcc] font-mono">{stats.current_week?.point || 0} pts</span>
                  </div>
                </div>

                {/* Upcoming Fixtures List */}
                <div className="bg-[#12082b]/80 border border-[#2d1b54] rounded-2xl p-4 flex flex-col h-full">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-[#a594c9] border-b border-[#2d1b54] pb-2 mb-3 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    Upcoming Fixtures
                  </h4>
                  <div className="space-y-3 flex-1">
                    {stats.upcoming_fixtures?.map((fix: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-[#160b30]/50 border border-[#2d1b54]/40 rounded-xl p-2">
                        <span className="font-extrabold text-violet-400 font-mono text-[10px]">GW{fix.gw}</span>

                        <div className="flex items-center gap-1.5 flex-1 justify-center px-1">
                          <span className="text-white font-extrabold">{fix.my_team_short_name}</span>
                          <span className="text-[#a594c9] text-[10px]">vs</span>
                          <span className="text-gray-300 font-extrabold truncate" style={{ color: fix.opponent_color }}>
                            {fix.opponent_short_name}
                          </span>
                        </div>

                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">
                          {fix.is_home ? "Home" : "Away"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Overall Season Statistics */}
              <div className="bg-[#12082b]/80 border border-[#2d1b54] rounded-2xl p-4 space-y-3.5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#a594c9] border-b border-[#2d1b54] pb-2 mb-1.5">
                  This Season Stats
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
                  <div className="bg-[#160b30]/50 rounded-xl p-2">
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Played</p>
                    <p className="text-sm font-black text-white mt-0.5">{stats.overall?.appearances || 0}</p>
                  </div>
                  <div className="bg-[#160b30]/50 rounded-xl p-2">
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Goals</p>
                    <p className="text-sm font-black text-white mt-0.5">{stats.overall?.goals || 0}</p>
                  </div>
                  <div className="bg-[#160b30]/50 rounded-xl p-2">
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Assists</p>
                    <p className="text-sm font-black text-white mt-0.5">{stats.overall?.goalAssist || 0}</p>
                  </div>
                  <div className="bg-[#160b30]/50 rounded-xl p-2">
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Clean Sheets</p>
                    <p className="text-sm font-black text-white mt-0.5">{stats.overall?.cleanSheet || 0}</p>
                  </div>
                  <div className="bg-[#160b30]/50 rounded-xl p-2">
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Yellows</p>
                    <p className="text-sm font-black text-white mt-0.5">{stats.overall?.yellowCards || 0}</p>
                  </div>
                  <div className="bg-[#160b30]/50 rounded-xl p-2">
                    <p className="text-[7px] text-[#a594c9] font-bold uppercase truncate">Reds</p>
                    <p className="text-sm font-black text-white mt-0.5">{stats.overall?.redCards || 0}</p>
                  </div>
                </div>
              </div>

              {/* 6. Recent Form (Bar Chart) */}
              <div className="bg-[#12082b]/80 border border-[#2d1b54] rounded-2xl p-4 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#a594c9] border-b border-[#2d1b54] pb-2">
                  Recent Form (Last 5 Gameweeks)
                </h4>

                <div className="flex items-end justify-around h-32 pt-6 relative px-2">
                  {stats.recent_form?.map((f: any, idx: number) => {
                    // Normalize bar height based on points. Max height is 80px (for 15 points or more)
                    const barHeight = Math.min(80, Math.max(8, f.points * 6.5));
                    const isMax = idx === stats.recent_form!.length - 1; // Highlight last gameweek

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                        {/* Point value tooltip */}
                        <span className={`text-[10px] font-extrabold font-mono transition-all duration-300 opacity-80 group-hover:scale-110
                          ${isMax ? "text-[#00ffcc]" : "text-violet-300"}`}>
                          {f.points}
                        </span>

                        {/* Bar */}
                        <div
                          style={{ height: `${barHeight}px` }}
                          className={`w-8 rounded-t-lg transition-all duration-500 scale-y-100 origin-bottom shadow-lg
                            ${isMax
                              ? "bg-gradient-to-t from-emerald-600 to-green-400 shadow-green-500/20"
                              : "bg-gradient-to-t from-violet-700 to-violet-500 shadow-violet-500/10 hover:from-violet-600"}`}
                        />

                        {/* Gameweek tag */}
                        <span className="text-[8px] font-bold text-gray-500 uppercase font-mono">
                          GW{f.gw}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 7. Action Footer Buttons */}
            {onMakeCaptain || onMakeViceCaptain || onSubstitute ? (
              <div className="p-5 bg-[#160b30] border-t border-[#2d1b54] flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full">
                {onMakeCaptain && (
                  <button
                    onClick={() => onMakeCaptain(player)}
                    className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-amber-500/10"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Make Cap
                  </button>
                )}
                {onMakeViceCaptain && (
                  <button
                    onClick={() => onMakeViceCaptain(player)}
                    className="w-full sm:flex-1 bg-slate-400 hover:bg-slate-300 text-black font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-slate-400/10"
                  >
                    <Star className="w-4 h-4" />
                    Make Vc
                  </button>
                )}
                {onSubstitute && (
                  <button
                    onClick={() => onSubstitute(player)}
                    className="w-full sm:flex-1 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-green-500/10"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Substitute
                  </button>
                )}
              </div>
            ) : (
              <div className="p-5 bg-[#160b30] border-t border-[#2d1b54] flex items-center gap-3 shrink-0">
                {/* <button className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border-t border-white/20 text-xs md:text-sm shadow-lg shadow-violet-600/20">
                  <ArrowRightLeft className="w-4 h-4" />
                  Compare Player
                </button>
                
                <button className="flex-1 border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 font-bold rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs md:text-sm">
                  <ExternalLink className="w-4 h-4" />
                  View Player Profile
                </button> */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerStatsModal;
