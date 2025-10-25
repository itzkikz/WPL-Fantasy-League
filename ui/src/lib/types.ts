// types.ts
export interface Player {
  id: number;
  name: string;
  team: string;
  teamColor: string;
  point: number;
  position: "GK" | "DEF" | "MID" | "FWD";
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isPowerPlayer?: boolean;
  fullTeamName: string;
  subNumber?: number;
}

export interface Formation {
  goalkeeper: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
}

export interface PlayerData {
  gw: string;
  team_name: string;
  player_name: string;
  position: string;
  lineup: string;
  role: string | null;
  club: string;
  point: number;
}

export interface FormationResult {
  sampleTeamData: Formation;
  benchData: Player[];
}
