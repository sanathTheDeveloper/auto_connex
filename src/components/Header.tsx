/**
 * Header Component
 *
 * Reusable header with solid Primary brand color background, app branding, and navigation icons.
 * Uses Auto Connex Primary brand color (#0ABAB5).
 *
 * @example
 * <Header
 *   onMenuPress={() => navigation.openDrawer()}
 *   onNotificationPress={() => navigation.navigate('Notifications')}
 * />
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

// Assets
const LOGO_LOCKUP = require('../../assets/logos/logo-lockup-teal.png');

// ============================================================================
// TYPES
// ============================================================================

export interface HeaderProps {
  /** Callback when menu icon is pressed */
  onMenuPress?: () => void;
  /** Callback when notification icon is pressed */
  onNotificationPress?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Left: Menu icon */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={onMenuPress}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
        >
          <Ionicons name="menu-outline" size={24} color={Colors.black} />
        </TouchableOpacity>

        {/* Center: Brand - Logo Lockup only */}
        <View style={styles.headerBrand}>
          <Image source={LOGO_LOCKUP} style={styles.logoLockup} resizeMode="contain" />
        </View>

        {/* Right: Notification */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={onNotificationPress}
          accessibilityLabel="View notifications"
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingTop:Spacing.sm,
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
    paddingTop: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerIconButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBrand: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  logoLockup: {
    width: 120,
    height: 36,
    tintColor: Colors.black,
  },
});

export default Header;
