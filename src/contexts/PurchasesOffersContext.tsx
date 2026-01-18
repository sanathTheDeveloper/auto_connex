/**
 * PurchasesOffersContext
 *
 * Global state management for purchases and offers.
 * Manages:
 * - Offers sent by user to other sellers
 * - Offers received on user's listings
 * - Completed purchases
 * - Sold vehicles from user's listings
 * 
 * Persists data to AsyncStorage for session management.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VehicleImageKey } from '../data/vehicles';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Offer sent by user on another vehicle
 */
export interface OfferSent {
  offerId: string;
  vehicleId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    imageKey: VehicleImageKey;
  };
  sellerId: string;
  sellerName: string;
  offerAmount: number;
  askingPrice: number;
  message?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
}

/**
 * Offer received on user's listing
 */
export interface OfferReceived {
  offerId: string;
  listingId: string;
  vehicleId?: string; // Optional: ID to match vehicle in VEHICLES array
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    imageKey: VehicleImageKey;
  };
  buyerId: string;
  buyerName: string;
  offerAmount: number;
  askingPrice: number;
  message?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
}

/**
 * Confirmed purchase
 */
export interface Purchase {
  purchaseId: string;
  vehicleId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    imageKey: VehicleImageKey;
  };
  sellerId: string;
  sellerName: string;
  purchaseAmount: number;
  purchaseDate: string;
  paymentMethod: string;
}

/**
 * Sold vehicle from user's listings
 */
export interface SoldVehicle {
  soldId: string;
  listingId: string;
  vehicleId?: string; // Optional: ID to match vehicle in VEHICLES array
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    imageKey: VehicleImageKey;
  };
  buyerId: string;
  buyerName: string;
  saleAmount: number;
  saleDate: string;
}

/**
 * Context state
 */
interface PurchasesOffersContextState {
  offersSent: OfferSent[];
  offersReceived: OfferReceived[];
  purchases: Purchase[];
  soldVehicles: SoldVehicle[];
  isLoading: boolean;
}

/**
 * Context actions
 */
interface PurchasesOffersContextActions {
  // Offers Sent
  addOfferSent: (offer: Omit<OfferSent, 'offerId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  
  // Offers Received
  addOfferReceived: (offer: Omit<OfferReceived, 'offerId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  approveOffer: (offerId: string) => Promise<void>;
  declineOffer: (offerId: string) => Promise<void>;
  
  // Purchases
  addPurchase: (purchase: Omit<Purchase, 'purchaseId' | 'purchaseDate'>) => Promise<string>;
  
  // Sold Vehicles
  addSoldVehicle: (sold: Omit<SoldVehicle, 'soldId' | 'saleDate'>) => Promise<string>;
  
  // Getters
  getPendingOffersReceivedCount: () => number;
  getPendingOffersSentCount: () => number;
  getOfferById: (offerId: string) => OfferSent | OfferReceived | null;
  
  // Weekly Charges
  getWeeklyCharges: () => {
    totalAmount: number;
    purchaseCount: number;
    daysRemaining: number;
    purchases: Purchase[];
  };
  
  // Spending Analytics
  getSpendingAnalytics: () => {
    weeklySpending: number;
    monthlySpending: number;
    yearlySpending: number;
    weeklyCount: number;
    monthlyCount: number;
    yearlyCount: number;
  };
  
  // Refresh
  refreshData: () => Promise<void>;
}

type PurchasesOffersContextValue = PurchasesOffersContextState & PurchasesOffersContextActions;

// ============================================================================
// CONTEXT
// ============================================================================

const PurchasesOffersContext = createContext<PurchasesOffersContextValue | undefined>(undefined);

const STORAGE_KEY = '@auto_connex:purchases_offers';

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

const MOCK_OFFERS_SENT: OfferSent[] = [
  {
    offerId: 'offer-sent-1',
    vehicleId: '1', // Toyota Camry with registration ABC-123
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      imageKey: 'toyota-camry',
    },
    sellerId: 'seller-premier',
    sellerName: 'Premier Wholesale',
    offerAmount: 35000,
    askingPrice: 37300,
    message: 'Interested in quick purchase if we can agree on price.',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    offerId: 'offer-sent-2',
    vehicleId: '2', // Honda Accord with registration XYZ-789
    vehicleDetails: {
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      imageKey: 'honda-accord',
    },
    sellerId: 'seller-abc',
    sellerName: 'ABC Motors',
    offerAmount: 27000,
    askingPrice: 28900,
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    offerId: 'offer-sent-3',
    vehicleId: '1', // Toyota Camry with registration ABC-123
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      imageKey: 'toyota-camry',
    },
    sellerId: 'seller-luxury',
    sellerName: 'Luxury Auto Group',
    offerAmount: 36000,
    askingPrice: 37300,
    message: 'Can you meet me halfway? Cash buyer.',
    status: 'declined',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_OFFERS_RECEIVED: OfferReceived[] = [
  {
    offerId: 'offer-recv-1',
    listingId: 'listing-camry-1',
    vehicleId: '1', // Toyota Camry with registration ABC-123
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      imageKey: 'toyota-camry',
    },
    buyerId: 'buyer-city',
    buyerName: 'City Motors',
    offerAmount: 35000,
    askingPrice: 37300,
    message: 'Can you do $35k? Cash buyer ready to collect this week.',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    offerId: 'offer-recv-2',
    listingId: 'listing-accord-1',
    vehicleId: '2', // Honda Accord with registration XYZ-789
    vehicleDetails: {
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      imageKey: 'honda-accord',
    },
    buyerId: 'buyer-metro',
    buyerName: 'Metro Dealers',
    offerAmount: 27000,
    askingPrice: 28900,
    message: 'Looking to purchase today if price is right.',
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    offerId: 'offer-recv-3',
    listingId: 'listing-ranger-1',
    vehicleId: '1', // Toyota Camry with registration ABC-123
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      imageKey: 'toyota-camry',
    },
    buyerId: 'buyer-outback',
    buyerName: 'Outback Auto Sales',
    offerAmount: 36000,
    askingPrice: 37300,
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_PURCHASES: Purchase[] = [
  {
    purchaseId: 'purchase-1',
    vehicleId: '1', // Toyota Camry with registration ABC-123
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      mileage: 15000,
      imageKey: 'toyota-camry',
    },
    sellerId: 'seller-premier',
    sellerName: 'Premier Wholesale',
    purchaseAmount: 37000,
    purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'Credit Card',
  },
  {
    purchaseId: 'purchase-2',
    vehicleId: '2', // Honda Accord with registration XYZ-789
    vehicleDetails: {
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      mileage: 22000,
      imageKey: 'honda-accord',
    },
    sellerId: 'seller-luxury',
    sellerName: 'Luxury Auto Group',
    purchaseAmount: 28900,
    purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'Bank Transfer',
  },
];

const MOCK_SOLD_VEHICLES: SoldVehicle[] = [
  {
    soldId: 'sold-1',
    listingId: 'listing-camry-sold',
    vehicleId: '1', // Toyota Camry with registration ABC-123
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      mileage: 15000,
      imageKey: 'toyota-camry',
    },
    buyerId: 'buyer-coastal',
    buyerName: 'Coastal Auto Sales',
    saleAmount: 37000,
    saleDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    soldId: 'sold-2',
    listingId: 'listing-accord-sold',
    vehicleId: '2', // Honda Accord with registration XYZ-789
    vehicleDetails: {
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      mileage: 22000,
      imageKey: 'honda-accord',
    },
    buyerId: 'buyer-summit',
    buyerName: 'Summit Motors',
    saleAmount: 28900,
    saleDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// PROVIDER
// ============================================================================

interface PurchasesOffersProviderProps {
  children: ReactNode;
}

export const PurchasesOffersProvider: React.FC<PurchasesOffersProviderProps> = ({ children }) => {
  // Always initialize with demo data for prototype/demo purposes
  const [state, setState] = useState<PurchasesOffersContextState>({
    offersSent: MOCK_OFFERS_SENT,
    offersReceived: MOCK_OFFERS_RECEIVED,
    purchases: MOCK_PURCHASES,
    soldVehicles: MOCK_SOLD_VEHICLES,
    isLoading: true,
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load data from AsyncStorage
   */
  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          offersSent: parsed.offersSent || prev.offersSent,
          offersReceived: parsed.offersReceived || prev.offersReceived,
          purchases: parsed.purchases || prev.purchases,
          soldVehicles: parsed.soldVehicles || prev.soldVehicles,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('[PurchasesOffersContext] Error loading data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Save data to AsyncStorage
   */
  const saveData = useCallback(async (data: Omit<PurchasesOffersContextState, 'isLoading'>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[PurchasesOffersContext] Error saving data:', error);
    }
  }, []);

  /**
   * Generate unique ID
   */
  const generateId = useCallback((prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Add offer sent by user
   */
  const addOfferSent = useCallback(async (offer: Omit<OfferSent, 'offerId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
    const now = new Date().toISOString();
    const newOffer: OfferSent = {
      ...offer,
      offerId: generateId('offer-sent'),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const newOffersSent = [newOffer, ...state.offersSent];
    const newState = { ...state, offersSent: newOffersSent };
    setState(prev => ({ ...prev, offersSent: newOffersSent }));
    await saveData(newState);

    return newOffer.offerId;
  }, [state, generateId, saveData]);

  /**
   * Add offer received on user's listing
   */
  const addOfferReceived = useCallback(async (offer: Omit<OfferReceived, 'offerId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
    const now = new Date().toISOString();
    const newOffer: OfferReceived = {
      ...offer,
      offerId: generateId('offer-recv'),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const newOffersReceived = [newOffer, ...state.offersReceived];
    const newState = { ...state, offersReceived: newOffersReceived };
    setState(prev => ({ ...prev, offersReceived: newOffersReceived }));
    await saveData(newState);

    return newOffer.offerId;
  }, [state, generateId, saveData]);

  /**
   * Approve an offer received
   */
  const approveOffer = useCallback(async (offerId: string): Promise<void> => {
    const now = new Date().toISOString();
    const updatedOffersReceived = state.offersReceived.map(offer =>
      offer.offerId === offerId
        ? { ...offer, status: 'approved' as const, updatedAt: now }
        : offer
    );

    const newState = { ...state, offersReceived: updatedOffersReceived };
    setState(prev => ({ ...prev, offersReceived: updatedOffersReceived }));
    await saveData(newState);
  }, [state, saveData]);

  /**
   * Decline an offer received
   */
  const declineOffer = useCallback(async (offerId: string): Promise<void> => {
    const now = new Date().toISOString();
    const updatedOffersReceived = state.offersReceived.map(offer =>
      offer.offerId === offerId
        ? { ...offer, status: 'declined' as const, updatedAt: now }
        : offer
    );

    const newState = { ...state, offersReceived: updatedOffersReceived };
    setState(prev => ({ ...prev, offersReceived: updatedOffersReceived }));
    await saveData(newState);
  }, [state, saveData]);

  /**
   * Add purchase
   */
  const addPurchase = useCallback(async (purchase: Omit<Purchase, 'purchaseId' | 'purchaseDate'>): Promise<string> => {
    const newPurchase: Purchase = {
      ...purchase,
      purchaseId: generateId('purchase'),
      purchaseDate: new Date().toISOString(),
    };

    const newPurchases = [newPurchase, ...state.purchases];
    const newState = { ...state, purchases: newPurchases };
    setState(prev => ({ ...prev, purchases: newPurchases }));
    await saveData(newState);

    return newPurchase.purchaseId;
  }, [state, generateId, saveData]);

  /**
   * Add sold vehicle
   */
  const addSoldVehicle = useCallback(async (sold: Omit<SoldVehicle, 'soldId' | 'saleDate'>): Promise<string> => {
    const newSold: SoldVehicle = {
      ...sold,
      soldId: generateId('sold'),
      saleDate: new Date().toISOString(),
    };

    const newSoldVehicles = [newSold, ...state.soldVehicles];
    const newState = { ...state, soldVehicles: newSoldVehicles };
    setState(prev => ({ ...prev, soldVehicles: newSoldVehicles }));
    await saveData(newState);

    return newSold.soldId;
  }, [state, generateId, saveData]);

  /**
   * Get count of pending offers received
   */
  const getPendingOffersReceivedCount = useCallback((): number => {
    return state.offersReceived.filter(offer => offer.status === 'pending').length;
  }, [state.offersReceived]);

  /**
   * Get count of pending offers sent
   */
  const getPendingOffersSentCount = useCallback((): number => {
    return state.offersSent.filter(offer => offer.status === 'pending').length;
  }, [state.offersSent]);

  /**
   * Get offer by ID (searches both sent and received)
   */
  const getOfferById = useCallback((offerId: string): OfferSent | OfferReceived | null => {
    const sentOffer = state.offersSent.find(offer => offer.offerId === offerId);
    if (sentOffer) return sentOffer;

    const receivedOffer = state.offersReceived.find(offer => offer.offerId === offerId);
    if (receivedOffer) return receivedOffer;

    return null;
  }, [state.offersSent, state.offersReceived]);

  /**
   * Refresh data from storage
   */
  const refreshData = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    await loadData();
  }, [loadData]);

  /**
   * Get weekly charges for pending purchases
   */
  const getWeeklyCharges = useCallback(() => {
    const now = new Date();
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get end of current week (Saturday 11:59 PM)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Calculate days remaining
    const daysRemaining = Math.ceil((endOfWeek.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get purchases made this week (for weekly charges)
    const weeklyPurchases = state.purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchaseDate);
      return purchaseDate >= startOfWeek && purchaseDate <= endOfWeek;
    });
    
    const totalAmount = weeklyPurchases.reduce((sum, purchase) => sum + purchase.purchaseAmount, 0);
    
    return {
      totalAmount,
      purchaseCount: weeklyPurchases.length,
      daysRemaining: Math.max(0, daysRemaining),
      purchases: weeklyPurchases,
    };
  }, [state.purchases]);

  /**
   * Get spending analytics for different time periods
   */
  const getSpendingAnalytics = useCallback(() => {
    const now = new Date();
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get start of current year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Filter purchases by time period
    const weeklyPurchases = state.purchases.filter(p => new Date(p.purchaseDate) >= startOfWeek);
    const monthlyPurchases = state.purchases.filter(p => new Date(p.purchaseDate) >= startOfMonth);
    const yearlyPurchases = state.purchases.filter(p => new Date(p.purchaseDate) >= startOfYear);
    
    return {
      weeklySpending: weeklyPurchases.reduce((sum, p) => sum + p.purchaseAmount, 0),
      monthlySpending: monthlyPurchases.reduce((sum, p) => sum + p.purchaseAmount, 0),
      yearlySpending: yearlyPurchases.reduce((sum, p) => sum + p.purchaseAmount, 0),
      weeklyCount: weeklyPurchases.length,
      monthlyCount: monthlyPurchases.length,
      yearlyCount: yearlyPurchases.length,
    };
  }, [state.purchases]);

  const value: PurchasesOffersContextValue = {
    // State
    ...state,
    
    // Actions
    addOfferSent,
    addOfferReceived,
    approveOffer,
    declineOffer,
    addPurchase,
    addSoldVehicle,
    getPendingOffersReceivedCount,
    getPendingOffersSentCount,
    getOfferById,
    getWeeklyCharges,
    getSpendingAnalytics,
    refreshData,
  };

  return (
    <PurchasesOffersContext.Provider value={value}>
      {children}
    </PurchasesOffersContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access purchases and offers context
 */
export const usePurchasesOffers = (): PurchasesOffersContextValue => {
  const context = useContext(PurchasesOffersContext);
  if (!context) {
    throw new Error('usePurchasesOffers must be used within a PurchasesOffersProvider');
  }
  return context;
};
