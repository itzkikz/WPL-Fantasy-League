import { Player } from "../features/players/types";

export interface User {
  teamName: string;
  role?: string;
}

export interface Substitutions {
  swapIn: Player,
  swapOut: Player
}

export interface Roles {
  captain?: number,
  vice?: number
}