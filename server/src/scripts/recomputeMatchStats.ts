import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import { MatchDetails } from '../models/MatchDetails';
import { PlayerStats } from '../models/PlayerStats';
import { Gameweek } from '../models/Gameweek';
import { mapSofascoreToPlayerMatchStat } from '../lib/sofascoreMapper';
import { calculatePlayerPoints } from '../lib/points';

dotenv.config();

// Recomputes per-match stats & points for every fixture that has lineup data,
// using the fixed sofascoreMapper. Safe to re-run; only touches fixtures that
// already have a PlayerStats entry (i.e. that were added to fantasy before).
const recomputeMatchStats = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

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

    let fixturesProcessed = 0;
    let entriesChanged = 0;

    for (const detail of details) {
      const fixtureId = detail.fixtureId;
      const gameweekId = gwNumberByFixture.get(fixtureId);
      if (gameweekId == null || !detail.lineups?.length) continue;

      // Only process fixtures that were previously added to fantasy
      const anyStats = (detail.lineups || []).some((l) => statsByPlayer.has(l.playerId));
      if (!anyStats) continue;

      const incidents = detail.incidents || [];
      let fixtureChanged = false;

      for (const entry of detail.lineups) {
        if (!entry.playerId) continue;
        const existingDoc = statsByPlayer.get(entry.playerId);
        if (!existingDoc) continue;

        const stats = mapSofascoreToPlayerMatchStat(entry, incidents);
        const dummyPlayer = { position: entry.position } as any;
        const points = calculatePlayerPoints(dummyPlayer, stats);

        const prior = (existingDoc.gameweeks || []).find(
          (g: any) => g.fixtureId === fixtureId
        );
        const priorCS = prior?.stats?.cleanSheet ?? null;
        const priorGC = prior?.stats?.goalsConceded ?? null;
        const priorPts = prior?.points ?? null;

        if (
          priorCS !== stats.cleanSheet ||
          priorGC !== stats.goalsConceded ||
          priorPts !== points
        ) {
          fixtureChanged = true;
          entriesChanged++;
          console.log(
            `[${fixtureId}] player ${entry.playerId}: ` +
            `gc ${priorGC}->${stats.goalsConceded}, ` +
            `cs ${priorCS}->${stats.cleanSheet}, ` +
            `pts ${priorPts}->${points}`
          );
        }

        await PlayerStats.findOneAndUpdate(
          { playerId: entry.playerId },
          { $pull: { gameweeks: { fixtureId } } }
        );
        await PlayerStats.findOneAndUpdate(
          { playerId: entry.playerId },
          { $push: { gameweeks: { id: gameweekId, stats, points, fixtureId, position: entry.position } } }
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
    process.exit(0);
  } catch (error) {
    console.error('Error recomputing match stats:', error);
    process.exit(1);
  }
};

recomputeMatchStats();
