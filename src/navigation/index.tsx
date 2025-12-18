import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DesignSystemScreen from '../screens/DesignSystemScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import SavedVehiclesScreen from '../screens/SavedVehiclesScreen';
import ConversationListScreen from '../screens/ConversationListScreen';
import MessagesScreen from '../screens/MessagesScreen';
import { SplashScreen, OnboardingScreen, WelcomeScreen, SignupScreen } from '../screens/auth';
import { Colors } from '../constants/theme';

// Sell Flow Screens
import {
  RegoLookupScreen,
  VehicleDetailsFormScreen,
  PhotoUploadScreen,
  ConditionReportScreen,
  AfterMarketExtrasScreen,
  PricingScreen,
  ReviewPublishScreen,
} from '../screens/sell';

// My Listings Screens
import MyListingsScreen from '../screens/MyListingsScreen';
import EditListingScreen from '../screens/EditListingScreen';

/**
 * Navigation Setup
 * 
 * Define your app's navigation structure here.
 * Auth Flow: Splash → Onboarding → Welcome → Signup → Home
 */

export type RootStackParamList = {
  // Auth Screens
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Signup: { userType: 'dealer' | 'wholesaler' };

  // App Screens
  Home: undefined;
  DesignSystem: undefined;
  VehicleDetails: { vehicleId: string };
  SavedVehicles: undefined;
  ConversationList: undefined;
  Messages: {
    vehicleId?: string;
    dealerId?: string;
    offerAmount?: number;
    offerMessage?: string;
    isPurchase?: boolean;
    purchaseMessage?: string;
  };

  // Sell Flow Screens
  RegoLookup: undefined;
  VehicleDetailsForm: { fromReview?: boolean } | undefined;
  PhotoUpload: { fromReview?: boolean } | undefined;
  ConditionReport: { fromReview?: boolean } | undefined;
  AfterMarketExtras: { fromReview?: boolean } | undefined;
  Pricing: { fromReview?: boolean } | undefined;
  ReviewPublish: undefined;

  // My Listings Screens
  MyListings: undefined;
  EditListing: { listingId: string };
}; 

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false, // Hide headers for auth flow
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // Smooth transitions for all screens
          animation: 'slide_from_right',
        }}
      >
        {/* Auth Flow Screens */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        
        {/* Development/Testing Screens */}
        <Stack.Screen 
          name="DesignSystem" 
          component={DesignSystemScreen}
          options={{
            title: 'Design System',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Auto Connex',
            headerShown: false,
          }}
        />
        
        {/* Vehicle Details Screen */}
        <Stack.Screen
          name="VehicleDetails"
          component={VehicleDetailsScreen}
          options={{
            title: 'Vehicle Details',
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />

        {/* Favorites Screen */}
        <Stack.Screen
          name="SavedVehicles"
          component={SavedVehiclesScreen}
          options={{
            title: 'Favorites',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />

        {/* Conversation List Screen (Messenger-style inbox) */}
        <Stack.Screen
          name="ConversationList"
          component={ConversationListScreen}
          options={{
            title: 'Messages',
            headerShown: false,
          }}
        />

        {/* Messages Screen (Individual chat) */}
        <Stack.Screen
          name="Messages"
          component={MessagesScreen}
          options={{
            title: 'Chat',
            headerShown: false,
          }}
        />

        {/* Sell Flow Screens */}
        <Stack.Screen
          name="RegoLookup"
          component={RegoLookupScreen}
          options={{
            title: 'Sell Vehicle',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="VehicleDetailsForm"
          component={VehicleDetailsFormScreen}
          options={{
            title: 'Vehicle Details',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="PhotoUpload"
          component={PhotoUploadScreen}
          options={{
            title: 'Upload Photos',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ConditionReport"
          component={ConditionReportScreen}
          options={{
            title: 'Condition Report',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="AfterMarketExtras"
          component={AfterMarketExtrasScreen}
          options={{
            title: 'Extras',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="Pricing"
          component={PricingScreen}
          options={{
            title: 'Pricing',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ReviewPublish"
          component={ReviewPublishScreen}
          options={{
            title: 'Review & Publish',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />

        {/* My Listings Screens */}
        <Stack.Screen
          name="MyListings"
          component={MyListingsScreen}
          options={{
            title: 'My Listings',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="EditListing"
          component={EditListingScreen}
          options={{
            title: 'Edit Listing',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
