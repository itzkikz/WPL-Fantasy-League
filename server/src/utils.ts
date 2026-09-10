import { PlayerStats } from "./types/players";
import { StandingsResponse, TeamDetails } from "./types/standings";
import { Notifications, Subscribers } from "./types/users";

interface DataTypeMapping {
  teamDetails: TeamDetails[];
  standings: StandingsResponse[];
  playerStats: PlayerStats[];

  subscribers: Subscribers[];
  notifications: Notifications[];
}

const isNumeric = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  const strValue = String(value).trim();
  if (strValue === '') return false;
  return !isNaN(Number(strValue));
};

// Type mapping
type DataType = 'teamDetails' | 'standings' | 'playerStats' | 'subscribers' | 'notifications';
type ReturnTypeMap<T extends DataType> = DataTypeMapping[T];

export function convertToJSON<T extends DataType>(
  rows: any[][],
  type: T
): ReturnTypeMap<T> {
  if (!rows || rows.length === 0) return [] as ReturnTypeMap<T>;

  const headers = rows[0].map(header =>
    header
      .toString()
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase()
  );

  const data = rows
    .slice(1)
    .filter(row => {
      const second = row?.[1];
      if (second === null || second === undefined) return false;
      const str = String(second).trim();
      return str !== '';
    });

  return data.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      const value = row[index];
      if (isNumeric(value)) {
        obj[header] = Number(value);
      } else {
        obj[header] = value ?? null;
      }
    });

    if (type === 'teamDetails') {
      return obj as TeamDetails;
    }
    if (type === 'playerStats') {
      return obj as PlayerStats;
    }

    if (type === 'subscribers') {
      return obj as Subscribers;
    }
    if (type === 'notifications') {
      return obj as Notifications;
    }
    return obj as StandingsResponse;
  }) as ReturnTypeMap<T>;
}

export type PositionCode = 'GK' | 'DEF' | 'MID' | 'FWD';

/**
 * Convert a full position name (e.g., "Goalkeeper", "Defender") to its shorthand code.
 * Returns 'GK', 'DEF', 'MID', or 'FWD'. Falls back to the first character of the input.
 * When nothing can be resolved, returns `fallback` (defaults to 'FWD').
 */
export function resolvePosition(fullName: string | undefined, fallback: PositionCode | 'UNK' = 'FWD'): PositionCode | 'UNK' {
  const normalized = (fullName ?? '').trim().toLowerCase();
  if (['goalkeeper', 'gk', 'keeper'].includes(normalized)) return 'GK';
  if (['defender', 'defence', 'defender', 'centre-back', 'center-back', 'left-back', 'right-back', 'wing-back', 'sweeper'].includes(normalized)) return 'DEF';
  if (['midfielder', 'midfield', 'mid', 'central midfield', 'defensive midfield', 'attacking midfield', 'left midfield', 'right midfield'].includes(normalized)) return 'MID';
  if (['forward', 'striker', 'attack', 'attacker', 'fwd', 'centre-forward', 'left winger', 'right winger', 'second striker'].includes(normalized)) return 'FWD';
  const first = normalized.charAt(0).toUpperCase();
  if (first === 'G') return 'GK';
  if (first === 'D') return 'DEF';
  if (first === 'M') return 'MID';
  if (first === 'F') return 'FWD';
  return fallback;
}

export interface PositionSource {
  position?: string | null;
  tm_position?: string | null;
  tmPosition?: string | null;
}

/**
 * Resolve a player's position for scoring/lineup/display, preferring the
 * Transfermarkt position when it is present and resolvable, and falling back
 * to the stored `position` when it is null or invalid.
 */
export function resolveEffectivePosition(entry: PositionSource | undefined | null, fallback: PositionCode | 'UNK' = 'FWD'): PositionCode | 'UNK' {
  if (!entry) return fallback;
  const tm = resolvePosition(entry.tm_position ?? entry.tmPosition ?? undefined, 'UNK');
  if (tm !== 'UNK') return tm;
  return resolvePosition(entry.position ?? undefined, fallback);
}

/**
 * Resolve strictly from the Transfermarkt position: a code when tm_position is
 * present and resolvable, '' when unset, or 'Unknown' when set but unresolvable.
 */
export function resolveTmPosition(entry: PositionSource | undefined | null): PositionCode | 'Unknown' | '' {
  const raw = entry?.tm_position ?? entry?.tmPosition ?? '';
  if (!raw || !String(raw).trim()) return '';
  const code = resolvePosition(raw, 'UNK');
  return code === 'UNK' ? 'Unknown' : code;
}
