import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Substitutions } from "./types";

interface useManageTeamStoreState {
  isSubstitution: boolean;
  setIsSubstitution: (value: boolean) => void;
  substitutions: Substitutions[];
  setSubstitutions: (value: Substitutions) => void;
}

export const useManageTeamStore = create<useManageTeamStoreState>()(
  devtools(
    (set) => ({
      isSubstitution: false,
      setIsSubstitution: (value: boolean) => set({ isSubstitution: value }),
      substitutions: [],
      setSubstitutions: (value: Substitutions) =>
        set((state) => ({ substitutions: [...state.substitutions, value] })),
    }),
    { name: "useManageTeamStore" } // Optional: give your store a custom name
  )
);
