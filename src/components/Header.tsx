/**
 * Header Component
 *
 * Reusable header with solid Primary brand color background, app branding, and navigation icons.
 * Uses Auto Connex Primary brand color (#0ABAB5).
 * Supports collapsible mode that shrinks to just logo and icons when scrolled.
 *
 * @example
 * <Header
 *   onMenuPress={() => navigation.openDrawer()}
 *   onNotificationPress={() => navigation.navigate('Notifications')}
 *   isCollapsed={scrollY > 50}
 * />
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

// Assets
const APP_ICON = require('../../assets/logos/app-icon-teal.png');
const LOGO_LOCKUP = require('../../assets/logos/logo-lockup-teal.png');

// ============================================================================
// TYPES
// ============================================================================

export interface HeaderProps {
  /** Callback when menu icon is pressed */
  onMenuPress?: () => void;
  /** Callback when notification icon is pressed */
  onNotificationPress?: () => void;
  /** Scroll position for animated collapse (Animated.Value) */
  scrollY?: Animated.Value;
}

// ============================================================================
// COMPONENT
// ============================================================================

// Animation constants
const SCROLL_THRESHOLD = 80;
const EXPANDED_HEIGHT = Platform.OS === 'ios' ? 140 : 120;
const COLLAPSED_HEIGHT = Platform.OS === 'ios' ? 80 : 72;

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onNotificationPress,
  scrollY,
}) => {
  // Animated values based on scroll position
  const animatedHeight = scrollY
    ? scrollY.interpolate({
        inputRange: [0, SCROLL_THRESHOLD],
        outputRange: [EXPANDED_HEIGHT, COLLAPSED_HEIGHT],
        extrapolate: 'clamp',
      })
    : EXPANDED_HEIGHT;

  // App icon scales down slightly when scrolled (keeps it larger)
  const appIconSize = scrollY
    ? scrollY.interpolate({
        inputRange: [0, SCROLL_THRESHOLD],
        outputRange: [1, 0.85],
        extrapolate: 'clamp',
      })
    : 1;

  // Logo lockup fades out when scrolled
  const logoOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, SCROLL_THRESHOLD * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : 1;

  const logoHeight = scrollY
    ? scrollY.interpolate({
        inputRange: [0, SCROLL_THRESHOLD * 0.6],
        outputRange: [36, 0],
        extrapolate: 'clamp',
      })
    : 36;

  const headerContent = (
    <Animated.View style={[styles.header, { height: animatedHeight }]}>
      {/* Left: Menu icon */}
      <TouchableOpacity
        style={styles.headerIconButton}
        onPress={onMenuPress}
        accessibilityLabel="Open menu"
        accessibilityRole="button"
      >
        <Ionicons name="menu-outline" size={24} color={Colors.white} />
      </TouchableOpacity>

      {/* Center: Brand */}
      <View style={styles.headerBrand}>
        {/* App Icon - always visible, scales down when scrolled */}
        {scrollY ? (
          <Animated.Image
            source={APP_ICON}
            style={[styles.appIcon, { transform: [{ scale: appIconSize }] }]}
            resizeMode="contain"
          />
        ) : (
          <Image source={APP_ICON} style={styles.appIcon} resizeMode="contain" />
        )}
        {/* Logo Lockup - fades out and collapses when scrolled */}
        {scrollY ? (
          <Animated.View style={{ opacity: logoOpacity, height: logoHeight, overflow: 'hidden' }}>
            <Image source={LOGO_LOCKUP} style={styles.logoLockup} resizeMode="contain" />
          </Animated.View>
        ) : (
          <Image source={LOGO_LOCKUP} style={styles.logoLockup} resizeMode="contain" />
        )}
      </View>

      {/* Right: Notification */}
      <TouchableOpacity
        style={styles.headerIconButton}
        onPress={onNotificationPress}
        accessibilityLabel="View notifications"
        accessibilityRole="button"
      >
        <Ionicons name="notifications-outline" size={22} color={Colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );

  return <View style={styles.container}>{headerContent}</View>;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerBrand: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
  },
  logoLockup: {
    width: 150,
    height: 36,
    tintColor: Colors.white,
  },
});

export default Header;
