/**
 * NotificationContext
 *
 * Global state management for notifications.
 * Manages:
 * - New listing matches (saved search alerts)
 * - Incoming offers on user's listings
 * - Offer status updates (approved/declined/counter)
 * - Favorite vehicle updates (price, status, photos)
 * - Payment reminders
 * - Deal confirmations
 * - System announcements
 * - Messages from dealers
 * - Counter-offers received
 * - Weekly purchase summaries
 *
 * Persists data to AsyncStorage for session management.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Notification types matching comprehensive requirements
 */
export type NotificationType =
  | 'new_listing'           // New listings matching saved search
  | 'offer_received'        // Incoming offers on user's listings
  | 'offer_status'          // Offer approved/declined/counter
  | 'favorite_update'       // Price change, status, new photos
  | 'payment_reminder'      // Payment due reminders
  | 'deal_confirmed'        // Deal confirmations
  | 'system_announcement'   // System-wide announcements
  | 'message'               // Messages from dealers
  | 'counter_offer'         // Counter-offers received
  | 'weekly_summary';       // Weekly purchase summaries

/**
 * Filter categories for the notification list
 */
export type NotificationFilter = 'all' | 'offers' | 'listings' | 'system';

/**
 * Individual notification structure
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;                    // ISO date string
  isRead: boolean;

  // Deep link navigation data
  deepLink: {
    screen: keyof RootStackParamList;
    params?: Record<string, any>;
  };

  // Optional metadata for different notification types
  metadata?: {
    vehicleId?: string;
    vehicleInfo?: {
      year: number;
      make: string;
      model: string;
      registration?: string;
    };
    offerId?: string;
    offerAmount?: number;
    priceChange?: {
      oldPrice: number;
      newPrice: number;
    };
    dealerId?: string;
    dealerName?: string;
    searchCriteria?: string;           // For saved search notifications
    imageKey?: string;                 // For vehicle image display
  };
}

/**
 * Context state
 */
interface NotificationContextState {
  notifications: Notification[];
  isLoading: boolean;
  filter: NotificationFilter;
}

/**
 * Context actions
 */
interface NotificationContextActions {
  // Core actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<string>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Filter
  setFilter: (filter: NotificationFilter) => void;

  // Getters
  getUnreadCount: () => number;
  getFilteredNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];

  // Refresh
  refreshNotifications: () => Promise<void>;
}

type NotificationContextValue = NotificationContextState & NotificationContextActions;

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const STORAGE_KEY = '@auto_connex:notifications';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get filter category for a notification type
 */
const getFilterCategory = (type: NotificationType): NotificationFilter => {
  switch (type) {
    case 'offer_received':
    case 'offer_status':
    case 'counter_offer':
      return 'offers';
    case 'new_listing':
    case 'favorite_update':
      return 'listings';
    case 'system_announcement':
    case 'weekly_summary':
    case 'payment_reminder':
      return 'system';
    case 'message':
    case 'deal_confirmed':
    default:
      return 'all';
  }
};

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'offer_received',
    title: 'New Offer Received',
    message: 'City Motors offered $35,000 for your 2023 Toyota Camry',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    isRead: false,
    deepLink: {
      screen: 'PurchasesOffers',
      params: undefined,
    },
    metadata: {
      offerId: 'offer-recv-1',
      offerAmount: 35000,
      dealerName: 'City Motors',
      vehicleInfo: { year: 2023, make: 'Toyota', model: 'Camry' },
    },
  },
  {
    id: 'notif-2',
    type: 'favorite_update',
    title: 'Price Drop on Saved Vehicle',
    message: '2022 Honda Accord price reduced from $32,000 to $28,900',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    deepLink: {
      screen: 'VehicleDetails',
      params: { vehicleId: '2' },
    },
    metadata: {
      vehicleId: '2',
      vehicleInfo: { year: 2022, make: 'Honda', model: 'Accord' },
      priceChange: { oldPrice: 32000, newPrice: 28900 },
    },
  },
  {
    id: 'notif-3',
    type: 'offer_status',
    title: 'Offer Approved!',
    message: 'Your offer of $27,000 for the Honda Accord was accepted',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    deepLink: {
      screen: 'Messages',
      params: { vehicleId: '2', dealerId: 'seller-abc' },
    },
    metadata: {
      offerId: 'offer-sent-2',
      offerAmount: 27000,
      vehicleInfo: { year: 2022, make: 'Honda', model: 'Accord' },
    },
  },
  {
    id: 'notif-4',
    type: 'new_listing',
    title: 'New Listing Matches Your Search',
    message: '2023 Mazda CX-5 in Sydney matches "SUV under $40k"',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
    deepLink: {
      screen: 'VehicleDetails',
      params: { vehicleId: '3' },
    },
    metadata: {
      vehicleId: '3',
      vehicleInfo: { year: 2023, make: 'Mazda', model: 'CX-5' },
      searchCriteria: 'SUV under $40k',
    },
  },
  {
    id: 'notif-5',
    type: 'payment_reminder',
    title: 'Payment Reminder',
    message: 'Payment of $28,900 due in 2 days for Honda Accord purchase',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    isRead: false,
    deepLink: {
      screen: 'PurchasesOffers',
      params: undefined,
    },
    metadata: {
      vehicleInfo: { year: 2022, make: 'Honda', model: 'Accord' },
    },
  },
  {
    id: 'notif-6',
    type: 'message',
    title: 'New Message from Premier Wholesale',
    message: 'Is the price negotiable? I can offer quick settlement.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    isRead: false,
    deepLink: {
      screen: 'Messages',
      params: { vehicleId: '1', dealerId: 'seller-premier' },
    },
    metadata: {
      dealerId: 'seller-premier',
      dealerName: 'Premier Wholesale',
    },
  },
  {
    id: 'notif-7',
    type: 'system_announcement',
    title: 'Platform Update',
    message: 'New PPSR integration now available for all listings',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isRead: true,
    deepLink: {
      screen: 'Home',
      params: undefined,
    },
  },
  {
    id: 'notif-8',
    type: 'weekly_summary',
    title: 'Weekly Purchase Summary',
    message: 'You purchased 2 vehicles worth $65,900 this week',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    isRead: true,
    deepLink: {
      screen: 'PurchasesOffers',
      params: undefined,
    },
  },
  {
    id: 'notif-9',
    type: 'counter_offer',
    title: 'Counter Offer Received',
    message: 'Luxury Auto Group countered with $36,500 for Toyota Camry',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    isRead: false,
    deepLink: {
      screen: 'Messages',
      params: { vehicleId: '1', dealerId: 'seller-luxury' },
    },
    metadata: {
      offerId: 'offer-sent-1',
      offerAmount: 36500,
      dealerName: 'Luxury Auto Group',
      vehicleInfo: { year: 2023, make: 'Toyota', model: 'Camry' },
    },
  },
  {
    id: 'notif-10',
    type: 'deal_confirmed',
    title: 'Deal Confirmed!',
    message: 'Your purchase of 2022 Honda Accord has been confirmed',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true,
    deepLink: {
      screen: 'PurchasesOffers',
      params: undefined,
    },
    metadata: {
      vehicleInfo: { year: 2022, make: 'Honda', model: 'Accord' },
      offerAmount: 28900,
    },
  },
];

// ============================================================================
// PROVIDER
// ============================================================================

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, setState] = useState<NotificationContextState>({
    notifications: __DEV__ ? MOCK_NOTIFICATIONS : [],
    isLoading: true,
    filter: 'all',
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
          notifications: parsed.notifications || prev.notifications,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('[NotificationContext] Error loading data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Save data to AsyncStorage
   */
  const saveData = useCallback(async (notifications: Notification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ notifications }));
    } catch (error) {
      console.error('[NotificationContext] Error saving data:', error);
    }
  }, []);

  /**
   * Generate unique ID
   */
  const generateId = useCallback((prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Add a new notification
   */
  const addNotification = useCallback(async (
    notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>
  ): Promise<string> => {
    const newNotification: Notification = {
      ...notification,
      id: generateId('notif'),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const newNotifications = [newNotification, ...state.notifications];
    setState(prev => ({ ...prev, notifications: newNotifications }));
    await saveData(newNotifications);

    return newNotification.id;
  }, [state.notifications, generateId, saveData]);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );

    setState(prev => ({ ...prev, notifications: updatedNotifications }));
    await saveData(updatedNotifications);
  }, [state.notifications, saveData]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const updatedNotifications = state.notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));

    setState(prev => ({ ...prev, notifications: updatedNotifications }));
    await saveData(updatedNotifications);
  }, [state.notifications, saveData]);

  /**
   * Dismiss (delete) a notification
   */
  const dismissNotification = useCallback(async (notificationId: string): Promise<void> => {
    const updatedNotifications = state.notifications.filter(
      notification => notification.id !== notificationId
    );

    setState(prev => ({ ...prev, notifications: updatedNotifications }));
    await saveData(updatedNotifications);
  }, [state.notifications, saveData]);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, notifications: [] }));
    await saveData([]);
  }, [saveData]);

  /**
   * Set filter
   */
  const setFilter = useCallback((filter: NotificationFilter): void => {
    setState(prev => ({ ...prev, filter }));
  }, []);

  /**
   * Get unread count
   */
  const getUnreadCount = useCallback((): number => {
    return state.notifications.filter(notification => !notification.isRead).length;
  }, [state.notifications]);

  /**
   * Get filtered notifications based on current filter
   */
  const getFilteredNotifications = useCallback((): Notification[] => {
    if (state.filter === 'all') {
      return state.notifications;
    }

    return state.notifications.filter(notification => {
      const category = getFilterCategory(notification.type);
      return category === state.filter || category === 'all';
    });
  }, [state.notifications, state.filter]);

  /**
   * Get notifications by type
   */
  const getNotificationsByType = useCallback((type: NotificationType): Notification[] => {
    return state.notifications.filter(notification => notification.type === type);
  }, [state.notifications]);

  /**
   * Refresh notifications from storage
   */
  const refreshNotifications = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    await loadData();
  }, [loadData]);

  const value: NotificationContextValue = {
    // State
    ...state,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
    setFilter,
    getUnreadCount,
    getFilteredNotifications,
    getNotificationsByType,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access notifications context
 */
export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
