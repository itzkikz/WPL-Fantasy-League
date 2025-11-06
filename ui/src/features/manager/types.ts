import { Player } from "../players/types";
import { TeamDetails } from "../standings/types";

export interface SubstitutionRequest {
  swapIn: Player;
  swapOut: Player;
}

export interface SubstitutionResponse {
  message: string;
}

export interface ManagerDetailsResponse {

  deadline: string,
  gw: number,
  avg: number,
  highest: number,
  total: number,
  total_point_before_this_gw: number,
  totalGWScore: number,
  teamsCount: number,
  rank: number,
  managerTeam: TeamDetails,
  team: string
  pickMyTeam: boolean,
  total_budget: number,
  balance: number,
  utlisation: number
}