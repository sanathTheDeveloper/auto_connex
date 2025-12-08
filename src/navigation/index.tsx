import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DesignSystemScreen from '../screens/DesignSystemScreen';
import { Colors } from '../constants/theme';

/**
 * Navigation Setup
 * 
 * Define your app's navigation structure here.
 * Add more screens as you implement your Figma designs.
 */

export type RootStackParamList = {
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
        initialRouteName="DesignSystem"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="DesignSystem" 
          component={DesignSystemScreen}
          options={{
            title: 'Design System',
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Auto Connex',
          }}
        />
        {/* Add more screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
