import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Gameweek } from '../models/Gameweek';
import { Player } from '../models/Player';
import { PlayerStats } from '../models/PlayerStats';
import { FantasyTeam } from '../models/FantasyTeam';
import { runAutoSubs } from '../lib/autoSub';
import { resolveEffectivePosition } from '../utils';
import { getGameweekMinutes } from '../controllers/players';

dotenv.config();

// Target gameweek filter (optional). Leave unset (or "all") to replay every
// completed gameweek. Otherwise pass, e.g. TARGET_GW=1.
const TARGET_GW = process.env.TARGET_GW;

// Dry-run: report what would change without writing to the DB.
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

// Replays the auto-substitutions that were applied when each completed
// gameweek was finalized, using the NEW starting-formation rules
// (MID min 3, FWD max 2). For every completed gameweek it restores each
// team's submitted lineup from history.preAutoSubPicks and re-runs the
// auto-sub logic, updating ONLY that gameweek's history.picks.
//
// currentSquad is intentionally left untouched (it holds the live/current
// gameweek lineup). Safe to re-run: each pass starts from the pre-auto-sub
// snapshot, so output is deterministic and idempotent.
const startSetKey = (arr: any[]) =>
  arr
    .filter((p) => p.isStarting)
    .map((p) => p.playerId)
    .sort((a: any, b: any) => a - b)
    .join('|');

const backfillAutoSubs = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const query: any = { isCompleted: true };
    if (TARGET_GW && TARGET_GW !== 'all') {
      query.number = Number(TARGET_GW);
    }
    const gameweeks = await Gameweek.find(query).sort({ number: 1 }).lean();
    console.log(`Completed gameweeks to process: ${gameweeks.map((g: any) => g.number).join(', ') || 'none'}`);
    if (DRY_RUN) console.log('DRY-RUN mode: no data will be written.');

    const players = await Player.find().lean();
    const pMap = new Map<number, any>(players.map((p: any) => [p.id, p]));
    const getPlayerPosition = (playerId: number) => resolveEffectivePosition(pMap.get(playerId), 'UNK');

    let totalChanged = 0;

    for (const gw of gameweeks) {
      const gwNumber: number = gw.number;

      // Build minutes map for this gameweek (same as completeGameweek)
      const allPlayerStats = await PlayerStats.find({ 'gameweeks.id': gwNumber }).lean();
      const minutesMap = new Map<number, number>();
      for (const ps of allPlayerStats) {
        minutesMap.set(ps.playerId, getGameweekMinutes(ps.gameweeks, gwNumber));
      }

      const teams = await FantasyTeam.find({ 'history.gameweek': gwNumber });

      for (const team of teams) {
        const gwHistory = team.history.find((h: any) => h.gameweek === gwNumber);
        if (!gwHistory) continue;

        // Restore the submitted lineup before re-running auto-subs.
        let base: any[] = gwHistory.preAutoSubPicks && gwHistory.preAutoSubPicks.length > 0
          ? gwHistory.preAutoSubPicks
          : gwHistory.picks;

        if (!base || base.length !== 15) {
          console.log(`  [GW ${gwNumber}] skip ${team.name} (invalid base squad of ${base?.length})`);
          continue;
        }

        const baseRaw = base.map((p: any) => (p as any)?.toObject ? (p as any).toObject() : p);
        const previousPicksRaw = (gwHistory.picks || []).map((p: any) => (p as any)?.toObject ? (p as any).toObject() : p);

        const { picks } = runAutoSubs({
          picks: baseRaw,
          minutesMap,
          getPosition: getPlayerPosition,
        });

        // Semantic change detection: only treat as "changed" when the actual
        // set of starting players differs from the stored result. This ignores
        // bench subNumber ordering, which can differ between replays without
        // affecting the real starting XI.
        const changed = startSetKey(picks) !== startSetKey(previousPicksRaw);

        if (!changed) continue;

        totalChanged++;
        const action = DRY_RUN ? 'would update' : 'updated';
        console.log(`  [GW ${gwNumber}] ${team.name}: auto-subs ${action}`);
        if (DRY_RUN) continue;

        gwHistory.picks = picks as any;
        await team.save();
      }
    }

    console.log(`Done. Teams changing across completed gameweeks: ${totalChanged}${DRY_RUN ? ' (dry-run)' : ''}`);
    process.exit(0);
  } catch (error) {
    console.error('Error in backfillAutoSubs:', error);
    process.exit(1);
  }
};

backfillAutoSubs();
