/**
 * HomeScreen Component
 *
 * Mobile-first automotive marketplace dashboard.
 * Displays vehicle listings with filtering and search capabilities.
 *
 * @example
 * <Stack.Screen name="Home" component={HomeScreen} />
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius, Shadows } from '../design-system/primitives';

// Data
import {
  Vehicle,
  VEHICLES,
  getVehicleImage,
  formatCompactPrice,
  formatMileage,
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
 * Vehicle card action buttons (heart, share, message)
 */
const CardActions: React.FC = () => (
  <View style={styles.cardActionsRow}>
    <TouchableOpacity style={styles.actionButtonBottom}>
      <Ionicons name="heart-outline" size={24} color={Colors.text} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButtonBottom}>
      <Ionicons name="share-social-outline" size={24} color={Colors.text} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButtonBottom}>
      <Ionicons name="chatbubble-outline" size={24} color={Colors.text} />
    </TouchableOpacity>
  </View>
);

/**
 * Vehicle stats grid (3x3 layout)
 */
const StatsGrid: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => (
  <View style={styles.statsGrid}>
    {/* Row 1: Pricing */}
    <View style={styles.statsRow}>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Trade Price</Text>
        <Text variant="bodySmall" weight="bold" style={{ color: Colors.primary }}>
          {formatCompactPrice(vehicle.tradePrice)}
        </Text>
      </View>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Retail Price</Text>
        <Text variant="bodySmall" weight="bold" style={{ color: Colors.primary }}>
          {formatCompactPrice(vehicle.retailPrice)}
        </Text>
      </View>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Over Trade</Text>
        <Text variant="bodySmall" weight="bold" style={{ color: Colors.warning }}>
          {formatCompactPrice(vehicle.overTrade)}
        </Text>
      </View>
    </View>

    {/* Row 2: Vehicle Details */}
    <View style={styles.statsRow}>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Age</Text>
        <Text variant="bodySmall" weight="medium" color="text">
          {vehicle.age}y
        </Text>
      </View>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Kms</Text>
        <Text variant="bodySmall" weight="medium" style={{ color: '#007AFF' }}>
          {formatMileage(vehicle.mileage)}
        </Text>
      </View>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Trans</Text>
        <Text variant="bodySmall" weight="medium" color="text">
          {vehicle.transmission === 'automatic' ? 'Auto' : 'Manual'}
        </Text>
      </View>
    </View>

    {/* Row 3: Seller Info */}
    <View style={styles.statsRow}>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Seller</Text>
        <Text variant="bodySmall" weight="medium" color="text">
          {vehicle.sellerType}
        </Text>
      </View>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Fuel</Text>
        <Text variant="bodySmall" weight="medium" color="text" style={{ textTransform: 'capitalize' }}>
          {vehicle.fuelType}
        </Text>
      </View>
      <View style={styles.statCell}>
        <Text variant="caption" color="textTertiary">Location</Text>
        <Text variant="bodySmall" weight="medium" color="text">
          {vehicle.state}
        </Text>
      </View>
    </View>
  </View>
);

/**
 * Individual vehicle card
 */
interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => (
  <View style={styles.vehicleCardWrapper}>
    <TouchableOpacity style={styles.vehicleCard} activeOpacity={0.7} onPress={onPress}>
      {/* Vehicle Image */}
      <View style={styles.vehicleImageContainer}>
        <Image
          source={getVehicleImage(vehicle.imageKey)}
          style={styles.vehicleImage}
          resizeMode="contain"
        />
      </View>

      {/* Vehicle Details */}
      <View style={styles.vehicleDetails}>
        <CardActions />
        <Spacer size="sm" />

        {/* Title with Verified Badge */}
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleTitleSection}>
            <Text variant="body" weight="bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
              {vehicle.verified && '  '}
              {vehicle.verified && (
                <Image
                  source={VERIFIED_BADGE}
                  style={styles.verifiedBadgeInline}
                  resizeMode="contain"
                />
              )}
            </Text>
            {vehicle.variant && (
              <Text variant="caption" color="textTertiary">
                {vehicle.variant}
              </Text>
            )}
          </View>
        </View>

        <Spacer size="sm" />
        <StatsGrid vehicle={vehicle} />
      </View>
    </TouchableOpacity>
  </View>
);

/**
 * Empty state when no vehicles match filters
 */
const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Text variant="h2">🔍</Text>
    <Spacer size="md" />
    <Text variant="h4" color="textTertiary" align="center">
      No vehicles found
    </Text>
    <Spacer size="sm" />
    <Text variant="bodySmall" color="textTertiary" align="center">
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
      {/* Header with Gradient */}
      <Header
        onMenuPress={() => setIsMenuOpen(true)}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      {/* Slide-out Menu */}
      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpen={() => setIsMenuOpen(true)}
        onNavigate={(screen) => console.log('Navigate to:', screen)}
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Title - Centered */}
        <View style={styles.titleSection}>
          <Text variant="h2" weight="bold" align="center">
            Marketplace
          </Text>
          <Text variant="bodySmall" color="textTertiary" align="center">
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
                <Text variant="caption" style={styles.filterBadgeText}>
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
            />
          ))
        ) : (
          <EmptyState />
        )}

        <Spacer size="xl" />
      </ScrollView>
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
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 2,
    fontFamily: 'VesperLibre',
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
    fontSize: 10,
    fontWeight: '600',
  },

  // Vehicle Card - Enhanced with better elevation and spacing
  vehicleCardWrapper: {
    marginBottom: Spacing['2xl'],
    paddingTop: 48,
  },
  vehicleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    overflow: 'visible',
    ...Shadows.lg,
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
    paddingTop: Spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleTitleSection: {
    flex: 1,
  },
  verifiedBadgeInline: {
    width: 24,
    height: 24,
    marginBottom: -4,
  },

  // Card Actions - Improved spacing
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  actionButtonBottom: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    width: 40,
    height: 40,
  },

  // Stats Grid
  statsGrid: {
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statCell: {
    flex: 1,
    alignItems: 'flex-start',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
});
