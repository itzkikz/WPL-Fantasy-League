import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Player } from "../features/players/types";

interface usePlayerStoreState {
  player: Player | null;
  setPlayer: (value: Player) => void;
}

export const usePlayerStore = create<usePlayerStoreState>()(
  devtools(
    (set) => ({
      player: {},
      setPlayer: (value: Player | null) => set({ player: value }),
    }),
    { name: "usePlayerStore" } // Optional: give your store a custom name
  )
);
