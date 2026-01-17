/**
 * DealerListingsScreen Component
 *
 * Displays all vehicles from a specific dealer/wholesaler.
 * Features dealer info, filtering, sorting, and favorite dealer functionality.
 *
 * @example
 * <Stack.Screen name="DealerListings" component={DealerListingsScreen} />
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  Share,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

// Components
import { FilterModal, DEFAULT_FILTERS, SortModal, SearchBar } from '../components';
import type { FilterOptions, SortOption } from '../components';

// Design System
import { Text } from '../design-system/atoms/Text';
import { Button } from '../design-system/atoms/Button';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../design-system/primitives';

// Data
import {
  getVehiclesByDealer,
  getDealerInfo,
  Vehicle,
  getVehicleBackgroundImage,
  formatFullPrice,
  formatMileage,
} from '../data/vehicles';

// Contexts
import { useFavorites } from '../contexts/FavoritesContext';
import { useFavoriteDealers } from '../contexts/FavoriteDealersContext';

// Assets
const VERIFIED_BADGE = require('../../assets/icons/verified-badge.png');

// ============================================================================
// TYPES
// ============================================================================

type DealerListingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DealerListings'>;
type DealerListingsScreenRouteProp = RouteProp<RootStackParamList, 'DealerListings'>;

interface DealerListingsScreenProps {
  navigation: DealerListingsScreenNavigationProp;
  route: DealerListingsScreenRouteProp;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Vehicle card action buttons (heart, share, message)
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
 * Individual vehicle card component (reused from HomeScreen)
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
    <Image
      source={getVehicleBackgroundImage(vehicle.backgroundImageIndex)}
      style={styles.vehicleImage}
    />

    {/* Actions - Top right */}
    <View style={styles.imageActionsContainer}>
      <CardActions
        isFavorite={isFavorite}
        onFavoritePress={onFavoritePress}
        onMessagePress={onMessagePress}
        onSharePress={onSharePress}
      />
    </View>

    {/* Vehicle Details */}
    <View style={styles.vehicleDetails}>
      {/* Title Row with Verified Badge */}
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

      {/* Location */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
        <Text variant="caption" style={styles.locationText}>
          {vehicle.suburb}, {vehicle.state}
        </Text>
      </View>

      {/* Specs Row */}
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
        <Button
          variant="primary"
          size="sm"
          onPress={onPress}
          iconRight="chevron-forward"
        >
          View Details
        </Button>
      </View>
    </View>
  </TouchableOpacity>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DealerListingsScreen({ navigation, route }: DealerListingsScreenProps) {
  const { dealerName } = route.params;
  
  // Get dealer info and vehicles
  const dealerInfo = getDealerInfo(dealerName);
  const allDealerVehicles = getVehiclesByDealer(dealerName);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Contexts
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleFavoriteDealer, isFavoriteDealer } = useFavoriteDealers();

  const isDealerFavorite = isFavoriteDealer(dealerName);

  // Filter and sort vehicles
  const filteredAndSortedVehicles = useMemo(() => {
    let vehicles = [...allDealerVehicles];

    // Apply search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      vehicles = vehicles.filter(
        (vehicle) =>
          vehicle.make.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.variant?.toLowerCase().includes(query) ||
          vehicle.color.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.make.length > 0) {
      vehicles = vehicles.filter(v => filters.make.includes(v.make));
    }
    if (filters.transmission.length > 0) {
      vehicles = vehicles.filter(v => filters.transmission.includes(v.transmission));
    }
    if (filters.fuelType.length > 0) {
      vehicles = vehicles.filter(v => filters.fuelType.includes(v.fuelType));
    }
    if (filters.condition.length > 0) {
      vehicles = vehicles.filter(v => filters.condition.includes(v.condition));
    }
    if (vehicles.some(v => v.price < filters.priceRange[0] || v.price > filters.priceRange[1])) {
      vehicles = vehicles.filter(v => v.price >= filters.priceRange[0] && v.price <= filters.priceRange[1]);
    }
    if (filters.verifiedOnly) {
      vehicles = vehicles.filter(v => v.verified);
    }

    // Apply sort
    switch (sortOption) {
      case 'price-asc':
        vehicles.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        vehicles.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        vehicles.sort((a, b) => b.year - a.year);
        break;
      case 'oldest':
        vehicles.sort((a, b) => a.year - b.year);
        break;
      case 'mileage-asc':
        vehicles.sort((a, b) => a.mileage - b.mileage);
        break;
    }

    return vehicles;
  }, [allDealerVehicles, searchQuery, filters, sortOption]);

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

  // Handle share dealer
  const handleShareDealer = async () => {
    try {
      await Share.share({
        message: `Check out ${dealerInfo?.businessName || dealerName} on Auto Connex! They have ${dealerInfo?.totalVehicles} vehicles listed.`,
        title: `${dealerName} - Auto Connex`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  // Handle favorite dealer toggle
  const handleFavoriteDealer = () => {
    toggleFavoriteDealer(dealerName);
  };

  if (!dealerInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.textMuted} />
          <Spacer size="md" />
          <Text variant="h3" align="center">Dealer Not Found</Text>
          <Spacer size="sm" />
          <Button variant="primary" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Consistent with other screens */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text variant="h3" weight="bold" style={styles.headerTitle}>
            {dealerName}
          </Text>
          {dealerInfo.verified && (
            <Image source={VERIFIED_BADGE} style={styles.headerBadge} />
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={setFilters}
        initialFilters={filters}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={setNotificationsEnabled}
      />

      {/* Sort Modal */}
      <SortModal
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onApply={setSortOption}
        currentSort={sortOption}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dealer Stats Card */}
        <View style={styles.dealerStatsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
              <Text variant="caption" style={styles.statLabel}>Member since</Text>
              <Text variant="body" weight="semibold" style={styles.statValue}>
                {dealerInfo.memberSince}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="car-outline" size={16} color={Colors.textMuted} />
              <Text variant="caption" style={styles.statLabel}>Total Vehicles</Text>
              <Text variant="body" weight="semibold" style={styles.statValue}>
                {dealerInfo.totalVehicles}
              </Text>
            </View>
          </View>
          <View style={styles.dealerActions}>
            <TouchableOpacity
              style={[styles.dealerActionButton, isDealerFavorite && styles.dealerActionButtonActive]}
              onPress={handleFavoriteDealer}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDealerFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isDealerFavorite ? Colors.white : Colors.accent}
              />
              <Text
                variant="body"
                style={[
                  styles.dealerActionText,
                  isDealerFavorite && styles.dealerActionTextActive
                ]}
              >
                {isDealerFavorite ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dealerActionButton}
              onPress={handleShareDealer}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={20} color={Colors.text} />
              <Text variant="body" style={styles.dealerActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Spacer size="lg" />

        {/* Search Bar with Filter and Sort */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search vehicles..."
          activeFilterCount={activeFilterCount()}
          onFilterPress={() => setIsFilterOpen(true)}
          showSortButton={true}
          onSortPress={() => setIsSortOpen(true)}
        />

        <Spacer size="md" />

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text variant="bodySmall" weight="semibold" color="text">
            {filteredAndSortedVehicles.length} {filteredAndSortedVehicles.length === 1 ? 'vehicle' : 'vehicles'}
          </Text>
        </View>

        <Spacer size="md" />

        {/* Vehicle Listings */}
        {filteredAndSortedVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onPress={() => navigation.navigate('VehicleDetails', { vehicleId: vehicle.id })}
            isFavorite={isFavorite(vehicle.id)}
            onFavoritePress={() => toggleFavorite(vehicle.id)}
            onMessagePress={() => navigation.navigate('Messages', { vehicleId: vehicle.id })}
            onSharePress={() => console.log('Share vehicle:', vehicle.id)}
          />
        ))}

        {filteredAndSortedVehicles.length === 0 && (
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

  // Header - Consistent with PurchasesOffersScreen and AccountScreen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Colors.text,
  },
  headerBadge: {
    width: 18,
    height: 18,
  },
  headerSpacer: {
    width: 40,
  },

  // Dealer Stats Card
  dealerStatsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E8E8',
  },
  statLabel: {
    color: Colors.textMuted,
  },
  statValue: {
    color: Colors.text,
  },
  dealerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dealerActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F5F5F5',
  },
  dealerActionButtonActive: {
    backgroundColor: Colors.accent,
  },
  dealerActionText: {
    color: Colors.text,
  },
  dealerActionTextActive: {
    color: Colors.white,
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  // Vehicle Card (identical to HomeScreen)
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
  vehicleImage: {
    width: '100%',
    height: 240,
  },
  imageActionsContainer: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
