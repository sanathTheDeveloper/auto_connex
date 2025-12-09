/**
 * AuthContext
 * 
 * Global authentication state management.
 * Handles user signup, login, logout, and profile management.
 * Persists auth state to AsyncStorage for session management.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User profile data
 */
export interface UserProfile {
  id: string;
  userType: 'dealer' | 'wholesaler';
  
  // Personal info
  fullName: string;
  email: string;
  phone: string;
  
  // Business info
  abn: string;
  businessName: string;
  tradingName: string;
  businessAddress: string;
  state: string;
  postcode: string;
  
  // License info
  licenseNumber: string;
  licenseState: string;
  licenseType: string;
  
  // Verification status
  abnVerified: boolean;
  licenseVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Payment info
  paymentMethodAdded: boolean;
  
  // Timestamps
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Signup form data
 */
export interface SignupData {
  userType: 'dealer' | 'wholesaler';
  fullName: string;
  email: string;
  phone: string;
  abn: string;
  businessName: string;
  tradingName: string;
  businessAddress: string;
  state: string;
  postcode: string;
  licenseNumber: string;
  licenseState: string;
  licenseType: string;
}

/**
 * Auth context value
 */
interface AuthContextValue {
  // State
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  signup: (data: SignupData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = '@auto_connex:auth';

/**
 * AuthProvider component
 * 
 * Wraps app to provide authentication state and actions.
 * Automatically loads persisted auth state on mount.
 */
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load persisted auth state on mount
   */
  useEffect(() => {
    loadAuthState();
  }, []);

  /**
   * Load auth state from AsyncStorage
   */
  const loadAuthState = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (storedAuth) {
        const userData: UserProfile = JSON.parse(storedAuth);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save auth state to AsyncStorage
   */
  const saveAuthState = async (userData: UserProfile | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  };

  /**
   * Sign up new user
   */
  const signup = async (data: SignupData): Promise<void> => {
    try {
      // In production, this would call backend API
      // For now, create user profile from signup data
      
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        userType: data.userType,
        
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        
        abn: data.abn,
        businessName: data.businessName,
        tradingName: data.tradingName,
        businessAddress: data.businessAddress,
        state: data.state,
        postcode: data.postcode,
        
        licenseNumber: data.licenseNumber,
        licenseState: data.licenseState,
        licenseType: data.licenseType,
        
        abnVerified: true, // Mock verified
        licenseVerified: true, // Mock verified
        emailVerified: false, // Would verify via email
        phoneVerified: false, // Would verify via SMS
        
        paymentMethodAdded: true, // Mock payment added
        
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      
      setUser(newUser);
      await saveAuthState(newUser);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  /**
   * Log in existing user
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // In production, this would call backend API
      // For now, just mock login
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data
      const mockUser: UserProfile = {
        id: 'user_mock_001',
        userType: 'dealer',
        
        fullName: 'John Smith',
        email: email,
        phone: '0412 345 678',
        
        abn: '12 345 678 901',
        businessName: 'Smith Motors Pty Ltd',
        tradingName: 'Smith Motors',
        businessAddress: '123 Main Street, Sydney NSW 2000',
        state: 'NSW',
        postcode: '2000',
        
        licenseNumber: 'LMCT123456',
        licenseState: 'NSW',
        licenseType: 'LMCT License',
        
        abnVerified: true,
        licenseVerified: true,
        emailVerified: true,
        phoneVerified: true,
        
        paymentMethodAdded: true,
        
        createdAt: '2025-01-01T00:00:00.000Z',
        lastLoginAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      await saveAuthState(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Log out current user
   */
  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      await saveAuthState(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await saveAuthState(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signup,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * 
 * @example
 * const { user, isAuthenticated, signup, logout } = useAuth();
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
