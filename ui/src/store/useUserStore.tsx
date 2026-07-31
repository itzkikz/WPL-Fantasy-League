import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "./types.ts";

interface UserStoreState {
  user: User | null;
  isGuest: boolean;
  setUser: (user: User) => void;
  setGuest: (isGuest: boolean) => void;
  removeUser: () => void;
}

export const useUserStore = create<UserStoreState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isGuest: false,
        setUser: (user) => set({ user, isGuest: false }),
        setGuest: (isGuest) => set({ isGuest, user: null }),
        removeUser: () => set({ user: null, isGuest: false }),
      }),
      {
        name: "user-store",
        partialize: (state) => ({ isGuest: state.isGuest }), // Only persist isGuest
      }
    ),
    { name: "UserStore" }
  )
);
