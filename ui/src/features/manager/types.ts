import { Player } from "../players/types";

export interface SubstitutionRequest {
  swapIn: Player;
  swapOut: Player;
}

export interface SubstitutionResponse {
  message: string;
}