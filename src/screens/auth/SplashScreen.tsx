/**
 * SplashScreen Component
 *
 * Simple, clean loading screen with Auto Connex branding.
 * White background with app icon and logo lockup.
 * Auto-navigates to onboarding after 2.5 seconds.
 *
 * Now uses Dimensions event listener for proper responsive behavior
 * across mobile devices and desktop browser inspect mode.
 *
 * @example
 * <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, Animated, Platform, Dimensions, ScaledSize } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacer } from '../../design-system';
import { Colors, Spacing, SpacingMobile } from '../../design-system/primitives';

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

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
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Handle dimension changes (resize on web, orientation on mobile)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

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

  // Calculate responsive values
  const isMobileViewport = viewportWidth <= 480;
  const paddingHorizontal = getResponsiveSpacing('xl', viewportWidth);
  const iconSize = isMobileViewport ? 100 : 120;
  const logoHeight = isMobileViewport ? 60 : 70;

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* App Icon */}
        <Image
          source={require('../../../assets/logos/app-icon-teal.png')}
          style={[styles.appIcon, { width: iconSize, height: iconSize }]}
          resizeMode="contain"
        />

        <Spacer size="xl" />

        {/* Logo Lockup (Brand Name + Tagline) */}
        <Image
          source={require('../../../assets/logos/logo-lockup-teal.png')}
          style={[styles.logoLockup, { height: logoHeight }]}
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
    // paddingHorizontal applied dynamically for responsive behavior
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
    // width and height applied dynamically for responsive behavior
  },
  logoLockup: {
    width: '85%',
    maxWidth: 340,
    // height applied dynamically for responsive behavior
  },
});

export default SplashScreen;
