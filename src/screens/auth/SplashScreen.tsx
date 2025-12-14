/**
 * SplashScreen Component
 *
 * Simple, clean loading screen with Auto Connex branding.
 * White background with app icon and logo lockup.
 * Auto-navigates to onboarding after 2.5 seconds.
 *
 * @example
 * <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Image, Animated, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacer } from '../../design-system';
import { Colors, Spacing, responsive } from '../../design-system/primitives';

// Navigation types (will be defined in navigation/index.tsx)
type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Signup: undefined;
  Home: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

/**
 * SplashScreen
 *
 * Displays Auto Connex branding with simple fade-in animation.
 * Automatically navigates to Onboarding after 2.5 seconds.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Navigate to onboarding after 2.5s
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* App Icon */}
        <Image
          source={require('../../../assets/logos/app-icon-teal.png')}
          style={styles.appIcon}
          resizeMode="contain"
        />

        <Spacer size="xl" />

        {/* Logo Lockup (Brand Name + Tagline) */}
        <Image
          source={require('../../../assets/logos/logo-lockup-teal.png')}
          style={styles.logoLockup}
          resizeMode="contain"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsive.getSpacing('xl'),
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  appIcon: {
    width: responsive.isMobileViewport() ? 100 : 120,
    height: responsive.isMobileViewport() ? 100 : 120,
  },
  logoLockup: {
    width: '85%',
    maxWidth: 340,
    height: responsive.isMobileViewport() ? 60 : 70,
  },
});

export default SplashScreen;
