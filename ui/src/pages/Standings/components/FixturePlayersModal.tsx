import { X, Trophy, Activity, Loader2 } from "lucide-react";
import Modal from "../../../components/common/Modal";
import { useFixturePlayers } from "../../../features/standings/hooks";
import { FixturePlayerStats } from "../../../features/standings/types";
import dayjs from "dayjs";

const POSITION_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Goalkeeper: { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400" },
  GK: { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400" },
  Defender: { bg: "bg-blue-500/15", text: "text-blue-300", dot: "bg-blue-400" },
  DEF: { bg: "bg-blue-500/15", text: "text-blue-300", dot: "bg-blue-400" },
  Midfielder: { bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  MID: { bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  Forward: { bg: "bg-rose-500/15", text: "text-rose-300", dot: "bg-rose-400" },
  FWD: { bg: "bg-rose-500/15", text: "text-rose-300", dot: "bg-rose-400" },
};

const getPositionStyle = (pos?: string) =>
  POSITION_STYLES[pos || ""] || { bg: "bg-slate-500/15", text: "text-slate-300", dot: "bg-slate-400" };

function StatCell({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-black text-text-primary tabular-nums">{value ?? 0}</span>
      <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

function PlayerRow({ p, teamColor }: { p: FixturePlayerStats; teamColor: string }) {
  const pos = getPositionStyle(p.position);
  return (
    <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-2.5 py-2">
      <div
        className="w-8 h-8 rounded-lg border overflow-hidden bg-background flex items-center justify-center shrink-0"
        style={{ borderColor: teamColor }}
      >
        {p.photo ? (
          <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[9px] font-black text-text-muted uppercase font-mono">
            {p.name.split(/\s+/).map((n: string) => n[0]).join("").substring(0, 2)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-text-primary truncate">{p.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-1.5 py-[1px] rounded border text-[8px] font-semibold ${pos.bg} ${pos.text} border-white/10`}>
            <span className={`w-[4px] h-[4px] rounded-full ${pos.dot}`} />
            {p.position}
          </span>
          {p.fantasyTeams?.slice(0, 1).map((t) => (
            <span key={t} className="text-[8px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-[1px] rounded truncate max-w-[90px]">
              {t}
            </span>
          ))}
          {(p.fantasyTeams?.length || 0) > 1 && (
            <span className="text-[8px] font-black text-violet-400/70">+{(p.fantasyTeams?.length || 0) - 1}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <StatCell value={p.minutes === 0 ? "DNP" : p.minutes} label="Min" />
        <StatCell value={p.goals} label="G" />
        <StatCell value={p.assists} label="A" />
        <div className="flex flex-col items-center min-w-[24px]">
          <span className={`text-[12px] font-black tabular-nums ${p.minutes === 0 ? "text-amber-400" : "text-[var(--color-success-bright)]"}`}>
            {p.minutes === 0 ? "DNP" : (p.points ?? 0)}
          </span>
          <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Pts</span>
        </div>
      </div>
    </div>
  );
}

interface FixturePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: any | null;
}

const FixturePlayersModal = ({ isOpen, onClose, fixture }: FixturePlayersModalProps) => {
  const { data, isLoading } = useFixturePlayers(fixture?.fixtureId ?? null);

  const dataFixture = data?.fixture || fixture;
  const isFinished = data?.fixture?.status?.type === "finished";

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="center" maxWidthClass="max-w-2xl">
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-5 bg-card border-b border-border flex items-center justify-between shrink-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-black uppercase tracking-wider text-text-primary">
              Fixture Player Stats
            </h2>
            {dataFixture?.gameweek != null && (
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-md font-mono">
                GW{dataFixture.gameweek}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface hover:bg-elevated flex items-center justify-center cursor-pointer text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fixture Team Banner */}
        <div className="px-5 py-3.5 bg-surface border-b border-border/50 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {(dataFixture?.homeTeam?.logo || dataFixture?.homeTeam?.photo) ? (
                <img src={dataFixture.homeTeam.logo || dataFixture.homeTeam.photo} className="w-6 h-6 object-contain" alt="" />
              ) : (
                <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center font-black text-[9px] text-white font-mono" style={{ backgroundColor: dataFixture?.homeTeam?.color }}>
                  {dataFixture?.homeTeam?.shortName}
                </div>
              )}
              <span className="text-sm font-extrabold text-text-primary truncate">{dataFixture?.homeTeam?.name}</span>
              {isFinished && (
                <span className="text-sm font-black text-text-primary font-mono ml-auto">{dataFixture?.homeScore?.display ?? 0}</span>
              )}
            </div>
          </div>
          <div className="px-3 flex flex-col items-center shrink-0">
            <span className="text-[9px] font-black text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-md font-mono">VS</span>
            {dataFixture?.startTimestamp && (
              <span className="text-[8px] font-bold text-text-muted mt-1 uppercase tracking-wider">
                {isFinished ? "FT" : dayjs(dataFixture.startTimestamp * 1000).format("ddd, D MMM • h:mm A")}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-end">
              {isFinished && (
                <span className="text-sm font-black text-text-primary font-mono mr-auto">{dataFixture?.awayScore?.display ?? 0}</span>
              )}
              <span className="text-sm font-extrabold text-text-primary truncate text-right">{dataFixture?.awayTeam?.name}</span>
              {(dataFixture?.awayTeam?.logo || dataFixture?.awayTeam?.photo) ? (
                <img src={dataFixture.awayTeam.logo || dataFixture.awayTeam.photo} className="w-6 h-6 object-contain" alt="" />
              ) : (
                <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center font-black text-[10px] text-white font-mono shrink-0" style={{ backgroundColor: dataFixture?.awayTeam?.color }}>
                  {dataFixture?.awayTeam?.shortName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="w-6 h-6 text-secondary animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono">Loading players...</p>
            </div>
          ) : (
            <>
              {data?.homePlayers?.length === 0 && data?.awayPlayers?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-text-muted text-center">
                  <Trophy className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm font-medium">No owned players in this fixture</p>
                  <p className="text-xs mt-1">No players from these teams are currently in any fantasy squad.</p>
                </div>
              ) : (
                <>
                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1 h-3 rounded-full bg-indigo-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">{dataFixture?.homeTeam?.name}</h3>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted ml-auto">{(data?.homePlayers || []).length} owned</span>
                    </div>
                    <div className="space-y-2">
                      {(data?.homePlayers || []).map((p: FixturePlayerStats) => (
                        <PlayerRow key={p.playerId} p={p} teamColor={dataFixture?.homeTeam?.color || "#003399"} />
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1 h-3 rounded-full bg-emerald-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted/90">{dataFixture?.awayTeam?.name}</h3>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted/40 ml-auto">{(data?.awayPlayers || []).length} owned</span>
                    </div>
                    <div className="space-y-2">
                      {(data?.awayPlayers || []).map((p: FixturePlayerStats) => (
                        <PlayerRow key={p.playerId} p={p} teamColor={dataFixture?.awayTeam?.color || "#003399"} />
                      ))}
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FixturePlayersModal;