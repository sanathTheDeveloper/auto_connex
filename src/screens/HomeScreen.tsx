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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

type TabType = 'browse' | 'my-listings' | 'saved';
type FilterType = 'all' | 'verified' | 'featured';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Header with search and navigation
 */
const Header: React.FC<{ vehicleCount: number }> = ({ vehicleCount }) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Spacer size="sm" />
        <TouchableOpacity style={styles.sourcingDropdown}>
          <Text variant="body" weight="bold">Sourcing</Text>
          <Spacer size="xs" />
          <Ionicons name="chevron-down" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Spacer size="sm" />
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.vehicleCountBar}>
      <Text variant="bodySmall" color="textTertiary">
        {vehicleCount} vehicles available
      </Text>
    </View>
  </View>
);

/**
 * Tab navigation component
 */
const TabBar: React.FC<{
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs: { key: TabType; label: string }[] = [
    { key: 'browse', label: 'Browse All' },
    { key: 'my-listings', label: 'My Listings' },
    { key: 'saved', label: 'Saved' },
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[styles.tab, activeTab === key && styles.tabActive]}
          onPress={() => onTabChange(key)}
        >
          <Text
            variant="bodySmall"
            weight={activeTab === key ? 'bold' : 'regular'}
            color={activeTab === key ? 'primary' : 'text'}
          >
            {label}
          </Text>
          {activeTab === key && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Filter chips component
 */
const FilterChips: React.FC<{
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalCount: number;
}> = ({ selectedFilter, onFilterChange, totalCount }) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `All (${totalCount})` },
    { key: 'verified', label: '✓ Verified' },
    { key: 'featured', label: '⭐ Featured' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {filters.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[styles.filterChip, selectedFilter === key && styles.filterChipActive]}
          onPress={() => onFilterChange(key)}
        >
          <Text
            variant="caption"
            weight="medium"
            color={selectedFilter === key ? 'background' : 'text'}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

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
const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => (
  <View style={styles.vehicleCardWrapper}>
    <TouchableOpacity style={styles.vehicleCard} activeOpacity={0.7}>
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
            <View style={styles.titleRow}>
              <Text variant="body" weight="bold" numberOfLines={1}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
              {vehicle.verified && (
                <Image
                  source={VERIFIED_BADGE}
                  style={styles.verifiedBadgeInline}
                  resizeMode="contain"
                />
              )}
            </View>
            {vehicle.variant && (
              <Text variant="caption" color="textTertiary" numberOfLines={1}>
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

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Filter vehicles based on search and filter selection
  const filteredVehicles = VEHICLES.filter((vehicle) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'verified' && vehicle.verified) ||
      (selectedFilter === 'featured' && vehicle.featured);

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header vehicleCount={filteredVehicles.length} />
        <Spacer size="md" />

        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <Spacer size="md" />

        <FilterChips
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          totalCount={VEHICLES.length}
        />
        <Spacer size="lg" />

        <Text variant="caption" color="text">
          {filteredVehicles.length} vehicles found
        </Text>
        <Spacer size="md" />

        {/* Vehicle Listings */}
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
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
    paddingBottom: Spacing['2xl'],
  },

  // Header
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: Spacing.sm,
  },
  sourcingDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleCountBar: {
    paddingVertical: Spacing.xs,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
  },

  // Filters
  filtersContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },

  // Vehicle Card
  vehicleCardWrapper: {
    marginBottom: Spacing.xl,
    paddingTop: 40,
  },
  vehicleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'visible',
    ...Shadows.md,
  },
  vehicleImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
    zIndex: 2,
  },
  vehicleImage: {
    width: '100%',
    height: 220,
    backgroundColor: 'transparent',
  },
  vehicleDetails: {
    padding: Spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleTitleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 6,
  },
  verifiedBadgeInline: {
    width: 22,
    height: 22,
    marginTop: -1,
  },

  // Card Actions
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  actionButtonBottom: {
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
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
