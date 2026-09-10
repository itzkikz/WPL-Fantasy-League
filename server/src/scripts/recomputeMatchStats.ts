import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import { MatchDetails } from '../models/MatchDetails';
import { PlayerStats } from '../models/PlayerStats';
import { Player } from '../models/Player';
import { Gameweek } from '../models/Gameweek';
import { mapSofascoreToPlayerMatchStat } from '../lib/sofascoreMapper';
import { calculatePlayerPoints, getMatchPointsBreakdown } from '../lib/points';
import { resolveEffectivePosition } from '../utils';

dotenv.config();

// Recomputes per-match stats & points for fixtures that were previously added
// to fantasy, using the fixed sofascoreMapper and the canonical points engine
// (lib/points.ts). Scoring mirrors the admin ingest endpoint exactly:
//   - stats are mapped per lineup entry from raw MatchDetails data,
//   - the position used for scoring is resolved from the players collection
//     (never from the individual match lineup),
//   - totalPoints is summed from the per-match points.
//
// Only fixtures marked `addedtofantasy` or that already hold at least one
// stored PlayerStats entry for that fixture are touched, and only players that
// already have an entry for the fixture are rewritten - a recompute never
// fabricates new gameweek entries. Safe to re-run; a second run reports zero
// changed entries.
//
// Usage:
//   npm run recompute:stats               # write changes
//   npm run recompute:stats -- --dry-run  # preview only, no writes
const recomputeMatchStats = async () => {
  const dryRun = process.argv.includes('--dry-run');
  try {
    await connectDB();
    console.log('Connected to DB' + (dryRun ? ' (DRY RUN - no writes)' : ''));

    const details = await MatchDetails.find({}).lean();
    const gameweeks = await Gameweek.find().lean();
    const gwNumberByFixture = new Map<number, number>();
    for (const gw of gameweeks) {
      for (const fid of (gw.fixtures || [])) {
        gwNumberByFixture.set(fid, gw.number);
      }
    }

    const statsDocs = await PlayerStats.find().lean();
    const statsByPlayer = new Map<number, any>(statsDocs.map((d) => [d.playerId, d]));

    // Fixture ids that already have at least one stored PlayerStats entry -
    // the precise record of which fixtures were previously added to fantasy.
    const previouslyAddedFixtureIds = new Set<number>();
    for (const doc of statsDocs) {
      for (const g of (doc.gameweeks || [])) {
        if (g?.fixtureId != null) previouslyAddedFixtureIds.add(g.fixtureId);
      }
    }

    // Canonical positions & names, matching how the admin ingest resolves scoring
    // position (tm_position first, falling back to the stored position).
    const playerDocs = await Player.find({}, 'id position tm_position name').lean();
    const positionByPlayer = new Map(playerDocs.map((p: any) => [p.id, resolveEffectivePosition(p, 'UNK')]));
    const nameByPlayer = new Map(playerDocs.map((p: any) => [p.id, p.name]));

    let fixturesProcessed = 0;
    let entriesChanged = 0;

    for (const detail of details) {
      const fixtureId = detail.fixtureId;
      const gameweekId = gwNumberByFixture.get(fixtureId);
      if (gameweekId == null || !detail.lineups?.length) continue;

      // Only process fixtures that were previously added to fantasy.
      const previouslyAdded =
        detail.addedtofantasy === true || previouslyAddedFixtureIds.has(fixtureId);
      if (!previouslyAdded) continue;

      const incidents = detail.incidents || [];
      let fixtureChanged = false;

      for (const entry of detail.lineups) {
        if (!entry.playerId) continue;
        // Only process players that exist in the players collection.
        if (!positionByPlayer.has(entry.playerId) && !nameByPlayer.has(entry.playerId)) continue;
        const playerName = nameByPlayer.get(entry.playerId) || `Player #${entry.playerId}`;
        const existingDoc = statsByPlayer.get(entry.playerId);
        const prior = (existingDoc?.gameweeks || []).find(
          (g: any) => g.fixtureId === fixtureId
        );
        // Only rewrite entries that already exist for this fixture - never
        // create new gameweek entries during a recompute.
        if (!prior) continue;

        const stats = mapSofascoreToPlayerMatchStat(entry, incidents);
        const position = positionByPlayer.get(entry.playerId)!;
        const points = position === 'UNK' ? 0 : calculatePlayerPoints({ position } as any, stats);

        const priorCS = prior?.stats?.cleanSheet ?? null;
        const priorGC = prior?.stats?.goalsConceded ?? null;
        const priorPM = prior?.stats?.penaltyMissed ?? null;
        const priorPS = prior?.stats?.penaltySaved ?? null;
        const priorPts = prior?.points ?? null;

        const changes: string[] = [];
        if (priorCS !== stats.cleanSheet) changes.push(`cs ${priorCS}->${stats.cleanSheet}`);
        if (priorGC !== stats.goalsConceded) changes.push(`gc ${priorGC}->${stats.goalsConceded}`);
        if (priorPM !== stats.penaltyMissed) changes.push(`pm ${priorPM}->${stats.penaltyMissed}`);
        if (priorPS !== stats.penaltySaved) changes.push(`ps ${priorPS}->${stats.penaltySaved}`);
        if (priorPts !== points) changes.push(`pts ${priorPts}->${points}`);

        if (changes.length) {
          fixtureChanged = true;
          entriesChanged++;
          const ptsDiff = points - (priorPts ?? 0);
          const breakdown = getMatchPointsBreakdown(stats, position)
            .map((item) => `${item.label} ${item.value} ${item.points >= 0 ? '+' : ''}${item.points}`)
            .join(', ');
          console.log(
            `[${fixtureId}] player ${entry.playerId} (${playerName}): ` +
            `${changes.join(', ')} | Δ ${ptsDiff >= 0 ? '+' : ''}${ptsDiff}` +
            (breakdown ? ` | ${breakdown}` : '')
          );
        }

        if (dryRun) continue;

        await PlayerStats.findOneAndUpdate(
          { playerId: entry.playerId },
          { $pull: { gameweeks: { fixtureId } } }
        );
        await PlayerStats.findOneAndUpdate(
          { playerId: entry.playerId },
          { $push: { gameweeks: { id: gameweekId, stats, points, fixtureId, position } } }
        );

        const updated = await PlayerStats.findOne({ playerId: entry.playerId }).lean();
        const total = (updated?.gameweeks || []).reduce(
          (sum: number, g: any) => sum + (g.points || 0),
          0
        );
        await PlayerStats.updateOne(
          { playerId: entry.playerId },
          { $set: { totalPoints: total } }
        );
      }

      fixturesProcessed++;
      if (fixtureChanged) {
        console.log(`--- fixture ${fixtureId} (gw ${gameweekId}) had changes`);
      }
    }

    console.log(`Done. Fixtures processed: ${fixturesProcessed}, entries updated: ${entriesChanged}`);
    console.log(dryRun ? 'DRY RUN - no changes written.' : 'Changes written.');
    process.exit(0);
  } catch (error) {
    console.error('Error recomputing match stats:', error);
    process.exit(1);
  }
};

recomputeMatchStats();
