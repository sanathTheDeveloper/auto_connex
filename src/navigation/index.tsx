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
  Messages: { vehicleId?: string; dealerId?: string };
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
