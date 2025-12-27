import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const ONBOARDING_STORAGE_KEY = "onBoarding";

interface OnBoardingState {
  isOnBoarding: boolean | null;
  setIsOnBoarding: (isOnBoarding: boolean) => void;
}

export const useOnBoardingState = create<OnBoardingState>()(
  persist(
    (set) => ({
      isOnBoarding: null as boolean | null,
      setIsOnBoarding: (isOnBoarding: boolean) => set({ isOnBoarding }),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      storage: createJSONStorage(() => ({
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      })),
    }
  )
);



