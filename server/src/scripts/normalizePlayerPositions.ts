import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Player } from '../models/Player';
import { MatchDetails } from '../models/MatchDetails';
import { resolvePosition } from '../utils';

dotenv.config();

// Fills blank / unresolvable Player.position values from the player's most
// recent catalogued MatchDetails lineup position (by playerId). Variant labels
// that already resolve (e.g. 'M', 'MID', 'GK') are left untouched.
//
// Usage:
//   npm run backfill:player-positions          (writes to DB)
//   npm run backfill:player-positions -- --dry-run   (report only)
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

const normalizePlayerPositions = async () => {
  await connectDB();
  console.log('Connected to DB');

  const players = (await Player.find({}).select('id position').lean()) as any[];
  const candidates = players.filter((p) => !p.position || resolvePosition(p.position, 'UNK') === 'UNK');
  console.log(`Players total: ${players.length}, missing/unresolvable position: ${candidates.length}`);

  const ids = candidates.map((p) => p.id);

  const lineupsDocs = await MatchDetails.find(
    { 'lineups.playerId': { $in: ids } },
    { lineups: 1 }
  ).sort({ updatedAt: -1 }).lean();

  // Most recent non-empty, resolvable lineup position per player.
  const derived = new Map<number, string>();
  for (const md of lineupsDocs as any[]) {
    for (const entry of md.lineups || []) {
      if (derived.has(entry.playerId)) continue;
      const pos = entry.position?.trim?.() || '';
      if (!pos || resolvePosition(pos, 'UNK') === 'UNK') continue;
      derived.set(entry.playerId, pos);
    }
  }

  let updated = 0;
  let stillMissing = 0;

  for (const p of candidates) {
    const label = derived.get(p.id);
    if (!label) {
      stillMissing++;
      continue;
    }
    console.log(`[${DRY_RUN ? 'dry-run' : 'update'}] player ${p.id}: ${p.position ? `"${p.position}"` : '<empty>'} -> "${label}"`);
    if (!DRY_RUN) {
      await Player.updateOne({ id: p.id }, { $set: { position: label } });
    }
    updated++;
  }

  console.log(`Filled positions: ${updated}${DRY_RUN ? ' (dry-run, no writes)' : ''}`);
  console.log(`Still unresolved: ${stillMissing}`);
  process.exit(0);
};

normalizePlayerPositions().catch((err) => {
  console.error(err);
  process.exit(1);
});