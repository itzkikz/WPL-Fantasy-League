import { PlayerStats } from "./types/players";
import { StandingsResponse, TeamDetails } from "./types/standings";
import { Notifications, Subscribers, Users } from "./types/users";

interface DataTypeMapping {
  teamDetails: TeamDetails[];
  standings: StandingsResponse[];
  playerStats: PlayerStats[];
  users: Users[];
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
type DataType = 'teamDetails' | 'standings' | 'playerStats' | 'users' | 'subscribers' | 'notifications';
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
    if (type === 'users') {
      return obj as Users;
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
