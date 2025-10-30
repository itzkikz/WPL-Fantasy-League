import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { User } from "./types.ts";

interface UserStoreState {
  user: User | null;
  setUser: (user: User) => void;
  removeUser: () => void;
}

export const useUserStore = create<UserStoreState>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      removeUser: () => set({ user: null }),
    }),
    { name: "UserStore" } // Optional: give your store a custom name
  )
);
