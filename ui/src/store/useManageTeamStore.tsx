import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Roles, Substitutions } from "./types";
import { TeamDetails } from "../features/standings/types";

interface useManageTeamStoreState {
  isSubstitution: boolean;
  setIsSubstitution: (value: boolean) => void;
  substitutions: Substitutions[];
  setSubstitutions: (value: Substitutions) => void;
  resetSubstitutions: () => void;
  teamDetails: TeamDetails;
  setTeamDetails: (value: TeamDetails) => void;
  roles: Roles;
  setRoles: (value: Roles) => void;
}

export const useManageTeamStore = create<useManageTeamStoreState>()(
  devtools(
    (set) => ({
      isSubstitution: false,
      setIsSubstitution: (value: boolean) => set({ isSubstitution: value }),
      substitutions: [],
      setSubstitutions: (value: Substitutions) =>
        set((state) => ({ substitutions: [...state.substitutions, value] })),
      resetSubstitutions: () => set({ substitutions: [] }),
      teamDetails: {},
      setTeamDetails: (value: TeamDetails) => set({ teamDetails: value }),
      roles: {},
      setRoles: (value: Roles) => set({ roles: value }),
    }),
    { name: "useManageTeamStore" } // Optional: give your store a custom name
  )
);
