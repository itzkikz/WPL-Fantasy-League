import { Swords, Trophy, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "./Primitives";

const ordinal = (n) => {
  if (!n || n <= 0) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Head-to-head record card for the home page.
 * League + standings come from the existing H2H endpoints
 * (useMyH2HLeagues → useH2HStandings); the card highlights the
 * logged-in team's W/D/L record and position within its league.
 */
const H2HRecordCard = ({ league, standings, myTeamName, loading, onView }) => {
  const myRow = Array.isArray(standings)
    ? standings.find(
        (s) =>
          String(s.teamName || "").trim().toLowerCase() ===
          String(myTeamName || "").trim().toLowerCase()
      )
    : undefined;
  const myPosition = myRow ? standings.indexOf(myRow) + 1 : 0;
  const totalTeams =
    league?.fantasyTeams?.length || (Array.isArray(standings) ? standings.length : 0);

  return (
    <Card padded={false} className="p-3.5 flex flex-col h-full">
      <CardHeader
        title="Head-to-Head"
        subtitle={league ? league.name : "H2H League"}
        action={<Swords className="w-4 h-4 text-secondary" />}
        className="!mb-2"
      />

      {loading ? (
        <div className="flex-1 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !league ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <Swords className="w-6 h-6 text-text-muted mb-2" />
          <p className="text-xs font-bold text-text-primary">Not in an H2H league</p>
          <p className="text-[10px] text-text-muted mt-1">
            Your record appears once you&apos;re assigned to a league.
          </p>
        </div>
      ) : (
        <>
          {myRow ? (
            <>
              {/* Position */}
              <div className="flex items-center justify-between mb-2 px-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">
                  Position
                </span>
                <span className="text-xs font-black text-secondary">
                  {myPosition > 0 ? `${ordinal(myPosition)} of ${totalTeams}` : "—"}
                </span>
              </div>

              {myRow.played > 0 ? (
                <>
                  {/* W / D / L */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl py-2 text-center">
                      <p className="text-base font-black text-emerald-400">{myRow.won}</p>
                      <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider">
                        Won
                      </p>
                    </div>
                    <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl py-2 text-center">
                      <p className="text-base font-black text-text-primary">{myRow.drawn}</p>
                      <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider">
                        Drawn
                      </p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl py-2 text-center">
                      <p className="text-base font-black text-rose-400">{myRow.lost}</p>
                      <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider">
                        Lost
                      </p>
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-text-muted px-1 mb-2">
                    <span>{myRow.played} played</span>
                    <span>PF {myRow.gf}</span>
                    <span>PA {myRow.ga}</span>
                    <span className="text-secondary font-black">{myRow.pts} pts</span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-3">
                  <Trophy className="w-6 h-6 text-text-muted mb-2" />
                  <p className="text-xs font-bold text-text-primary">No completed matchdays yet</p>
                  <p className="text-[10px] text-text-muted mt-1">
                    Results appear after the first H2H gameweek finishes.
                  </p>
                </div>
              )}
            </>
          ) : Array.isArray(standings) && standings.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-3">
              <p className="text-xs font-bold text-text-primary">Not in this league</p>
              <p className="text-[10px] text-text-muted mt-1">
                Your team isn&apos;t part of this H2H league&apos;s {standings.length} teams.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-3">
              <p className="text-xs font-bold text-text-primary">Record unavailable</p>
              <p className="text-[10px] text-text-muted mt-1">
                Standings haven&apos;t been calculated yet.
              </p>
            </div>
          )}

          <button
            onClick={onView}
            className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] font-bold text-secondary bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-lg py-2 transition-all active:scale-95 cursor-pointer"
          >
            View League
            <ChevronRight className="w-3 h-3" />
          </button>
        </>
      )}
    </Card>
  );
};

export default H2HRecordCard;
