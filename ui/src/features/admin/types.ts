export interface SubstitutionPlayer {
  playerId: number;
  name: string;
  position: string;
  teamId: number;
}

export type SubstitutionType = 'swap' | 'captain' | 'vice-captain';

export interface SubstitutionHistoryRecord {
  _id: string;
  fantasyTeam: string | null;
  teamName: string;
  type: SubstitutionType;
  gameweek: number;
  swapIn: SubstitutionPlayer;
  swapOut: SubstitutionPlayer;
  date: string;
  note?: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}