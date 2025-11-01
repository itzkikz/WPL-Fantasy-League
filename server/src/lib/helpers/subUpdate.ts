// types.ts
type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
type PosLetter = 'G' | 'D' | 'M' | 'F';

interface Player {
  id: number;
  name: string;
  team: string;
  teamColor: string;
  point: number;
  position: Position;
  fullTeamName: string;
  app: number;
  clean_sheet: number;
  goal: number;
  assist: number;
  yellow_card: number;
  red_card: number;
  save: number;
  penalty_save: number;
  penalty_miss: number;
  gw: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isPowerPlayer?: boolean;
  subNumber?: number; // present for bench
}

interface Starting {
  goalkeeper: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
}

interface InputData {
  starting: Starting;
  bench: Player[];
  currentFormation: string;
}

type OutputRow = [number, string, string, PosLetter, string, string, string];

const posToLetter: Record<Position, PosLetter> = {
  GK: 'G',
  DEF: 'D',
  MID: 'M',
  FWD: 'F',
};

function roleOf(p: Player): string {
  if (p.isCaptain) return 'CAPTAIN';
  if (p.isViceCaptain) return 'VICE CAPTAIN';
  return '';
}

/**
 * buildSquadRows transforms the fantasy input object into:
 * [GW, Team Name, Player Name, Position, Lineup, Role, Club]
 */
export function buildSquadRows(data: InputData, teamName: string, nextGW: number): OutputRow[] {
  const rows: OutputRow[] = [];

  const order: (keyof Starting)[] = ['goalkeeper', 'defenders', 'midfielders', 'forwards'];

  // Starting XI in GK -> DEF -> MID -> FWD order
  for (const key of order) {
    const list = data.starting[key] ?? [];
    for (const p of list) {
      rows.push([
        nextGW,
        teamName,
        p.name,
        posToLetter[p.position],
        'Starting XI',
        roleOf(p),
        p.fullTeamName,
      ]);
    }
  }

  // Bench as SUB 1..n, sorted by subNumber (ascending)
  const benchSorted = [...(data.bench ?? [])].sort(
    (a, b) => (a.subNumber ?? 0) - (b.subNumber ?? 0)
  );

  for (const p of benchSorted) {
    const lineup = p.subNumber ? `SUB ${p.subNumber}` : 'SUB';
    rows.push([
      nextGW,
      teamName,
      p.name,
      posToLetter[p.position],
      lineup,
      roleOf(p),
      p.fullTeamName,
    ]);
  }

  return rows;
}

/* Example:
import { buildSquadRows } from './types';
const output = buildSquadRows(inputData, 'Air10 Srikers');
*/
