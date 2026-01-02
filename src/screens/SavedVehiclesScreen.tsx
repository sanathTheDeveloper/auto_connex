/**
 * SavedVehiclesScreen Component
 *
 * Displays all favorited vehicles from the user's favorites.
 * Uses the FavoritesContext to get and manage favorites.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ImageBackground,
  Dimensions,
  ScaledSize,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

// Design System
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, SpacingMobile, BorderRadius, Shadows } from '../design-system/primitives';

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

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

type SavedVehiclesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SavedVehicles'>;

interface SavedVehiclesScreenProps {
  navigation: SavedVehiclesScreenNavigationProp;
}

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
 * Card action buttons
 */
interface CardActionsProps {
  onRemovePress: () => void;
  onSharePress?: () => void;
  onMessagePress?: () => void;
}

const CardActions: React.FC<CardActionsProps> = ({
  onRemovePress,
  onSharePress,
  onMessagePress
}) => (
  <View style={styles.cardActionsRow}>
    <TouchableOpacity
      style={[styles.actionButton, styles.actionButtonActive]}
      onPress={onRemovePress}
      activeOpacity={0.7}
    >
      <Ionicons name="heart" size={18} color={Colors.white} />
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
 * Vehicle card for saved vehicles
 */
interface SavedVehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  onRemovePress: () => void;
  onMessagePress: () => void;
  onSharePress: () => void;
}

const SavedVehicleCard: React.FC<SavedVehicleCardProps> = ({
  vehicle,
  onPress,
  onRemovePress,
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
          onRemovePress={onRemovePress}
          onMessagePress={onMessagePress}
          onSharePress={onSharePress}
        />
      </View>
    </ImageBackground>

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

      {/* Location & Dealer */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
        <Text variant="caption" style={styles.locationText}>
          {vehicle.suburb}, {vehicle.state}
        </Text>
        <View style={styles.dotSeparator} />
        <Text variant="caption" style={styles.dealerName}>{vehicle.dealerName}</Text>
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
 * Empty state when no saved vehicles
 */
const EmptyState: React.FC<{ onBrowsePress: () => void }> = ({ onBrowsePress }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="heart-outline" size={64} color={Colors.textMuted} />
    </View>
    <Spacer size="lg" />
    <Text variant="h4" weight="semibold" color="text" align="center">
      No Favorites Yet
    </Text>
    <Spacer size="sm" />
    <Text variant="body" color="textMuted" align="center">
      Tap the heart icon on any vehicle to save it here for quick access
    </Text>
    <Spacer size="xl" />
    <TouchableOpacity style={styles.browseButton} onPress={onBrowsePress} activeOpacity={0.8}>
      <Ionicons name="car-sport-outline" size={20} color={Colors.white} />
      <Text variant="bodySmall" weight="semibold" style={styles.browseButtonText}>
        Browse Vehicles
      </Text>
    </TouchableOpacity>
  </View>
);

export default function SavedVehiclesScreen({ navigation }: SavedVehiclesScreenProps) {
  const { favorites, toggleFavorite, getFavoriteCount } = useFavorites();
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Listen for viewport changes (for web browser resize/inspect mode)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Responsive values
  const responsivePadding = getResponsiveSpacing('lg', viewportWidth);
  const responsiveGap = getResponsiveSpacing('md', viewportWidth);

  // Get saved vehicles from VEHICLES data
  const savedVehicles = VEHICLES.filter(vehicle => favorites.has(vehicle.id));
  const savedCount = getFavoriteCount();

  const handleBack = () => navigation.goBack();
  const handleBrowse = () => navigation.navigate('Home');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text variant="h4" weight="bold">Favorites</Text>
          {savedCount > 0 && (
            <View style={styles.countBadge}>
              <Text variant="caption" style={styles.countBadgeText}>{savedCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {savedVehicles.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {savedVehicles.map((vehicle) => (
            <SavedVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => navigation.navigate('VehicleDetails', { vehicleId: vehicle.id })}
              onRemovePress={() => toggleFavorite(vehicle.id)}
              onMessagePress={() => navigation.navigate('Messages', { vehicleId: vehicle.id })}
              onSharePress={() => console.log('Share vehicle:', vehicle.id)}
            />
          ))}
          <Spacer size="xl" />
        </ScrollView>
      ) : (
        <EmptyState onBrowsePress={handleBrowse} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEF2',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countBadge: {
    backgroundColor: Colors.accent,
    minWidth: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },

  // Vehicle Card Styles (matching HomeScreen)
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

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  browseButtonText: {
    color: Colors.white,
  },
});
