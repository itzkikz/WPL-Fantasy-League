import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import { PlayerStats } from '../models/PlayerStats';
import { calculatePlayerPoints } from '../lib/points';
import { resolveEffectivePosition } from '../utils';
import { Player } from '../models/Player';

dotenv.config();

// Backfills the STORED per-match points in the PlayerStats collection from the
// canonical points engine (lib/points.ts), using each entry's already-stored
// match stats. Unlike `recompute:stats`, this does NOT re-map raw MatchDetails
// lineups — it only needs the PlayerStats docs, so it is the right tool for a
// scoring-rule change (e.g. the defensive contribution threshold rule) where
// the underlying stats are unchanged but the derived points are stale.
//
// Usage:
//   npm run backfill:points            # write changes
//   npm run backfill:points -- --dry-run   # preview only, no writes
const backfillPlayerPoints = async () => {
  const dryRun = process.argv.includes('--dry-run');
  try {
    await connectDB();
    console.log('Connected to DB' + (dryRun ? ' (DRY RUN — no writes)' : ''));

    const statsDocs = await PlayerStats.find().lean();
    console.log(`Loaded ${statsDocs.length} PlayerStats docs`);

    const playerDocs = await Player.find({}, 'id position tm_position').lean();
    const playerMap = new Map(playerDocs.map((p: any) => [p.id, p]));

    let docsChanged = 0;
    let entriesChanged = 0;
    let entriesRecomputed = 0;
    let totalPointsChanged = 0;
    let skippedNoStats = 0;

    const writes: { filter: { playerId: number }; update: { $set: any } }[] = [];

    for (const doc of statsDocs) {
      const gameweeks = (doc as any).gameweeks || [];
      let docChanged = false;
      let newTotal = 0;

      const newGameweeks = gameweeks.map((g: any) => {
        const stats = g.stats;
        if (!stats) {
          skippedNoStats++;
          newTotal += Number(g.points) || 0;
          return g;
        }

        const position = resolveEffectivePosition(playerMap.get(doc.playerId), 'UNK');
        if (position === 'UNK') {
          // Position cannot be resolved from the canonical store - leave the
          // stored points untouched (unknown players are not re-scored).
          skippedNoStats++;
          newTotal += Number(g.points) || 0;
          return g;
        }

        const newPoints = calculatePlayerPoints({ position } as any, stats);
        const oldPoints = Number(g.points) || 0;
        newTotal += newPoints;

        if (newPoints === oldPoints) return g;

        entriesChanged++;
        if (!docChanged) docChanged = true;
        console.log(
          `[player ${doc.playerId}] gw ${g.id} (fixture ${g.fixtureId}): ` +
          `pts ${oldPoints}->${newPoints}`
        );
        return { ...g, points: newPoints };
      });

      const oldTotal = Number((doc as any).totalPoints) || 0;
      if (oldTotal !== newTotal) {
        totalPointsChanged++;
        if (!docChanged) docChanged = true;
        console.log(
          `[player ${doc.playerId}] totalPoints ${oldTotal}->${newTotal}`
        );
      }

      entriesRecomputed += newGameweeks.length;

      if (docChanged) {
        docsChanged++;
        if (!dryRun) {
          writes.push({
            filter: { playerId: doc.playerId },
            update: { $set: { gameweeks: newGameweeks, totalPoints: newTotal } },
          });
        }
      }
    }

    if (!dryRun && writes.length > 0) {
      // Bulk in batches to stay under the server's 16MB write limit / op cap.
      const BATCH = 200;
      for (let i = 0; i < writes.length; i += BATCH) {
        const batch = writes.slice(i, i + BATCH);
        await PlayerStats.bulkWrite(
          batch.map((w) => ({ updateOne: w })),
          { ordered: false }
        );
      }
    }

    console.log('---');
    console.log(`Entries recomputed from stats: ${entriesRecomputed}`);
    console.log(`Entries with changed points: ${entriesChanged}`);
    console.log(`Docs with changed totalPoints: ${totalPointsChanged}`);
    console.log(`Docs changed: ${docsChanged}`);
    console.log(`Entries skipped (no stats): ${skippedNoStats}`);
    console.log(dryRun
      ? 'DRY RUN — no changes written.'
      : `Done. Wrote ${writes.length} PlayerStats updates.`);
    process.exit(0);
  } catch (error) {
    console.error('Error backfilling player points:', error);
    process.exit(1);
  }
};

backfillPlayerPoints();
