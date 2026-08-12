import { useMemo } from "react";
import dayjs from "dayjs";
import { Calendar, MapPin } from "lucide-react";
import { Player } from "../../../features/players/types";

interface UpcomingFixturesCardProps {
  players: Player[];
}

interface FixtureRow {
  gw: number;
  kickoff?: number;
  club: string;
  clubLogo: string;
  count: number;
  opponent: string;
  opponentLogo: string;
  isHome: boolean;
}

/**
 * Aggregates the squad's upcoming fixtures (from each player's
 * playerStats.upcoming_fixtures) into per-gameweek rows, merging players
 * from the same club facing the same opponent into a single row with a
 * player count. Padded "TBD" placeholders are dropped.
 */
const UpcomingFixturesCard = ({ players }: UpcomingFixturesCardProps) => {
  const byGw = useMemo(() => {
    const map = new Map<number, FixtureRow[]>();

    for (const p of players) {
      const fixtures = p.playerStats?.upcoming_fixtures || [];
      for (const f of fixtures) {
        const opponent = (f.opponent_short_name || "").trim();
        const club = (f.my_team_short_name || "").trim();
        // Skip padded placeholders (no fixture data resolved yet)
        if (!opponent || opponent === "TBD" || !club || club === "UNK") continue;

        const rows = map.get(f.gw) || [];
        // kickoff gives each fixture a stable identity, so two fixtures in the
        // same gameweek against the same opponent never collapse into one row.
        const existing = rows.find(
          (r) =>
            r.club === club &&
            r.opponent === opponent &&
            r.isHome === f.is_home &&
            r.kickoff === f.kickoff
        );
        if (existing) {
          existing.count += 1;
        } else {
          rows.push({
            gw: f.gw,
            kickoff: f.kickoff,
            club,
            clubLogo: f.my_team_logo || "",
            count: 1,
            opponent,
            opponentLogo: f.opponent_logo || "",
            isHome: f.is_home,
          });
        }
        map.set(f.gw, rows);
      }
    }

    return [...map.entries()]
      .map(([gw, rows]) => [
        gw,
        // Render each gameweek's matches in kickoff order so the section
        // reads chronologically (squad player order can differ).
        rows.sort(
          (a, b) =>
            (a.kickoff || Number.MAX_SAFE_INTEGER) - (b.kickoff || Number.MAX_SAFE_INTEGER)
        ),
      ] as [number, FixtureRow[]])
      .sort((a, b) => a[0] - b[0]);
  }, [players]);

  const totalFixtures = byGw.reduce((acc, [, rows]) => acc + rows.length, 0);

  if (totalFixtures === 0) {
    return (
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
          <h3 className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5 mb-3">
            <Calendar className="w-3.5 h-3.5 text-secondary" />
            <span>Upcoming Fixtures</span>
          </h3>
          <div className="flex flex-col items-center justify-center text-center py-4">
            <MapPin className="w-6 h-6 text-text-muted mb-2" />
            <p className="text-xs font-bold text-text-primary">No upcoming fixtures available</p>
            <p className="text-[10px] text-text-muted mt-1">
              Fixture data for the next gameweeks isn&apos;t loaded yet — check back after the next deadline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-card">
        <h3 className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5 mb-3">
          <Calendar className="w-3.5 h-3.5 text-secondary" />
          <span>Upcoming Fixtures</span>
        </h3>

        <div className="space-y-3">
          {byGw.map(([gw, rows]) => (
            <div key={gw}>
              <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1.5 pl-0.5">
                Gameweek {gw}
              </p>
              <div className="space-y-1.5">
                {rows.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-background/60 border border-border/40 rounded-xl px-2.5 py-2"
                  >
                    {/* My club */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {r.clubLogo ? (
                        <img src={r.clubLogo} alt={r.club} className="w-5 h-5 object-contain shrink-0" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[8px] font-black shrink-0">
                          {r.club.slice(0, 1)}
                        </span>
                      )}
                      <span className="text-[11px] font-extrabold text-text-primary truncate">{r.club}</span>
                      {r.count > 1 && (
                        <span className="text-[8px] font-black text-text-muted bg-surface border border-border/50 rounded px-1 py-0.5 shrink-0">
                          ×{r.count}
                        </span>
                      )}
                    </div>

                    <span className="text-[9px] font-black text-text-muted shrink-0">vs</span>

                    {/* Opponent */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                      <div className="flex flex-col items-end min-w-0">
                        <span className="text-[11px] font-extrabold text-text-primary truncate">
                          {r.opponent}
                        </span>
                        {r.kickoff ? (
                          <span className="text-[8px] font-bold text-text-muted font-mono truncate">
                            {dayjs.unix(r.kickoff).format("ddd D MMM, h:mm A")}
                          </span>
                        ) : null}
                      </div>
                      {r.opponentLogo ? (
                        <img src={r.opponentLogo} alt={r.opponent} className="w-5 h-5 object-contain shrink-0" />
                      ) : null}
                    </div>

                    {/* Home / Away */}
                    <span
                      className={`text-[8px] font-black uppercase tracking-wide rounded-md px-1.5 py-0.5 shrink-0 border ${
                        r.isHome
                          ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                          : "bg-rose-400/10 text-rose-400 border-rose-400/30"
                      }`}
                    >
                      {r.isHome ? "Home" : "Away"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingFixturesCard;
