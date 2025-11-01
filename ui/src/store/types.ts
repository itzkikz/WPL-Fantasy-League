import { Player } from "../features/players/types";

export interface User {
  teamName: string;
}

export interface Substitutions {
  swapIn: Player,
  swapOut: Player
}