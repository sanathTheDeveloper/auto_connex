/**
 * FavoritesContext
 *
 * Global favorites state management for vehicle cards.
 * Handles adding, removing, and persisting favorite vehicles.
 * Persists favorites to AsyncStorage for session persistence.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Favorites context value
 */
interface FavoritesContextValue {
  // State
  favorites: Set<string>;
  isLoading: boolean;

  // Actions
  toggleFavorite: (vehicleId: string) => void;
  isFavorite: (vehicleId: string) => boolean;
  addFavorite: (vehicleId: string) => void;
  removeFavorite: (vehicleId: string) => void;
  clearAllFavorites: () => void;
  getFavoriteCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@auto_connex:favorites';

/**
 * FavoritesProvider component
 *
 * Wraps app to provide favorites state and actions.
 * Automatically loads persisted favorites on mount.
 */
interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load persisted favorites on mount
   */
  useEffect(() => {
    loadFavorites();
  }, []);

  /**
   * Load favorites from AsyncStorage
   */
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

      if (storedFavorites) {
        const favoritesArray: string[] = JSON.parse(storedFavorites);
        setFavorites(new Set(favoritesArray));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save favorites to AsyncStorage
   */
  const saveFavorites = async (favoritesSet: Set<string>) => {
    try {
      const favoritesArray = Array.from(favoritesSet);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };

  /**
   * Toggle favorite status of a vehicle
   */
  const toggleFavorite = useCallback((vehicleId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(vehicleId)) {
        newFavorites.delete(vehicleId);
      } else {
        newFavorites.add(vehicleId);
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  /**
   * Check if a vehicle is favorited
   */
  const isFavorite = useCallback((vehicleId: string): boolean => {
    return favorites.has(vehicleId);
  }, [favorites]);

  /**
   * Add a vehicle to favorites
   */
  const addFavorite = useCallback((vehicleId: string) => {
    setFavorites(prev => {
      if (prev.has(vehicleId)) return prev;
      const newFavorites = new Set(prev);
      newFavorites.add(vehicleId);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  /**
   * Remove a vehicle from favorites
   */
  const removeFavorite = useCallback((vehicleId: string) => {
    setFavorites(prev => {
      if (!prev.has(vehicleId)) return prev;
      const newFavorites = new Set(prev);
      newFavorites.delete(vehicleId);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  /**
   * Clear all favorites
   */
  const clearAllFavorites = useCallback(() => {
    const emptyFavorites = new Set<string>();
    setFavorites(emptyFavorites);
    saveFavorites(emptyFavorites);
  }, []);

  /**
   * Get count of favorites
   */
  const getFavoriteCount = useCallback((): number => {
    return favorites.size;
  }, [favorites]);

  const value: FavoritesContextValue = {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearAllFavorites,
    getFavoriteCount,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

/**
 * Hook to use favorites context
 *
 * @example
 * const { favorites, toggleFavorite, isFavorite } = useFavorites();
 */
export const useFavorites = (): FavoritesContextValue => {
  const context = useContext(FavoritesContext);

  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }

  return context;
};
