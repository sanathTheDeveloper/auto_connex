import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DesignSystemScreen from '../screens/DesignSystemScreen';
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
  
  // Add more screen types here as you create them
  // Example: Details: { id: string };
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
            headerShown: true,
          }}
        />
        
        {/* Add more screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
