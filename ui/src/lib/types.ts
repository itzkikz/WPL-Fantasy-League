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
  clean_sheet: string;
  goal: string;
  assist: string;
  yellow_card: string;
  red_card: string;
  minutes_played: string;
  save: string;
  penalty_save: string;
  penalty_miss: string;
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
  clean_sheet: string;
  goal: string;
  assist: string;
  yellow_card: string;
  red_card: string;
  minutes_played: string;
  save: string;
  penalty_save: string;
  penalty_miss: string;
}

export interface FormationResult {
  sampleTeamData: Formation;
  benchData: Player[];
}
