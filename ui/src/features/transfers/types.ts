export interface TransferPlayer {
  playerId: number;
  name: string;
  position: string;
  tmPosition?: string;
  auctionPrice: number | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isStarting: boolean;
  subNumber: number;
}

export interface Transfer {
  _id: string;
  fantasyTeam: string;
  teamName: string;
  type: 'swap' | 'release' | 'sign';
  playerOut: TransferPlayer | null;
  playerIn: TransferPlayer | null;
  gameweek: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface TransferInput {
  fantasyTeamId: string;
  type: 'swap' | 'release' | 'sign';
  playerOutId?: number | null;
  playerInId?: number | null;
  playerInAuctionPrice?: number | null;
  playerInTmPosition?: string;
  gameweek?: number;
  date?: string;
  note?: string;
}

export interface TransferSquadPick {
  playerId: number;
  name: string;
  position: string;
  auctionPrice: number | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isStarting: boolean;
  subNumber: number;
}

export interface FreeAgentPlayer {
  id: number;
  name: string;
  position: string;
  tmPosition?: string;
  team: string;
  auctionPrice: number | null;
}
