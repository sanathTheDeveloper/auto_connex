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
const APP_ICON = require('../../assets/logos/app-icon-teal.png');
const LOGO_LOCKUP = require('../../assets/logos/logo-lockup-teal.png');

// ============================================================================
// TYPES
// ============================================================================


// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Header with app icon and logo lockup
 * Clean, modern design following brand guidelines
 */
const Header: React.FC = () => (
  <View style={styles.header}>
    {/* Left: Menu icon */}
    <TouchableOpacity style={styles.headerIconButton}>
      <Ionicons name="menu-outline" size={24} color={Colors.text} />
    </TouchableOpacity>

    {/* Center: Brand */}
    <View style={styles.headerBrand}>
      <Image source={APP_ICON} style={styles.appIcon} resizeMode="contain" />
      <Image source={LOGO_LOCKUP} style={styles.logoLockup} resizeMode="contain" />
    </View>

    {/* Right: Notification & Settings */}
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.headerIconButton}>
        <Ionicons name="notifications-outline" size={22} color={Colors.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerIconButton}>
        <Ionicons name="settings-outline" size={22} color={Colors.text} />
      </TouchableOpacity>
    </View>
  </View>
);

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

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter vehicles based on search query
  const filteredVehicles = VEHICLES.filter((vehicle) => {
    if (searchQuery.trim() === '') return true;

    const query = searchQuery.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.location.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header />
        <Spacer size="md" />

        {/* Search Bar with Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vehicles..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <Spacer size="md" />

        <Text variant="caption" color="textTertiary">
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBrand: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  logoLockup: {
    width: 130,
    height: 32,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: Spacing.xs,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
  verifiedBadgeInline: {
    width: 24,
    height: 24,
    marginBottom: -4,
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
