import { Player } from "../features/players/types";

export interface User {
  teamName: string;
}

export interface Substitutions {
  swapIn: Player,
  swapOut: Player
}

export interface Roles {
  captain?: Player['name'],
  vice?: Player['name']
}