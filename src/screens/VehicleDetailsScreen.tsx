/**
 * VehicleDetailsScreen Component
 *
 * Simple vehicle details view with image carousel, specifications, and seller info.
 * Clean layout following Auto Connex brand guidelines with mobile-first design.
 *
 * Features:
 * - Image carousel with pagination
 * - Price display
 * - Vehicle specifications grid
 * - Seller information
 * - Contact/Inquiry CTAs
 * - Error handling for missing vehicles
 * - Favorite/Share functionality
 *
 * @example
 * navigation.navigate('VehicleDetails', { vehicleId: '1' });
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

// Design System
import { Text, Button, Spacer } from '../design-system';
import { Colors, Spacing, BorderRadius } from '../design-system/primitives';

// Data
import { VEHICLES, getVehicleImage, formatMileage } from '../data/vehicles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = Platform.OS === 'web' ? Math.min(480, SCREEN_WIDTH) : SCREEN_WIDTH;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.65;

// ============================================================================
// TYPES
// ============================================================================

type VehicleDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VehicleDetails'>;
type VehicleDetailsScreenRouteProp = RouteProp<RootStackParamList, 'VehicleDetails'>;

interface VehicleDetailsScreenProps {
  navigation: VehicleDetailsScreenNavigationProp;
  route: VehicleDetailsScreenRouteProp;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({ navigation, route }) => {
  const { vehicleId } = route.params;
  
  // State management
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Memoize vehicle lookup for performance
  const vehicle = useMemo(() => VEHICLES.find((v) => v.id === vehicleId), [vehicleId]);

  // Memoize vehicle images to prevent recreation on re-render
  const vehicleImages = useMemo(() => {
    if (!vehicle) return [];
    return [
      getVehicleImage(vehicle.imageKey),
      getVehicleImage(vehicle.imageKey),
      getVehicleImage(vehicle.imageKey),
    ];
  }, [vehicle]);

  // Handlers with useCallback for performance optimization
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality coming soon!');
  }, []);

  const handleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    // TODO: Persist favorite state to backend/AsyncStorage
  }, []);

  const handleContactSeller = useCallback(() => {
    if (!vehicle) return;
    // TODO: Navigate to contact/messaging screen
    Alert.alert('Contact Seller', `Contact ${vehicle.dealer}`);
  }, [vehicle]);

  const handleSendInquiry = useCallback(() => {
    if (!vehicle) return;
    // TODO: Open inquiry form or navigate to inquiry screen
    Alert.alert('Send Inquiry', `Send inquiry about ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
  }, [vehicle]);

  const handleImageScroll = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / IMAGE_WIDTH);
    setCurrentImageIndex(index);
  }, []);

  // Error state - vehicle not found
  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
          </View>
          <Spacer size="md" />
          <Text variant="h4" weight="semibold">Vehicle not found</Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" color="textTertiary" align="center">
            This vehicle may have been sold or removed from the marketplace
          </Text>
          <Spacer size="lg" />
          <Button variant="primary" size="md" onPress={handleBack}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
              activeOpacity={0.7}
              accessibilityLabel="Share vehicle"
              accessibilityRole="button"
            >
              <Ionicons name="share-social-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, isFavorite && styles.headerButtonFavorite]}
              onPress={handleFavorite}
              activeOpacity={0.7}
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityRole="button"
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? Colors.accent : Colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={[Colors.surface, Colors.backgroundAlt]}
            style={styles.imageGradient}
          >
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
              accessibilityLabel={`Vehicle images, ${currentImageIndex + 1} of ${vehicleImages.length}`}
            >
              {vehicleImages.map((image, index) => (
                <Image
                  key={`vehicle-image-${index}`}
                  source={image}
                  style={styles.vehicleImage}
                  resizeMode="contain"
                  accessibilityLabel={`Vehicle image ${index + 1}`}
                />
              ))}
            </ScrollView>
          </LinearGradient>

          {/* Image Pagination */}
          {vehicleImages.length > 1 && (
            <View style={styles.pagination}>
              {vehicleImages.map((_, index) => (
                <View
                  key={`pagination-${index}`}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                  accessibilityLabel={index === currentImageIndex ? 'Current image' : undefined}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          {/* Vehicle Status Badge */}
          {vehicle.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
              <Text variant="caption" weight="medium" style={{ color: Colors.success }}>
                Verified Vehicle
              </Text>
            </View>
          )}

          <Spacer size="sm" />

          {/* Vehicle Title */}
          <Text variant="h3" weight="bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>

          {/* Variant */}
          {vehicle.variant && (
            <>
              <Spacer size="xs" />
              <Text variant="bodySmall" color="textTertiary">
                {vehicle.variant}
              </Text>
            </>
          )}

          <Spacer size="sm" />

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Ionicons name="speedometer-outline" size={16} color={Colors.textTertiary} />
              <Text variant="bodySmall" color="textTertiary">
                {formatMileage(vehicle.mileage)}
              </Text>
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataItem}>
              <Ionicons name="location-outline" size={16} color={Colors.textTertiary} />
              <Text variant="bodySmall" color="textTertiary">
                {vehicle.location}
              </Text>
            </View>
          </View>

          <Spacer size="xl" />

          {/* Price Card */}
          <View style={styles.priceCard}>
            <Text variant="caption" color="textTertiary">
              Price
            </Text>
            <Spacer size="xs" />
            <Text variant="h2" weight="bold" style={{ color: Colors.primary }}>
              ${vehicle.price.toLocaleString()}
            </Text>
          </View>

          <Spacer size="xl" />

          {/* Specifications Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={20} color={Colors.primary} />
              <Text variant="body" weight="semibold">
                Specifications
              </Text>
            </View>
            <Spacer size="md" />
            <View style={styles.specsList}>
              <SpecRow icon="calendar-outline" label="Year" value={vehicle.year.toString()} />
              <SpecRow icon="car-sport-outline" label="Make" value={vehicle.make} />
              <SpecRow icon="speedometer-outline" label="Model" value={vehicle.model} />
              <SpecRow icon="cog-outline" label="Transmission" value={vehicle.transmission} />
              <SpecRow icon="flash-outline" label="Fuel Type" value={vehicle.fuelType} />
              <SpecRow icon="cube-outline" label="Body Type" value={vehicle.bodyType} />
              <SpecRow icon="color-palette-outline" label="Color" value={vehicle.color} />
              <SpecRow icon="checkmark-circle-outline" label="Condition" value={vehicle.condition} />
            </View>
          </View>

          <Spacer size="lg" />

          {/* Seller Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={Colors.primary} />
              <Text variant="body" weight="semibold">
                Seller Information
              </Text>
            </View>
            <Spacer size="md" />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerRow}>
                <Text variant="bodySmall" color="textTertiary">Dealer</Text>
                <Text variant="bodySmall" weight="medium">{vehicle.dealer}</Text>
              </View>
              <View style={styles.sellerRow}>
                <Text variant="bodySmall" color="textTertiary">Type</Text>
                <Text variant="bodySmall" weight="medium">{vehicle.sellerType}</Text>
              </View>
              <View style={styles.sellerRow}>
                <Text variant="bodySmall" color="textTertiary">Location</Text>
                <Text variant="bodySmall" weight="medium">{vehicle.state}</Text>
              </View>
            </View>
          </View>

          <Spacer size="xl" />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Button
          variant="outline"
          size="md"
          onPress={handleContactSeller}
          style={styles.contactButton}
          accessibilityLabel={`Contact seller ${vehicle.dealer}`}
        >
          Contact Seller
        </Button>
        <Button
          variant="primary"
          size="md"
          onPress={handleSendInquiry}
          style={styles.inquireButton}
          accessibilityLabel="Send inquiry about this vehicle"
        >
          Send Inquiry
        </Button>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * SpecRow Component
 * 
 * Displays a single specification row with icon, label, and value.
 * Memoized to prevent unnecessary re-renders.
 */
interface SpecRowProps {
  icon: string;
  label: string;
  value: string;
}

const SpecRow: React.FC<SpecRowProps> = React.memo(({ icon, label, value }) => (
  <View style={styles.specRow}>
    <View style={styles.specLeft}>
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={Colors.textTertiary}
        accessibilityLabel={`${label} icon`}
      />
      <Text variant="bodySmall" color="textTertiary">
        {label}
      </Text>
    </View>
    <Text variant="bodySmall" weight="medium">
      {value}
    </Text>
  </View>
));

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    // Mobile-first web constraint
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 110, // Space for bottom bar + safe area
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonFavorite: {
    backgroundColor: Colors.accent + '15',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // Image
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    alignSelf: 'center',
  },
  imageGradient: {
    flex: 1,
  },
  vehicleImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.greyscale300,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },

  // Content
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metadataDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },

  // Price Card
  priceCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },

  // Section Card
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // Specifications
  specsList: {
    gap: Spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  specLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // Seller Info
  sellerInfo: {
    gap: Spacing.sm,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  contactButton: {
    flex: 1,
  },
  inquireButton: {
    flex: 1,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VehicleDetailsScreen;
