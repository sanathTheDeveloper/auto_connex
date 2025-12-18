/**
 * SellContext
 *
 * Global state management for the Sell Vehicle flow.
 * Manages multi-step form data across all sell screens.
 * Persists draft listings to AsyncStorage.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Vehicle basic details from rego lookup
 */
export interface VehicleBasicDetails {
  registration: string;
  state: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  bodyType: string;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  engineSize: string;
  vin: string; // Full VIN stored, displayed masked
  mileage: number;
  hasLogbook: boolean; // Service logbook history
}

/**
 * Condition report item with severity
 */
export interface ConditionItem {
  id: string;
  description: string;
  severity?: 'minor' | 'moderate' | 'major'; // Only for defects
}

/**
 * Condition report
 */
export interface ConditionReport {
  pros: ConditionItem[];
  cons: ConditionItem[];
  defects: ConditionItem[];
}

/**
 * After market extra item
 */
export interface AfterMarketExtra {
  id: string;
  name: string;
  cost: number;
}

/**
 * Repairable write-off details
 */
export interface WriteOffDetails {
  isWriteOff: boolean;
  explanation?: string;
}

/**
 * Pricing and location details
 */
export interface PricingDetails {
  askingPrice: number;
  negotiable: boolean;
}

/**
 * Pickup location
 */
export interface PickupLocation {
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
}

/**
 * Complete sell listing data
 */
export interface SellListingData {
  // Step 1: Rego lookup
  vehicleDetails: VehicleBasicDetails | null;

  // Step 2: Photos
  photos: string[]; // URIs

  // Step 3: Condition report
  conditionReport: ConditionReport;

  // Step 4: After market extras
  afterMarketExtras: AfterMarketExtra[];

  // Step 5: Pricing (includes write-off question)
  writeOff: WriteOffDetails;
  pricing: PricingDetails;
  pickupLocation: PickupLocation;
}

/**
 * Sell context state
 */
interface SellContextState {
  // Current step (1-7)
  currentStep: number;

  // Form data
  listingData: SellListingData;

  // Draft status
  hasDraft: boolean;
  isDirty: boolean;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
}

/**
 * Sell context actions
 */
interface SellContextActions {
  // Navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Data updates
  setVehicleDetails: (details: VehicleBasicDetails) => void;
  setPhotos: (photos: string[]) => void;
  addPhoto: (photoUri: string) => void;
  removePhoto: (index: number) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;
  setConditionReport: (report: ConditionReport) => void;
  setAfterMarketExtras: (extras: AfterMarketExtra[]) => void;
  setWriteOff: (writeOff: WriteOffDetails) => void;
  setPricing: (pricing: PricingDetails) => void;
  setPickupLocation: (location: PickupLocation) => void;

  // Draft management
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
  clearDraft: () => Promise<void>;

  // Reset
  resetFlow: () => void;
}

type SellContextValue = SellContextState & SellContextActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialListingData: SellListingData = {
  vehicleDetails: null,
  photos: [],
  conditionReport: {
    pros: [],
    cons: [],
    defects: [],
  },
  afterMarketExtras: [],
  writeOff: {
    isWriteOff: false,
    explanation: undefined,
  },
  pricing: {
    askingPrice: 0,
    negotiable: true,
  },
  pickupLocation: {
    streetAddress: '',
    suburb: '',
    state: '',
    postcode: '',
  },
};

const initialState: SellContextState = {
  currentStep: 1,
  listingData: initialListingData,
  hasDraft: false,
  isDirty: false,
  isLoading: false,
  isSaving: false,
};

// ============================================================================
// CONTEXT
// ============================================================================

const SellContext = createContext<SellContextValue | undefined>(undefined);

const DRAFT_STORAGE_KEY = '@auto_connex:sell_draft';

// ============================================================================
// PROVIDER
// ============================================================================

interface SellProviderProps {
  children: ReactNode;
}

export const SellProvider: React.FC<SellProviderProps> = ({ children }) => {
  const [state, setState] = useState<SellContextState>(initialState);

  // Check for existing draft on mount
  useEffect(() => {
    checkForDraft();
  }, []);

  /**
   * Check if there's a saved draft
   */
  const checkForDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (draft) {
        setState((prev) => ({ ...prev, hasDraft: true }));
      }
    } catch (error) {
      console.error('Failed to check for draft:', error);
    }
  };

  // ============================================================================
  // NAVIGATION ACTIONS
  // ============================================================================

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 7),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  // ============================================================================
  // DATA UPDATE ACTIONS
  // ============================================================================

  const setVehicleDetails = useCallback((details: VehicleBasicDetails) => {
    setState((prev) => ({
      ...prev,
      listingData: { ...prev.listingData, vehicleDetails: details },
      isDirty: true,
    }));
  }, []);

  const setPhotos = useCallback((photos: string[]) => {
    setState((prev) => ({
      ...prev,
      listingData: { ...prev.listingData, photos },
      isDirty: true,
    }));
  }, []);

  const addPhoto = useCallback((photoUri: string) => {
    setState((prev) => ({
      ...prev,
      listingData: {
        ...prev.listingData,
        photos: [...prev.listingData.photos, photoUri],
      },
      isDirty: true,
    }));
  }, []);

  const removePhoto = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      listingData: {
        ...prev.listingData,
        photos: prev.listingData.photos.filter((_, i) => i !== index),
      },
      isDirty: true,
    }));
  }, []);

  const reorderPhotos = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const photos = [...prev.listingData.photos];
      const [movedPhoto] = photos.splice(fromIndex, 1);
      photos.splice(toIndex, 0, movedPhoto);
      return {
        ...prev,
        listingData: { ...prev.listingData, photos },
        isDirty: true,
      };
    });
  }, []);

  const setConditionReport = useCallback((report: ConditionReport) => {
    setState((prev) => ({
      ...prev,
      listingData: { ...prev.listingData, conditionReport: report },
      isDirty: true,
    }));
  }, []);

  const setAfterMarketExtras = useCallback((extras: AfterMarketExtra[]) => {
    setState((prev) => ({
      ...prev,
      listingData: { ...prev.listingData, afterMarketExtras: extras },
      isDirty: true,
    }));
  }, []);

  const setWriteOff = useCallback((writeOff: WriteOffDetails) => {
    setState((prev) => ({
      ...prev,
      listingData: { ...prev.listingData, writeOff },
      isDirty: true,
    }));
  }, []);

  const setPricing = useCallback((pricing: PricingDetails) => {
    setState((prev) => ({
      ...prev,
      listingData: { ...prev.listingData, pricing },
      isDirty: true,
    }));
  }, []);

  const setPickupLocation = useCallback((location: PickupLocation) => {
    setState((prev) => ({
      ...prev,
      listingData: { ...prev.listingData, pickupLocation: location },
      isDirty: true,
    }));
  }, []);

  // ============================================================================
  // DRAFT MANAGEMENT
  // ============================================================================

  const saveDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      const draftData = {
        currentStep: state.currentStep,
        listingData: state.listingData,
        savedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setState((prev) => ({ ...prev, hasDraft: true, isDirty: false, isSaving: false }));
    } catch (error) {
      console.error('Failed to save draft:', error);
      setState((prev) => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, [state.currentStep, state.listingData]);

  const loadDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const draft = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (draft) {
        const { currentStep, listingData } = JSON.parse(draft);
        setState((prev) => ({
          ...prev,
          currentStep,
          listingData,
          hasDraft: true,
          isDirty: false,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      setState((prev) => ({ ...prev, hasDraft: false }));
    } catch (error) {
      console.error('Failed to clear draft:', error);
      throw error;
    }
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================

  const resetFlow = useCallback(() => {
    setState(initialState);
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: SellContextValue = {
    // State
    ...state,

    // Actions
    setStep,
    nextStep,
    prevStep,
    setVehicleDetails,
    setPhotos,
    addPhoto,
    removePhoto,
    reorderPhotos,
    setConditionReport,
    setAfterMarketExtras,
    setWriteOff,
    setPricing,
    setPickupLocation,
    saveDraft,
    loadDraft,
    clearDraft,
    resetFlow,
  };

  return <SellContext.Provider value={value}>{children}</SellContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to use sell context
 *
 * @example
 * const { listingData, setVehicleDetails, nextStep } = useSell();
 */
export const useSell = (): SellContextValue => {
  const context = useContext(SellContext);

  if (context === undefined) {
    throw new Error('useSell must be used within a SellProvider');
  }

  return context;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Mask VIN for display (show first 3 and last 4 characters)
 */
export const maskVIN = (vin: string): string => {
  if (!vin || vin.length < 17) return vin;
  return `${vin.slice(0, 3)}**********${vin.slice(-4)}`;
};

/**
 * Generate unique ID for list items
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
