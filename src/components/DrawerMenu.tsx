/**
 * DrawerMenu Component
 *
 * Slide-out navigation drawer for Auto Connex marketplace.
 * Opens from left to right with menu items for dealers and wholesalers.
 *
 * @example
 * <DrawerMenu
 *   isOpen={menuOpen}
 *   onClose={() => setMenuOpen(false)}
 *   onNavigate={(screen) => navigation.navigate(screen)}
 * />
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../design-system/primitives';
import { useFavorites } from '../contexts/FavoritesContext';

// Assets
const APP_ICON = require('../../assets/logos/app-icon-teal.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

// ============================================================================
// TYPES
// ============================================================================

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string;
  badge?: number;
  dividerAfter?: boolean;
}

export interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onNavigate?: (screen: string) => void;
  userName?: string;
  userType?: 'dealer' | 'wholesaler';
  activeScreen?: string;
}

// ============================================================================
// MENU ITEMS
// ============================================================================

const MENU_ITEMS: MenuItem[] = [
  { id: 'marketplace', label: 'Marketplace', icon: 'car-sport-outline', screen: 'Home' },
  { id: 'my-listings', label: 'My Listings', icon: 'list-outline', screen: 'MyListings' },
  { id: 'saved', label: 'Favorites', icon: 'heart-outline', screen: 'SavedVehicles' },
  { id: 'messages', label: 'Messages', icon: 'chatbubbles-outline', screen: 'Messages', badge: 5, dividerAfter: true },

  { id: 'add-listing', label: 'Add New Listing', icon: 'add-circle-outline', screen: 'AddListing' },
  { id: 'transport', label: 'Transport Quotes', icon: 'bus-outline', screen: 'Transport' },
  { id: 'ppsr', label: 'PPSR Check', icon: 'shield-checkmark-outline', screen: 'PPSR', dividerAfter: true },

  { id: 'profile', label: 'My Profile', icon: 'person-outline', screen: 'Profile' },
  { id: 'business', label: 'Business Details', icon: 'business-outline', screen: 'Business' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', screen: 'Help', dividerAfter: true },

  { id: 'logout', label: 'Sign Out', icon: 'log-out-outline' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  onOpen,
  onNavigate,
  userName = 'John Dealer',
  userType = 'dealer',
  activeScreen = 'Home',
}) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  // Get favorites count from context
  const { getFavoriteCount } = useFavorites();
  const favoritesCount = getFavoriteCount();

  // PanResponder for swipe to close (on drawer)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          slideAnim.setValue(Math.max(gestureState.dx, -DRAWER_WIDTH));
          fadeAnim.setValue(1 + gestureState.dx / DRAWER_WIDTH);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          onClose();
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(fadeAnim, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Touch tracking for edge swipe to open (works on web)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleEdgeTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
  }, []);

  const handleEdgeTouchMove = useCallback((e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - touchStartX.current;
    const dy = Math.abs(e.nativeEvent.pageY - touchStartY.current);

    // Only track horizontal swipes
    if (dx > 10 && dx > dy) {
      const progress = Math.min(dx / DRAWER_WIDTH, 1);
      slideAnim.setValue(-DRAWER_WIDTH + dx);
      fadeAnim.setValue(progress);
    }
  }, [slideAnim, fadeAnim]);

  const handleEdgeTouchEnd = useCallback((e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - touchStartX.current;

    if (dx > 50) {
      onOpen?.();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [onOpen, slideAnim, fadeAnim]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [isOpen, slideAnim, fadeAnim]);

  const handleMenuPress = (item: MenuItem) => {
    if (item.id === 'logout') {
      onClose();
      // Handle logout logic
      console.log('Logout pressed');
      return;
    }

    if (item.screen && onNavigate) {
      onNavigate(item.screen);
    }
    onClose();
  };

  // Always render edge swipe zone, even when drawer is closed
  if (!isVisible && !isOpen) {
    return (
      <View
        style={styles.edgeSwipeZone}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleEdgeTouchStart}
        onResponderMove={handleEdgeTouchMove}
        onResponderRelease={handleEdgeTouchEnd}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        {...panResponder.panHandlers}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.userSection}>
            <Image source={APP_ICON} style={styles.avatar} resizeMode="contain" />
            <View style={styles.userInfo}>
              <Text variant="bodySmall" weight="bold" style={styles.userName}>
                {userName}
              </Text>
              <Text variant="caption" style={styles.userTypeText}>
                {userType === 'dealer' ? 'Licensed Dealer' : 'Wholesaler'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
          {MENU_ITEMS.map((item) => {
            const isActive = item.screen === activeScreen;
            // Use dynamic count for saved vehicles, static for others
            const badgeCount = item.id === 'saved' ? favoritesCount : item.badge;
            return (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons
                      name={item.id === 'saved' && favoritesCount > 0 ? 'heart' : item.icon}
                      size={20}
                      color={
                        item.id === 'logout'
                          ? Colors.error
                          : isActive
                          ? Colors.primary
                          : Colors.text
                      }
                    />
                    <Text
                      variant="bodySmall"
                      weight={isActive ? 'medium' : 'regular'}
                      style={[
                        styles.menuLabel,
                        item.id === 'logout' && styles.logoutLabel,
                        isActive && styles.menuLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {badgeCount !== undefined && badgeCount > 0 && (
                    <View style={styles.badge}>
                      <Text variant="caption" style={styles.badgeText}>
                        {badgeCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {item.dividerAfter && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
          <Spacer size="xl" />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  edgeSwipeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 999,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 32,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 24,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.white,
  },
  userTypeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  menuList: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuItemActive: {
    backgroundColor: `${Colors.primary}10`,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuLabel: {
    color: Colors.text,
  },
  menuLabelActive: {
    color: Colors.primary,
  },
  logoutLabel: {
    color: Colors.error,
  },
  badge: {
    backgroundColor: Colors.accent,
    minWidth: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
  },
});

export default DrawerMenu;
