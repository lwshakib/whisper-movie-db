/**
 * Import SecureStore from expo-secure-store for encrypted, persistent storage.
 * Import create from zustand for state management.
 * Import createJSONStorage and persist middleware from zustand for persisting state to storage.
 */
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Key used for storing onboarding status in SecureStore.
 */
export const ONBOARDING_STORAGE_KEY = 'onBoarding';

/**
 * Interface defining the shape of the OnBoarding state.
 */
interface OnBoardingState {
  /** Indicates if the user has completed onboarding. null means it hasn't been checked yet. */
  isOnBoarding: boolean | null;
  /** Function to update the onboarding status. */
  setIsOnBoarding: (isOnBoarding: boolean) => void;
}

/**
 * Zustand store for managing and persisting onboarding state.
 */
export const useOnBoardingState = create<OnBoardingState>()(
  persist(
    (set) => ({
      // Initial state
      isOnBoarding: null as boolean | null,
      // Setter function
      setIsOnBoarding: (isOnBoarding: boolean) => set({ isOnBoarding }),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      storage: createJSONStorage(() => ({
        // Use SecureStore for persistence
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      })),
    },
  ),
);

/**
 * Key used for storing search history in SecureStore.
 */
export const SEARCH_HISTORY_STORAGE_KEY = 'searchHistory';

/**
 * Interface defining the shape of the SearchHistory state.
 */
interface SearchHistoryState {
  /** Array of past search queries. */
  history: string[];
  /** Function to add a new query to history. */
  addToHistory: (query: string) => void;
  /** Function to remove a specific query from history. */
  removeFromHistory: (query: string) => void;
  /** Function to clear the entire search history. */
  clearHistory: () => void;
}

/**
 * Zustand store for managing and persisting search history.
 */
export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      // Initial state: empty history
      history: [],
      // Adds a query to the top of the list, removing duplicates and limiting to 10 items
      addToHistory: (query: string) =>
        set((state) => {
          if (!query.trim()) return state;
          const filtered = state.history.filter((h) => h !== query);
          return { history: [query, ...filtered].slice(0, 10) }; // Keep last 10
        }),
      // Removes a specific query from the list
      removeFromHistory: (query: string) =>
        set((state) => ({
          history: state.history.filter((h) => h !== query),
        })),
      // Resets history to an empty array
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: SEARCH_HISTORY_STORAGE_KEY,
      storage: createJSONStorage(() => ({
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      })),
    },
  ),
);

/**
 * Key used for storing favorite movie IDs in SecureStore.
 */
export const FAVORITES_STORAGE_KEY = 'favorites';

/**
 * Interface defining the shape of the Favorites state.
 */
interface FavoritesState {
  /** Array of movie IDs that the user has favorited. */
  favorites: string[];
  /** Function to add or remove a movie ID from favorites. */
  toggleFavorite: (movieId: string) => void;
  /** Function to check if a specific movie ID is in favorites. */
  isFavorite: (movieId: string) => boolean;
}

/**
 * Zustand store for managing and persisting user's favorite movies.
 */
export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Initial state: empty favorites list
      favorites: [],
      // Logic to toggle a movie ID in the list
      toggleFavorite: (movieId: string) =>
        set((state) => {
          const isFav = state.favorites.includes(movieId);
          if (isFav) {
            // Remove if it exists
            return { favorites: state.favorites.filter((f) => f !== movieId) };
          } else {
            // Add if it doesn't exist
            return { favorites: [...state.favorites, movieId] };
          }
        }),
      // Helper to check favored status using current state
      isFavorite: (movieId: string) => get().favorites.includes(movieId),
    }),
    {
      name: FAVORITES_STORAGE_KEY,
      storage: createJSONStorage(() => ({
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      })),
    },
  ),
);
