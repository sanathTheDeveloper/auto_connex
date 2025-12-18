/**
 * MyListingsContext
 *
 * Global state management for published listings.
 * Manages seller's listings with status tracking (Available, Pending, Sold).
 * Persists listings to AsyncStorage.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  VehicleBasicDetails,
  ConditionReport,
  AfterMarketExtra,
  WriteOffDetails,
  PricingDetails,
  PickupLocation,
  SellListingData,
} from './SellContext';

// ============================================================================
// TYPES
// ============================================================================

export type ListingStatus = 'available' | 'pending' | 'sold';

/**
 * Published listing data
 */
export interface PublishedListing {
  listingId: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;

  // From SellListingData
  vehicleDetails: VehicleBasicDetails;
  photos: string[];
  conditionReport: ConditionReport;
  afterMarketExtras: AfterMarketExtra[];
  writeOff: WriteOffDetails;
  pricing: PricingDetails;
  pickupLocation: PickupLocation;
}

/**
 * Context state
 */
interface MyListingsContextState {
  listings: PublishedListing[];
  isLoading: boolean;
  isSaving: boolean;
}

/**
 * Context actions
 */
interface MyListingsContextActions {
  addListing: (listingData: SellListingData) => Promise<string>;
  updateListing: (listingId: string, data: Partial<Omit<PublishedListing, 'listingId' | 'createdAt'>>) => Promise<void>;
  updateListingStatus: (listingId: string, status: ListingStatus) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;
  getListingsByStatus: (status: ListingStatus) => PublishedListing[];
  getListingById: (listingId: string) => PublishedListing | null;
  refreshListings: () => Promise<void>;
}

type MyListingsContextValue = MyListingsContextState & MyListingsContextActions;

// ============================================================================
// CONTEXT
// ============================================================================

const MyListingsContext = createContext<MyListingsContextValue | undefined>(undefined);

const STORAGE_KEY = '@auto_connex:my_listings';

// ============================================================================
// PROVIDER
// ============================================================================

interface MyListingsProviderProps {
  children: ReactNode;
}

export const MyListingsProvider: React.FC<MyListingsProviderProps> = ({ children }) => {
  const [state, setState] = useState<MyListingsContextState>({
    listings: [],
    isLoading: true,
    isSaving: false,
  });

  // Load listings on mount
  useEffect(() => {
    loadListings();
  }, []);

  /**
   * Load listings from storage
   */
  const loadListings = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const listings = JSON.parse(stored) as PublishedListing[];
        setState((prev) => ({ ...prev, listings, isLoading: false }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Save listings to storage
   */
  const saveListings = async (listings: PublishedListing[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch (error) {
      console.error('Failed to save listings:', error);
      throw error;
    }
  };

  /**
   * Generate unique listing ID
   */
  const generateListingId = (): string => {
    return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const addListing = useCallback(async (listingData: SellListingData): Promise<string> => {
    if (!listingData.vehicleDetails) {
      throw new Error('Vehicle details are required');
    }

    const now = new Date().toISOString();
    const listingId = generateListingId();
    const newListing: PublishedListing = {
      listingId,
      status: 'available',
      createdAt: now,
      updatedAt: now,
      vehicleDetails: listingData.vehicleDetails,
      photos: listingData.photos,
      conditionReport: listingData.conditionReport,
      afterMarketExtras: listingData.afterMarketExtras,
      writeOff: listingData.writeOff,
      pricing: listingData.pricing,
      pickupLocation: listingData.pickupLocation,
    };

    return new Promise((resolve, reject) => {
      setState((prev) => {
        const updatedListings = [...prev.listings, newListing];

        // Save to AsyncStorage
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings))
          .then(() => resolve(listingId))
          .catch(reject);

        return {
          ...prev,
          listings: updatedListings,
          isSaving: false,
        };
      });
    });
  }, []);

  const updateListing = useCallback(async (
    listingId: string,
    data: Partial<Omit<PublishedListing, 'listingId' | 'createdAt'>>
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      setState((prev) => {
        const updatedListings = prev.listings.map((listing) => {
          if (listing.listingId === listingId) {
            return {
              ...listing,
              ...data,
              updatedAt: new Date().toISOString(),
            };
          }
          return listing;
        });

        // Save to AsyncStorage
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings))
          .then(() => resolve())
          .catch(reject);

        return {
          ...prev,
          listings: updatedListings,
          isSaving: false,
        };
      });
    });
  }, []);

  const updateListingStatus = useCallback(async (
    listingId: string,
    status: ListingStatus
  ): Promise<void> => {
    await updateListing(listingId, { status });
  }, [updateListing]);

  const deleteListing = useCallback(async (listingId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setState((prev) => {
        const updatedListings = prev.listings.filter(
          (listing) => listing.listingId !== listingId
        );

        // Save to AsyncStorage
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings))
          .then(() => resolve())
          .catch(reject);

        return {
          ...prev,
          listings: updatedListings,
          isSaving: false,
        };
      });
    });
  }, []);

  const getListingsByStatus = useCallback((status: ListingStatus): PublishedListing[] => {
    return state.listings.filter((listing) => listing.status === status);
  }, [state.listings]);

  const getListingById = useCallback((listingId: string): PublishedListing | null => {
    return state.listings.find((listing) => listing.listingId === listingId) || null;
  }, [state.listings]);

  const refreshListings = useCallback(async (): Promise<void> => {
    await loadListings();
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: MyListingsContextValue = {
    ...state,
    addListing,
    updateListing,
    updateListingStatus,
    deleteListing,
    getListingsByStatus,
    getListingById,
    refreshListings,
  };

  return (
    <MyListingsContext.Provider value={value}>
      {children}
    </MyListingsContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to use my listings context
 *
 * @example
 * const { listings, addListing, updateListingStatus } = useMyListings();
 */
export const useMyListings = (): MyListingsContextValue => {
  const context = useContext(MyListingsContext);

  if (context === undefined) {
    throw new Error('useMyListings must be used within a MyListingsProvider');
  }

  return context;
};
