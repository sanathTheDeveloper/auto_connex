/**
 * HomeScreen Component
 *
 * Mobile-first automotive marketplace dashboard.
 * Displays vehicle listings with filtering and search capabilities.
 *
 * @example
 * <Stack.Screen name="Home" component={HomeScreen} />
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

// Components
import { Header, DrawerMenu, FilterModal, DEFAULT_FILTERS } from '../components';
import type { FilterOptions } from '../components';

// Design System
import { responsive } from '../design-system/primitives';
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../design-system/primitives';

// Data
import {
  Vehicle,
  VEHICLES,
  getVehicleImage,
} from '../data/vehicles';

// Assets
const VERIFIED_BADGE = require('../../assets/icons/verified-badge.png');


// ============================================================================
// TYPES
// ============================================================================


// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Vehicle card action buttons (heart, share, message) - Modern compact style
 */
interface CardActionsProps {
  isFavorite: boolean;
  onFavoritePress: () => void;
  onSharePress?: () => void;
  onMessagePress?: () => void;
}

const CardActions: React.FC<CardActionsProps> = ({
  isFavorite,
  onFavoritePress,
  onSharePress,
  onMessagePress
}) => (
  <View style={styles.cardActionsRow}>
    <TouchableOpacity
      style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
      onPress={onFavoritePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFavorite ? "heart" : "heart-outline"}
        size={20}
        color={isFavorite ? Colors.accent : Colors.text}
      />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onSharePress} activeOpacity={0.7}>
      <Ionicons name="share-social-outline" size={20} color={Colors.text} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onMessagePress} activeOpacity={0.7}>
      <Ionicons name="chatbubble-outline" size={20} color={Colors.text} />
    </TouchableOpacity>
  </View>
);

/**
 * Compact spec pill component with icon
 */
interface SpecPillProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const SpecPill: React.FC<SpecPillProps> = ({ icon, label, value }) => (
  <View style={styles.specPill}>
    <View style={styles.specPillIconContainer}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
    </View>
    <Text variant="label" color="textTertiary" style={styles.specPillLabel}>{label}</Text>
    <Text variant="bodySmall" weight="medium" color="text" style={styles.specPillValue}>{value}</Text>
  </View>
);

/**
 * Individual vehicle card - Redesigned for better UX
 */
interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  isFavorite: boolean;
  onFavoritePress: () => void;
  onMessagePress: () => void;
  onSharePress: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  onPress, 
  isFavorite, 
  onFavoritePress,
  onMessagePress,
  onSharePress 
}) => (
  <View style={styles.vehicleCardWrapper}>
    <View style={styles.vehicleCard}>
      {/* Vehicle Image - Not clickable */}
      <View style={styles.vehicleImageContainer}>
        <Image
          source={getVehicleImage(vehicle.imageKey)}
          style={styles.vehicleImage}
          resizeMode="contain"
        />
      </View>

      {/* Vehicle Details */}
      <View style={styles.vehicleDetails}>
        {/* Actions Row - Top right aligned - Not clickable for navigation */}
        <View style={styles.actionsRow}>
          <CardActions
            isFavorite={isFavorite}
            onFavoritePress={onFavoritePress}
            onMessagePress={onMessagePress}
            onSharePress={onSharePress}
          />
        </View>

        <Spacer size="sm" />

        {/* Clickable Content Area - Below actions */}
        <TouchableOpacity activeOpacity={0.4} onPress={onPress}>
          {/* Title Section - Below actions */}
          <View style={styles.vehicleTitleSection}>
            <Text variant="h4" weight="bold" color="text" style={styles.titleText}>
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
              {vehicle.verified && (
                <Text>
                  {'  '}
                  <Image
                    source={VERIFIED_BADGE}
                    style={styles.verifiedBadgeIcon}
                  />
                </Text>
              )}
            </Text>
            <View style={styles.subtitleRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
              <Text variant="caption" color="textTertiary"> {vehicle.location}</Text>
              <Text variant="caption" color="textTertiary"> • </Text>
              <Text variant="caption" color="textTertiary">{vehicle.dealer}</Text>
            </View>
          </View>

          <Spacer size="md" />

          {/* Price Section - Two columns */}
          <View style={styles.priceSection}>
            <View style={styles.priceColumn}>
              <Text variant="caption" color="textTertiary">Trade Price</Text>
              <Text variant="body" weight="semibold" color="text">
                ${vehicle.tradePrice.toLocaleString()}
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceColumn}>
              <Text variant="caption" color="textTertiary">Retail Price</Text>
              <Text variant="body" weight="semibold" color="text">
                ${vehicle.retailPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          <Spacer size="md" />

          {/* Specs Row with Icons - Bigger and more visible */}
          <View style={styles.specsRow}>
            <SpecPill icon="speedometer-outline" label="Odometer" value={`${vehicle.mileage.toLocaleString()} km`} />
            <SpecPill icon="cog-outline" label="Transmission" value={vehicle.transmission === 'automatic' ? 'Auto' : 'Manual'} />
            <SpecPill icon="flash-outline" label="Fuel Type" value={vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

/**
 * Empty state when no vehicles match filters
 */
const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Text variant="h2">🔍</Text>
    <Spacer size="md" />
    <Text variant="h3" weight="semibold" color="textTertiary" align="center">
      No vehicles found
    </Text>
    <Spacer size="sm" />
    <Text variant="body" color="textTertiary" align="center">
      Try adjusting your search or filters
    </Text>
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Track favorite vehicles
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (vehicleId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(vehicleId)) {
        newFavorites.delete(vehicleId);
      } else {
        newFavorites.add(vehicleId);
      }
      return newFavorites;
    });
  };

  // Scroll tracking for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;

  // Filter vehicles based on search query and filters
  const filteredVehicles = VEHICLES.filter((vehicle) => {
    // Text search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.location.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Make filter
    if (filters.make.length > 0 && !filters.make.includes(vehicle.make)) {
      return false;
    }

    // State filter
    if (filters.state.length > 0 && !filters.state.includes(vehicle.state)) {
      return false;
    }

    // Transmission filter
    if (filters.transmission.length > 0 && !filters.transmission.includes(vehicle.transmission)) {
      return false;
    }

    // Fuel type filter
    if (filters.fuelType.length > 0 && !filters.fuelType.includes(vehicle.fuelType)) {
      return false;
    }

    // Condition filter
    if (filters.condition.length > 0 && !filters.condition.includes(vehicle.condition)) {
      return false;
    }

    // Price range filter
    if (vehicle.price < filters.priceRange[0] || vehicle.price > filters.priceRange[1]) {
      return false;
    }

    // Verified only filter
    if (filters.verifiedOnly && !vehicle.verified) {
      return false;
    }

    return true;
  });

  // Count active filters
  const activeFilterCount = () => {
    let count = 0;
    if (filters.make.length > 0) count++;
    if (filters.state.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.fuelType.length > 0) count++;
    if (filters.condition.length > 0) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999) count++;
    if (filters.verifiedOnly) count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient - Collapses on scroll */}
      <Header
        onMenuPress={() => setIsMenuOpen(true)}
        onNotificationPress={() => console.log('Notifications pressed')}
        scrollY={scrollY}
      />

      {/* Slide-out Menu */}
      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpen={() => setIsMenuOpen(true)}
        onNavigate={(screen) => {
          if (screen === 'Messages') {
            navigation.navigate('ConversationList');
          } else if (screen === 'Home') {
            // Already on Home
          } else {
            console.log('Navigate to:', screen);
          }
        }}
        userName="John Dealer"
        userType="dealer"
        activeScreen="Home"
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={setFilters}
        initialFilters={filters}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={setNotificationsEnabled}
      />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Page Title - Centered */}
        <View style={styles.titleSection}>
          <Text variant="h2" weight="bold" align="center">
            Marketplace
          </Text>
          <Text variant="caption" color="textTertiary" align="center">
            Verified wholesale vehicles
          </Text>
        </View>
        <Spacer size="lg" />

        {/* Search Bar with Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vehicles..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, activeFilterCount() > 0 && styles.filterButtonActive]}
            onPress={() => setIsFilterOpen(true)}
          >
            <Ionicons name="options-outline" size={18} color={Colors.white} />
            {activeFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text variant="label" style={styles.filterBadgeText}>
                  {activeFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Spacer size="lg" />

        {/* Results Count */}
        <Text variant="caption" color="textTertiary" style={{ marginBottom: Spacing.sm }}>
          {filteredVehicles.length} vehicles available
        </Text>
        <Spacer size="xs" />

        {/* Vehicle Listings */}
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => navigation.navigate('VehicleDetails', { vehicleId: vehicle.id })}
              isFavorite={favorites.has(vehicle.id)}
              onFavoritePress={() => toggleFavorite(vehicle.id)}
              onMessagePress={() => navigation.navigate('Messages', { vehicleId: vehicle.id })}
              onSharePress={() => console.log('Share vehicle:', vehicle.id)}
            />
          ))
        ) : (
          <EmptyState />
        )}

        <Spacer size="xl" />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },

  // Title Section - Enhanced for better hierarchy and centered for mobile
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  // Search Bar - Improved with brand colors
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: responsive.getFontSize('lg'),
    color: Colors.text,
    paddingVertical: 2,
    fontFamily: Typography.fontFamily.vesperLibre,
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.secondary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: responsive.getFontSize('sm'),
    fontWeight: '600',
  },

  // Vehicle Card - Modern redesigned layout
  vehicleCardWrapper: {
    marginBottom: Spacing['2xl'],
    paddingTop: 48,
  },
  vehicleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    overflow: 'visible',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  vehicleImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -68,
    zIndex: 2,
  },
  vehicleImage: {
    width: '100%',
    height: 240,
    backgroundColor: 'transparent',
  },
  vehicleDetails: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },

  // Actions Row - Top right aligned
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },

  // Vehicle Title Section
  vehicleTitleSection: {
    gap: 4,
  },
  titleText: {
    flex: 1,
  },
  verifiedBadgeIcon: {
    width: 18,
    height: 18,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  // Price Section - Two columns
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  priceDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
  },

  // Specs Row - Bigger icons for mobile visibility
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  specPill: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  specPillIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  specPillLabel: {
    marginTop: 2,
    textTransform: 'capitalize',
    // fontSize handled by Text component variant
  },
  specPillValue: {
    fontWeight: '500',
    // fontSize handled by Text component variant
  },

  // Card Actions - Compact modern style (top-right placement)
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: Colors.white,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonActive: {
    backgroundColor: Colors.accent + '15',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
});
