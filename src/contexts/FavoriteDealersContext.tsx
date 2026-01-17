/**
 * FavoriteDealersContext
 *
 * Global favorite dealers state management.
 * Handles adding, removing, and persisting favorite dealers/wholesalers.
 * Persists favorites to AsyncStorage for session persistence.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Favorite Dealers context value
 */
interface FavoriteDealersContextValue {
  // State
  favoriteDealers: Set<string>;
  isLoading: boolean;

  // Actions
  toggleFavoriteDealer: (dealerName: string) => void;
  isFavoriteDealer: (dealerName: string) => boolean;
  addFavoriteDealer: (dealerName: string) => void;
  removeFavoriteDealer: (dealerName: string) => void;
  clearAllFavoriteDealers: () => void;
  getFavoriteDealerCount: () => number;
}

const FavoriteDealersContext = createContext<FavoriteDealersContextValue | undefined>(undefined);

const FAVORITE_DEALERS_STORAGE_KEY = '@auto_connex:favorite_dealers';

/**
 * FavoriteDealersProvider component
 *
 * Wraps app to provide favorite dealers state and actions.
 * Automatically loads persisted favorites on mount.
 */
interface FavoriteDealersProviderProps {
  children: ReactNode;
}

export const FavoriteDealersProvider: React.FC<FavoriteDealersProviderProps> = ({ children }) => {
  const [favoriteDealers, setFavoriteDealers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load persisted favorite dealers on mount
   */
  useEffect(() => {
    loadFavoriteDealers();
  }, []);

  /**
   * Load favorite dealers from AsyncStorage
   */
  const loadFavoriteDealers = async () => {
    try {
      const storedFavoriteDealers = await AsyncStorage.getItem(FAVORITE_DEALERS_STORAGE_KEY);

      if (storedFavoriteDealers) {
        const favoriteDealersArray: string[] = JSON.parse(storedFavoriteDealers);
        setFavoriteDealers(new Set(favoriteDealersArray));
      }
    } catch (error) {
      console.error('Failed to load favorite dealers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save favorite dealers to AsyncStorage
   */
  const saveFavoriteDealers = async (favoriteDealersSet: Set<string>) => {
    try {
      const favoriteDealersArray = Array.from(favoriteDealersSet);
      await AsyncStorage.setItem(FAVORITE_DEALERS_STORAGE_KEY, JSON.stringify(favoriteDealersArray));
    } catch (error) {
      console.error('Failed to save favorite dealers:', error);
    }
  };

  /**
   * Toggle favorite dealer (add if not present, remove if present)
   */
  const toggleFavoriteDealer = useCallback((dealerName: string) => {
    setFavoriteDealers((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);

      if (newFavorites.has(dealerName)) {
        newFavorites.delete(dealerName);
      } else {
        newFavorites.add(dealerName);
      }

      saveFavoriteDealers(newFavorites);
      return newFavorites;
    });
  }, []);

  /**
   * Check if dealer is favorited
   */
  const isFavoriteDealer = useCallback(
    (dealerName: string) => {
      return favoriteDealers.has(dealerName);
    },
    [favoriteDealers]
  );

  /**
   * Add dealer to favorites
   */
  const addFavoriteDealer = useCallback((dealerName: string) => {
    setFavoriteDealers((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      newFavorites.add(dealerName);
      saveFavoriteDealers(newFavorites);
      return newFavorites;
    });
  }, []);

  /**
   * Remove dealer from favorites
   */
  const removeFavoriteDealer = useCallback((dealerName: string) => {
    setFavoriteDealers((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      newFavorites.delete(dealerName);
      saveFavoriteDealers(newFavorites);
      return newFavorites;
    });
  }, []);

  /**
   * Clear all favorite dealers
   */
  const clearAllFavoriteDealers = useCallback(() => {
    setFavoriteDealers(new Set());
    saveFavoriteDealers(new Set());
  }, []);

  /**
   * Get total count of favorite dealers
   */
  const getFavoriteDealerCount = useCallback(() => {
    return favoriteDealers.size;
  }, [favoriteDealers]);

  const value: FavoriteDealersContextValue = {
    favoriteDealers,
    isLoading,
    toggleFavoriteDealer,
    isFavoriteDealer,
    addFavoriteDealer,
    removeFavoriteDealer,
    clearAllFavoriteDealers,
    getFavoriteDealerCount,
  };

  return (
    <FavoriteDealersContext.Provider value={value}>
      {children}
    </FavoriteDealersContext.Provider>
  );
};

/**
 * Custom hook to use favorite dealers context
 */
export const useFavoriteDealers = (): FavoriteDealersContextValue => {
  const context = useContext(FavoriteDealersContext);

  if (context === undefined) {
    throw new Error('useFavoriteDealers must be used within a FavoriteDealersProvider');
  }

  return context;
};
