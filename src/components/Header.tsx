/**
 * Header Component
 *
 * Reusable header with gradient background, app branding, and navigation icons.
 * Uses Auto Connex brand colors for gradient (teal to cyan).
 *
 * @example
 * <Header
 *   onMenuPress={() => navigation.openDrawer()}
 *   onNotificationPress={() => navigation.navigate('Notifications')}
 * />
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  /** Show gradient background */
  withGradient?: boolean;
  /** Custom gradient colors (defaults to brand teal gradient) */
  gradientColors?: readonly [string, string, ...string[]];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onNotificationPress,
  withGradient = true,
  gradientColors = [Colors.primary, Colors.secondary],
}) => {
  const headerContent = (
    <View style={styles.header}>
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
        <Image source={APP_ICON} style={styles.appIcon} resizeMode="contain" />
        <Image source={LOGO_LOCKUP} style={styles.logoLockup} resizeMode="contain" />
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
    </View>
  );

  if (withGradient) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientContainer}
      >
        {headerContent}
      </LinearGradient>
    );
  }

  return <View style={styles.plainContainer}>{headerContent}</View>;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  gradientContainer: {
    paddingTop: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  plainContainer: {
    paddingTop: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    gap: Spacing.xs,
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
  },
  logoLockup: {
    width: 150,
    height: 36,
    tintColor: Colors.white,
  },
});

export default Header;
