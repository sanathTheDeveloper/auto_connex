/**
 * HomeScreen Component
 *
 * Mobile-first automotive marketplace dashboard.
 * Displays vehicle listings with filtering and search capabilities.
 * Features redesigned vehicle cards with background images and streamlined info.
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
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

// Components
import { Header, DrawerMenu, FilterModal, DEFAULT_FILTERS } from '../components';
import { LicenseVerificationBanner } from '../components/LicenseVerificationBanner';
import { WeeklyPurchaseProgress } from '../components/WeeklyPurchaseProgress';
import { BudgetSettingsModal } from '../components/BudgetSettingsModal';
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
  getVehicleBackgroundImage,
  formatFullPrice,
  formatMileage,
} from '../data/vehicles';

// Context
import { useFavorites } from '../contexts/FavoritesContext';

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
        size={18}
        color={isFavorite ? Colors.white : Colors.accent}
      />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onSharePress} activeOpacity={0.7}>
      <Ionicons name="share-social-outline" size={18} color={Colors.text} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onMessagePress} activeOpacity={0.7}>
      <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
    </TouchableOpacity>
  </View>
);

/**
 * Compact spec item for vehicle details
 */
interface SpecItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}

const SpecItem: React.FC<SpecItemProps> = ({ icon, value }) => (
  <View style={styles.specItem}>
    <Ionicons name={icon} size={14} color={Colors.textMuted} />
    <Text variant="caption" style={styles.specItemText}>{value}</Text>
  </View>
);

/**
 * Individual vehicle card - Redesigned with background images
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
  <TouchableOpacity
    style={styles.vehicleCard}
    onPress={onPress}
    activeOpacity={0.98}
  >
    {/* Vehicle Image with Background */}
    <ImageBackground
      source={getVehicleBackgroundImage(vehicle.backgroundImageIndex)}
      style={styles.vehicleImageBackground}
      imageStyle={styles.vehicleImageStyle}
    >
      {/* Subtle gradient overlay */}
      <View style={styles.imageOverlay} />

      {/* Actions - Top right */}
      <View style={styles.imageActionsContainer}>
        <CardActions
          isFavorite={isFavorite}
          onFavoritePress={onFavoritePress}
          onMessagePress={onMessagePress}
          onSharePress={onSharePress}
        />
      </View>
    </ImageBackground>

    {/* Vehicle Details */}
    <View style={styles.vehicleDetails}>
      {/* Title Row with Verified Badge - Inline */}
      <View style={styles.titleContainer}>
        <Text variant="body" weight="bold" style={styles.vehicleTitle}>
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
          {vehicle.verified && (
            <Text style={styles.verifiedBadgeWrapper}>
              {' '}<Image source={VERIFIED_BADGE} style={styles.verifiedBadgeInline} />
            </Text>
          )}
        </Text>
      </View>

      {/* Location & Dealer */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
        <Text variant="caption" style={styles.locationText}>
          {vehicle.suburb}, {vehicle.state}
        </Text>
        <View style={styles.dotSeparator} />
        <Text variant="caption" style={styles.dealerName}>{vehicle.dealerName}</Text>
      </View>

      {/* Specs Row - includes all badges */}
      <View style={styles.specsRow}>
        <SpecItem icon="speedometer-outline" value={formatMileage(vehicle.mileage)} />
        <SpecItem icon="cog-outline" value={vehicle.transmission === 'automatic' ? 'Auto' : 'Manual'} />
        <SpecItem icon="flash-outline" value={vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)} />
        <SpecItem icon="color-palette-outline" value={vehicle.color} />
        {vehicle.hasLogbook && (
          <View style={styles.logbookBadgeInline}>
            <Ionicons name="book" size={12} color={Colors.success} />
            <Text variant="caption" style={styles.logbookBadgeTextInline}>Logbook</Text>
          </View>
        )}
      </View>

      {/* Footer with Price and View Details */}
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text variant="caption" style={styles.priceLabel}>Asking Price</Text>
          <Text variant="h4" weight="bold" style={styles.priceValue}>
            {formatFullPrice(vehicle.askingPrice || vehicle.price)}
          </Text>
        </View>
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress} activeOpacity={0.7}>
          <Text variant="bodySmall" weight="semibold" style={styles.viewDetailsText}>
            View Details
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

/**
 * Empty state when no vehicles match filters
 */
const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
    <Spacer size="md" />
    <Text variant="h4" weight="semibold" color="textMuted" align="center">
      No vehicles found
    </Text>
    <Spacer size="sm" />
    <Text variant="body" color="textMuted" align="center">
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

  // License verification banner state
  const [showLicenseBanner, setShowLicenseBanner] = useState(true);

  // Budget settings modal state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [weeklyBudget, setWeeklyBudget] = useState(200000); // Default $200,000 budget

  // Mock weekly purchase data
  const weeklyPurchaseData = {
    amountSpent: 125000,
    vehicleCount: 3,
    daysRemaining: 4,
  };

  // Favorites from shared context (persisted)
  const { toggleFavorite, isFavorite } = useFavorites();

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
        vehicle.location.toLowerCase().includes(query) ||
        vehicle.suburb.toLowerCase().includes(query) ||
        vehicle.dealerName.toLowerCase().includes(query);
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
      {/* Header with solid Primary color - Collapses on scroll */}
      <Header
        onMenuPress={() => setIsMenuOpen(true)}
        onNotificationPress={() => console.log('Notifications pressed')}
        scrollY={scrollY}
      />

      {/* License Verification Banner - Dismissible */}
      <LicenseVerificationBanner
        visible={showLicenseBanner}
        onDismiss={() => setShowLicenseBanner(false)}
      />

      {/* Slide-out Menu */}
      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpen={() => setIsMenuOpen(true)}
        onNavigate={(screen) => {
          if (screen === 'Messages') {
            navigation.navigate('ConversationList');
          } else if (screen === 'SavedVehicles') {
            navigation.navigate('SavedVehicles');
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

      {/* Budget Settings Modal */}
      <BudgetSettingsModal
        visible={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={weeklyBudget}
        onSaveBudget={setWeeklyBudget}
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
        {/* Weekly Purchase Progress */}
        <WeeklyPurchaseProgress
          amountSpent={weeklyPurchaseData.amountSpent}
          vehicleCount={weeklyPurchaseData.vehicleCount}
          daysRemaining={weeklyPurchaseData.daysRemaining}
          budget={weeklyBudget}
          onSettingsPress={() => setIsBudgetModalOpen(true)}
        />

        <Spacer size="lg" />

        {/* Search Bar with Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vehicles, dealers..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
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

        <Spacer size="md" />

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text variant="bodySmall" weight="semibold" color="text">
            {filteredVehicles.length} vehicles
          </Text>
          <Text variant="caption" color="textMuted">
            Available now
          </Text>
        </View>

        <Spacer size="md" />

        {/* Vehicle Listings */}
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => navigation.navigate('VehicleDetails', { vehicleId: vehicle.id })}
              isFavorite={isFavorite(vehicle.id)}
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
    backgroundColor: '#EBEEF2',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: responsive.getFontSize('base'),
    color: Colors.text,
    paddingVertical: 2,
    fontFamily: Typography.fontFamily.vesperLibre,
  },
  filterButton: {
    width: 44,
    height: 44,
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
    minWidth: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: responsive.getFontSize('xs'),
    fontWeight: '700',
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  // Vehicle Card - Clean modern design
  vehicleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleImageBackground: {
    width: '100%',
    height: 240,
    justifyContent: 'flex-start',
  },
  vehicleImageStyle: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  imageActionsContainer: {
    alignItems: 'flex-end',
    padding: Spacing.sm,
  },
  // Logbook badge - inline with other specs
  logbookBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  logbookBadgeTextInline: {
    color: Colors.success,
    fontWeight: '600',
  },
  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    color: Colors.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    color: Colors.text,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  viewDetailsText: {
    color: Colors.white,
  },

  // Vehicle Details Section
  vehicleDetails: {
    padding: Spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vehicleTitle: {
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  verifiedBadgeWrapper: {
    lineHeight: 22,
  },
  verifiedBadgeInline: {
    width: 16,
    height: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  locationText: {
    color: Colors.textMuted,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 4,
  },
  dealerName: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    gap: 6,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  specItemText: {
    color: '#555',
  },

  // Card Actions
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonActive: {
    backgroundColor: Colors.accent,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
});
