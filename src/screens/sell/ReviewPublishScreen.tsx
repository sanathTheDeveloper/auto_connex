/**
 * ReviewPublishScreen
 *
 * Step 7 of the Sell Vehicle flow.
 * Final review of all listing details before publishing.
 * Clean, modern design for mobile web view.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  Alert,
  Dimensions,
  ScaledSize,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

// Design System
import { Text, Spacer, Button, ProgressBar } from '../../design-system';
import { Colors, Spacing, SpacingMobile, BorderRadius, Shadows } from '../../design-system/primitives';

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

// Helper functions
const formatMileage = (mileage: number): string => {
  return `${(mileage / 1000).toFixed(0)}k km`;
};

const formatFullPrice = (price: number): string => {
  return `$${price.toLocaleString('en-AU')}`;
};

// Context
import { useSell } from '../../contexts/SellContext';
import { useMyListings } from '../../contexts/MyListingsContext';

type ReviewPublishScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReviewPublish'
>;

interface ReviewPublishScreenProps {
  navigation: ReviewPublishScreenNavigationProp;
}

export const ReviewPublishScreen: React.FC<ReviewPublishScreenProps> = ({ navigation }) => {
  const { listingData, clearDraft, resetFlow } = useSell();
  const { addListing } = useMyListings();
  const [isPublishing, setIsPublishing] = useState(false);

  // Viewport state for responsive design
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

  const { vehicleDetails, photos, conditionReport, afterMarketExtras, writeOff, pricing, pickupLocation } =
    listingData;

  // Handle publish
  const handlePublish = useCallback(async () => {
    setIsPublishing(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add listing to MyListings storage
      await addListing(listingData);

      // Clear the draft
      await clearDraft();

      // Reset flow and navigate to MyListings
      resetFlow();
      
      // Navigate immediately to MyListings
      navigation.reset({
        index: 0,
        routes: [{ name: 'MyListings' }],
      });

      // Show success alert after navigation (web-compatible)
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Listing Published!',
          'Your vehicle has been successfully listed on the marketplace.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to publish listing. Please try again.');
      setIsPublishing(false);
    }
  }, [listingData, addListing, clearDraft, resetFlow, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const totalExtrasValue = afterMarketExtras.reduce((sum, extra) => sum + extra.cost, 0);
  const totalConditionItems = conditionReport.pros.length + conditionReport.cons.length + conditionReport.defects.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={styles.headerTitle}>
          Review Listing
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <ProgressBar 
          currentStep={7} 
          totalSteps={7} 
          stepLabel="Final Review"
          variant="minimal"
        />

        <Spacer size="sm" />

        {/* Vehicle Card - Matching HomeScreen VehicleCard Design */}
        {vehicleDetails && (
          <View style={styles.vehicleCard}>
            {/* Vehicle Image */}
            <View style={styles.vehicleImageContainer}>
              {photos.length > 0 ? (
                <ImageBackground
                  source={{ uri: photos[0] }}
                  style={styles.vehicleImageBackground}
                  imageStyle={styles.vehicleImageStyle}
                >
                  <View style={styles.imageOverlay} />
                </ImageBackground>
              ) : (
                <View style={styles.noImagePlaceholder}>
                  <Ionicons name="car-outline" size={48} color={Colors.textMuted} />
                  <Text variant="caption" color="textMuted">No photos added</Text>
                </View>
              )}
            </View>

            {/* Vehicle Details */}
            <View style={styles.vehicleDetails}>
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text variant="body" weight="bold" style={styles.vehicleTitle}>
                  {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model} {vehicleDetails.variant}
                </Text>
              </View>

              {/* Location Row */}
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                <Text variant="caption" style={styles.locationText}>
                  {pickupLocation.suburb}, {pickupLocation.state}
                </Text>
                <View style={styles.dotSeparator} />
                <Text variant="caption" style={styles.dealerName}>Your Listing</Text>
              </View>

              {/* Specs Row */}
              <View style={styles.specsRow}>
                <View style={styles.specItem}>
                  <Ionicons name="speedometer-outline" size={14} color={Colors.textMuted} />
                  <Text variant="caption" style={styles.specItemText}>
                    {formatMileage(vehicleDetails.mileage)}
                  </Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="cog-outline" size={14} color={Colors.textMuted} />
                  <Text variant="caption" style={styles.specItemText}>
                    {vehicleDetails.transmission === 'automatic' ? 'Auto' : 'Manual'}
                  </Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="flash-outline" size={14} color={Colors.textMuted} />
                  <Text variant="caption" style={styles.specItemText}>
                    {vehicleDetails.fuelType.charAt(0).toUpperCase() + vehicleDetails.fuelType.slice(1)}
                  </Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="color-palette-outline" size={14} color={Colors.textMuted} />
                  <Text variant="caption" style={styles.specItemText}>
                    {vehicleDetails.color || 'N/A'}
                  </Text>
                </View>
                {vehicleDetails.hasLogbook && (
                  <View style={styles.logbookBadge}>
                    <Ionicons name="book" size={12} color={Colors.success} />
                    <Text variant="caption" style={styles.logbookBadgeText}>Logbook</Text>
                  </View>
                )}
              </View>

              {/* Footer with Price and Edit Button */}
              <View style={styles.cardFooter}>
                <View style={styles.priceContainer}>
                  <Text variant="caption" style={styles.priceLabel}>Asking Price</Text>
                  <Text variant="h4" weight="bold" style={styles.priceValue}>
                    {formatFullPrice(pricing.askingPrice)}
                  </Text>
                </View>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => navigation.navigate('Pricing', { fromReview: true })}
                  iconRight="chevron-forward"
                >
                  Edit Price
                </Button>
              </View>
            </View>
          </View>
        )}

        <Spacer size="lg" />

        {/* Photos Section */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('PhotoUpload', { fromReview: true })}
          activeOpacity={0.7}
        >
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Ionicons name="images-outline" size={18} color={Colors.text} />
              <Text variant="bodySmall" weight="semibold">Photos</Text>
            </View>
            <View style={styles.sectionRight}>
              <View style={styles.badge}>
                <Text variant="caption" weight="bold" style={styles.badgeText}>
                  {photos.length}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          </View>
          {photos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosScroll}
              contentContainerStyle={styles.photosContainer}
            >
              {photos.slice(0, 5).map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.photoThumb} />
              ))}
              {photos.length > 5 && (
                <View style={styles.morePhotos}>
                  <Text variant="caption" weight="semibold" color="primary">
                    +{photos.length - 5}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </TouchableOpacity>

        <Spacer size="md" />

        {/* Condition Report */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('ConditionReport', { fromReview: true })}
          activeOpacity={0.7}
        >
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Ionicons name="clipboard-outline" size={18} color={Colors.text} />
              <Text variant="bodySmall" weight="semibold">Condition</Text>
            </View>
            <View style={styles.sectionRight}>
              {totalConditionItems > 0 ? (
                <View style={styles.conditionSummary}>
                  {conditionReport.pros.length > 0 && (
                    <View style={[styles.conditionDot, { backgroundColor: Colors.success }]} />
                  )}
                  {conditionReport.cons.length > 0 && (
                    <View style={[styles.conditionDot, { backgroundColor: Colors.warning }]} />
                  )}
                  {conditionReport.defects.length > 0 && (
                    <View style={[styles.conditionDot, { backgroundColor: Colors.accent }]} />
                  )}
                  <Text variant="caption" color="textMuted" style={styles.conditionCount}>
                    {totalConditionItems} items
                  </Text>
                </View>
              ) : (
                <Text variant="caption" color="textMuted">Not added</Text>
              )}
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          </View>
        </TouchableOpacity>

        <Spacer size="md" />

        {/* After-Market Extras */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('AfterMarketExtras', { fromReview: true })}
          activeOpacity={0.7}
        >
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Ionicons name="construct-outline" size={18} color={Colors.text} />
              <Text variant="bodySmall" weight="semibold">Extras</Text>
            </View>
            <View style={styles.sectionRight}>
              {afterMarketExtras.length > 0 && totalExtrasValue > 0 ? (
                <Text variant="bodySmall" weight="semibold" color="primary">
                  ${totalExtrasValue.toLocaleString('en-AU')}
                </Text>
              ) : (
                <Text variant="label" color="textMuted">None added</Text>
              )}
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
          </View>
        </TouchableOpacity>

        <Spacer size="md" />

        {/* Write-Off Notice */}
        {writeOff.isWriteOff && (
          <>
            <View style={styles.writeOffBanner}>
              <Ionicons name="alert-circle" size={20} color={Colors.warning} />
              <View style={styles.writeOffContent}>
                <Text variant="caption" weight="semibold" style={{ color: Colors.warning }}>
                  Repairable Write-Off
                </Text>
                <Text variant="caption" color="textMuted" numberOfLines={1}>
                  {writeOff.explanation}
                </Text>
              </View>
            </View>
            <Spacer size="md" />
          </>
        )}

        {/* Location */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('Pricing', { fromReview: true })}
          activeOpacity={0.7}
        >
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Ionicons name="location-outline" size={18} color={Colors.text} />
              <Text variant="bodySmall" weight="semibold">Location</Text>
            </View>
            <View style={styles.sectionRight}>
              <Text variant="label" color="textMuted">
                {pickupLocation.suburb}, {pickupLocation.state}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
          </View>
        </TouchableOpacity>

        <Spacer size="md" />

        {/* Vehicle Details */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('VehicleDetailsForm', { fromReview: true })}
          activeOpacity={0.7}
        >
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Ionicons name="car-outline" size={18} color={Colors.text} />
              <Text variant="bodySmall" weight="semibold">Details</Text>
            </View>
            <View style={styles.sectionRight}>
              <Text variant="label" color="textMuted">
                {vehicleDetails?.registration} ({vehicleDetails?.state})
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
          </View>
        </TouchableOpacity>

        <Spacer size="xl" />

        {/* Terms */}
        <Text variant="label" color="textMuted" align="center" style={styles.termsText}>
          By publishing, you confirm that all information is accurate and you have the right to sell this vehicle.
        </Text>

        <Spacer size="lg" />

        {/* Publish Button */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={handlePublish}
          disabled={isPublishing}
          loading={isPublishing}
          iconLeft="rocket"
        >
          Publish Listing
        </Button>

        <Spacer size="2xl" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },

  // Progress
  // Vehicle Card - Matching HomeScreen design
  vehicleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleImageContainer: {
    width: '100%',
    height: 240,
  },
  vehicleImageBackground: {
    width: '100%',
    height: '100%',
  },
  vehicleImageStyle: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
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
  logbookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  logbookBadgeText: {
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  editButtonText: {
    color: Colors.white,
  },

  // Section Card
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.black,
    fontSize: 11,
  },

  // Photos
  photosScroll: {
    marginTop: Spacing.sm,
    marginHorizontal: -Spacing.md,
  },
  photosContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  photoThumb: {
    width: 60,
    height: 45,
    borderRadius: BorderRadius.md,
  },
  morePhotos: {
    width: 60,
    height: 45,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Condition
  conditionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  conditionCount: {
    marginLeft: Spacing.xs,
  },

  // Write-Off
  writeOffBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  writeOffContent: {
    flex: 1,
  },

  // Terms
  termsText: {
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
});

export default ReviewPublishScreen;
