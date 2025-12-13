/**
 * VehicleDetailsScreen Component (Modern Marketplace Design)
 *
 * Clean, modern vehicle details view with intuitive sections and
 * streamlined price breakdown. Optimized for mobile web devices.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

// Design System
import { Text, Button, Spacer, Accordion } from '../design-system';
import { Colors, Spacing, BorderRadius, Shadows } from '../design-system/primitives';

// Data
import { VEHICLES, getVehicleImage, formatMileage } from '../data/vehicles';

// Assets
const VERIFIED_BADGE = require('../../assets/icons/verified-badge.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_WIDTH = Platform.OS === 'web' ? Math.min(480, SCREEN_WIDTH) : SCREEN_WIDTH;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.75;
const THUMBNAIL_SIZE = 64;

type VehicleDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VehicleDetails'>;
type VehicleDetailsScreenRouteProp = RouteProp<RootStackParamList, 'VehicleDetails'>;

interface VehicleDetailsScreenProps {
  navigation: VehicleDetailsScreenNavigationProp;
  route: VehicleDetailsScreenRouteProp;
}

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({ navigation, route }) => {
  const { vehicleId } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const mainScrollRef = useRef<ScrollView>(null);
  const fullscreenScrollRef = useRef<ScrollView>(null);

  const vehicle = useMemo(() => VEHICLES.find((v) => v.id === vehicleId), [vehicleId]);

  const vehicleImages = useMemo(() => {
    if (!vehicle) return [];
    if (vehicle.images && vehicle.images.length > 0) {
      return vehicle.images.map((imgKey) => getVehicleImage(imgKey));
    }
    return [getVehicleImage(vehicle.imageKey)];
  }, [vehicle]);

  // Calculate total price with extras
  const totalPrice = useMemo(() => {
    if (!vehicle) return 0;
    const extrasTotal = vehicle.afterMarketExtrasDetailed?.reduce((sum, extra) => sum + extra.cost, 0) || 0;
    return vehicle.tradePrice + extrasTotal;
  }, [vehicle]);

  const extrasTotal = useMemo(() => {
    return vehicle?.afterMarketExtrasDetailed?.reduce((sum, extra) => sum + extra.cost, 0) || 0;
  }, [vehicle]);

  // Current display price (offer price or total price)
  const displayPrice = offerPrice !== null ? offerPrice : totalPrice;
  const hasCustomOffer = offerPrice !== null && offerPrice !== totalPrice;

  // Price adjustment increment (1000)
  const PRICE_INCREMENT = 1000;

  const handleIncreasePrice = useCallback(() => {
    const currentPrice = offerPrice !== null ? offerPrice : totalPrice;
    setOfferPrice(currentPrice + PRICE_INCREMENT);
  }, [offerPrice, totalPrice]);

  const handleDecreasePrice = useCallback(() => {
    const currentPrice = offerPrice !== null ? offerPrice : totalPrice;
    const newPrice = currentPrice - PRICE_INCREMENT;
    if (newPrice >= 1000) {
      setOfferPrice(newPrice);
    }
  }, [offerPrice, totalPrice]);

  const handleImageScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / IMAGE_WIDTH);
    setCurrentImageIndex(index);
  }, []);

  const handleFullscreenScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  }, []);

  const handleThumbnailPress = useCallback((index: number) => {
    setCurrentImageIndex(index);
    mainScrollRef.current?.scrollTo({ x: index * IMAGE_WIDTH, animated: true });
  }, []);

  const handleImagePress = useCallback(() => {
    setFullscreenVisible(true);
    setTimeout(() => {
      fullscreenScrollRef.current?.scrollTo({ x: currentImageIndex * SCREEN_WIDTH, animated: false });
    }, 100);
  }, [currentImageIndex]);

  const handleCloseFullscreen = useCallback(() => setFullscreenVisible(false), []);
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleShare = useCallback(() => Alert.alert('Share', 'Share functionality coming soon!'), []);
  const handleFavorite = useCallback(() => setIsFavorite((prev) => !prev), []);
  const handleContactSeller = useCallback(() => {
    if (!vehicle) return;
    Alert.alert('Contact Seller', `Contact ${vehicle.dealer}`);
  }, [vehicle]);

  // Open confirmation modal
  const handleActionPress = useCallback(() => {
    setConfirmModalVisible(true);
  }, []);

  // Close confirmation modal
  const handleCloseConfirmModal = useCallback(() => {
    setConfirmModalVisible(false);
  }, []);

  // Confirm purchase or send offer
  const handleConfirmAction = useCallback(() => {
    if (!vehicle) return;
    setConfirmModalVisible(false);

    if (hasCustomOffer) {
      Alert.alert(
        'Offer Sent',
        `Your offer of $${displayPrice.toLocaleString()} has been sent to ${vehicle.dealer} via messages.`
      );
    } else {
      Alert.alert(
        'Purchase Initiated',
        `Your purchase request for ${vehicle.year} ${vehicle.make} ${vehicle.model} has been sent to ${vehicle.dealer}.`
      );
    }
  }, [vehicle, hasCustomOffer, displayPrice]);

  const formatPPSRDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
          </View>
          <Spacer size="md" />
          <Text variant="body" weight="semibold">Vehicle not found</Text>
          <Spacer size="xs" />
          <Text variant="caption" color="textSecondary" align="center">
            This vehicle may have been sold or removed
          </Text>
          <Spacer size="lg" />
          <Button variant="primary" size="md" onPress={handleBack}>Go Back</Button>
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
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, isFavorite && styles.headerButtonActive]}
              onPress={handleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? Colors.accent : Colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Image Gallery */}
        <View style={styles.imageSection}>
          <TouchableOpacity activeOpacity={0.95} onPress={handleImagePress}>
            <ScrollView
              ref={mainScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
            >
              {vehicleImages.map((image, index) => (
                <Image
                  key={`vehicle-image-${index}`}
                  source={image}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </TouchableOpacity>

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text variant="label" weight="medium" style={styles.imageCounterText}>
              {currentImageIndex + 1}/{vehicleImages.length}
            </Text>
          </View>

          {/* Expand Button */}
          <TouchableOpacity style={styles.expandButton} onPress={handleImagePress} activeOpacity={0.8}>
            <Ionicons name="expand-outline" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Thumbnail Strip */}
        {vehicleImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailStrip}
          >
            {vehicleImages.map((image, index) => (
              <TouchableOpacity
                key={`thumb-${index}`}
                style={[styles.thumbnail, index === currentImageIndex && styles.thumbnailActive]}
                onPress={() => handleThumbnailPress(index)}
                activeOpacity={0.8}
              >
                <Image source={image} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text variant="h4" weight="semibold">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
              {vehicle.verified && (
                <>
                  {'  '}
                  <Image source={VERIFIED_BADGE} style={styles.verifiedBadge} />
                </>
              )}
            </Text>
          </View>

          <Spacer size="xs" />

          {/* Location & Dealer */}
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
            <Text variant="caption" color="textMuted">{vehicle.location}</Text>
            <Text variant="caption" color="textMuted"> • </Text>
            <Text variant="caption" color="textMuted">{vehicle.dealer}</Text>
          </View>

          <Spacer size="md" />

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={18} color={Colors.primary} />
              <Text variant="caption" weight="medium">{formatMileage(vehicle.mileage)}</Text>
            </View>
            {vehicle.registration && (
              <View style={styles.statItem}>
                <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
                <Text variant="caption" weight="medium">{vehicle.registration}</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="color-palette-outline" size={18} color={Colors.primary} />
              <Text variant="caption" weight="medium">{vehicle.color}</Text>
            </View>
          </View>

          <Spacer size="lg" />

          {/* Price Card - Modern Design */}
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text variant="caption" color="textMuted">Asking Price</Text>
              <Text variant="h4" weight="bold" color="secondary">
                ${totalPrice.toLocaleString()}
              </Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.priceDetails}>
              <View style={styles.priceItem}>
                <Text variant="label" color="textMuted">Trade</Text>
                <Text variant="bodySmall" weight="medium">${vehicle.tradePrice.toLocaleString()}</Text>
              </View>
              {extrasTotal > 0 && (
                <View style={styles.priceItem}>
                  <Text variant="label" color="textMuted">Extras</Text>
                  <Text variant="bodySmall" weight="medium" color="secondary">+${extrasTotal.toLocaleString()}</Text>
                </View>
              )}
              <View style={styles.priceItem}>
                <Text variant="label" color="textMuted">Retail Est.</Text>
                <Text variant="bodySmall" weight="medium">${vehicle.retailPrice.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <Spacer size="lg" />

          {/* Accordions Section */}
          <View style={styles.accordionSection}>
            {/* Vehicle Details */}
            <Accordion title="Vehicle Details" icon="car-sport-outline" defaultExpanded={false}>
              <View style={styles.specGrid}>
                <SpecItem label="Year" value={vehicle.year.toString()} />
                <SpecItem label="Make" value={vehicle.make} />
                <SpecItem label="Model" value={vehicle.model} />
                <SpecItem label="Transmission" value={vehicle.transmission} />
                <SpecItem label="Fuel" value={vehicle.fuelType} />
                <SpecItem label="Body" value={vehicle.bodyType} />
                <SpecItem label="Condition" value={vehicle.condition} />
                {vehicle.state && <SpecItem label="State" value={vehicle.state} />}
              </View>
            </Accordion>

            <Spacer size="sm" />

            {/* PPSR Verification */}
            {vehicle.ppsr && (
              <>
                <Accordion title="PPSR Verification" icon="shield-checkmark-outline" defaultExpanded={false}>
                  <View style={styles.ppsrContent}>
                    <View style={styles.ppsrStatus}>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                      <View style={styles.ppsrStatusText}>
                        <Text variant="body" weight="semibold" style={{ color: Colors.success }}>
                          Clear Title
                        </Text>
                        <Text variant="label" color="textMuted">
                          Checked {formatPPSRDate(vehicle.ppsr.checkDate)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.ppsrChecks}>
                      <PPSRItem label="No money owing" passed={!vehicle.ppsr.details.moneyOwing} />
                      <PPSRItem label="Not stolen" passed={!vehicle.ppsr.details.stolen} />
                      <PPSRItem label="Not written off" passed={!vehicle.ppsr.details.writtenOff} />
                      <PPSRItem label="Valid registration" passed={vehicle.ppsr.details.validRegistration} />
                    </View>
                  </View>
                </Accordion>
                <Spacer size="sm" />
              </>
            )}

            {/* Condition Report */}
            {vehicle.conditionReport && (vehicle.conditionReport.pros.length > 0 || vehicle.conditionReport.cons.length > 0) && (
              <>
                <Accordion title="Condition Report" icon="clipboard-outline" defaultExpanded={false}>
                  <View style={styles.conditionContent}>
                    {vehicle.conditionReport.pros.length > 0 && (
                      <View style={styles.conditionGroup}>
                        <Text variant="label" weight="semibold" style={{ color: Colors.success }}>PROS</Text>
                        <Spacer size="xs" />
                        {vehicle.conditionReport.pros.map((item, idx) => (
                          <View key={`pro-${idx}`} style={styles.conditionItem}>
                            <Ionicons name="checkmark" size={14} color={Colors.success} />
                            <Text variant="bodySmall" style={styles.conditionText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {vehicle.conditionReport.cons.length > 0 && (
                      <View style={styles.conditionGroup}>
                        <Text variant="label" weight="semibold" style={{ color: Colors.warning }}>CONS</Text>
                        <Spacer size="xs" />
                        {vehicle.conditionReport.cons.map((item, idx) => (
                          <View key={`con-${idx}`} style={styles.conditionItem}>
                            <Ionicons name="alert" size={14} color={Colors.warning} />
                            <Text variant="bodySmall" style={styles.conditionText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </Accordion>
                <Spacer size="sm" />
              </>
            )}

            {/* Aftermarket Extras */}
            {vehicle.afterMarketExtrasDetailed && vehicle.afterMarketExtrasDetailed.length > 0 && (
              <>
                <Accordion
                  title="Aftermarket Extras"
                  icon="construct-outline"
                  badgeVariant="info"
                  defaultExpanded={false}
                >
                  <View style={styles.extrasContent}>
                    {vehicle.afterMarketExtrasDetailed.map((extra, idx) => (
                      <View key={`extra-${idx}`} style={styles.extraItem}>
                        <View style={styles.extraInfo}>
                          <Text variant="bodySmall" weight="medium">{extra.name}</Text>
                          {extra.category && (
                            <Text variant="label" color="textMuted">
                              {extra.category}
                            </Text>
                          )}
                        </View>
                        <Text variant="bodySmall" weight="semibold" color="primary">
                          ${extra.cost.toLocaleString()}
                        </Text>
                      </View>
                    ))}
                    <View style={styles.extrasTotalRow}>
                      <Text variant="bodySmall" weight="semibold">Total</Text>
                      <Text variant="body" weight="bold" color="primary">
                        ${extrasTotal.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </Accordion>
                <Spacer size="sm" />
              </>
            )}

            {/* Seller Info */}
            <Accordion title="Seller Information" icon="storefront-outline" defaultExpanded={false}>
              <View style={styles.sellerContent}>
                <View style={styles.sellerHeader}>
                  <View style={styles.sellerAvatar}>
                    <Ionicons name="business" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.sellerInfo}>
                    <Text variant="bodySmall" weight="medium">{vehicle.dealer}</Text>
                    <Text variant="label" color="textMuted">{vehicle.sellerType}</Text>
                  </View>
                  {vehicle.sellerDetails?.rating && (
                    <View style={styles.sellerRating}>
                      <Ionicons name="star" size={14} color={Colors.warning} />
                      <Text variant="bodySmall" weight="medium">{vehicle.sellerDetails.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.sellerDetails}>
                  <SpecItem label="Location" value={`${vehicle.location}, ${vehicle.state}`} />
                  {vehicle.sellerDetails?.abn && <SpecItem label="ABN" value={vehicle.sellerDetails.abn} />}
                  {vehicle.sellerDetails?.memberSince && <SpecItem label="Member Since" value={vehicle.sellerDetails.memberSince} />}
                </View>
              </View>
            </Accordion>
          </View>

          <Spacer size="xl" />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Price Adjuster Section */}
        <View style={styles.priceAdjusterCard}>
          <View style={styles.priceAdjusterRow}>
            <TouchableOpacity
              style={styles.priceAdjustButton}
              onPress={handleDecreasePrice}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={20} color={Colors.secondary} />
            </TouchableOpacity>

            <View style={styles.priceDisplay}>
              <Text variant="label" color="textMuted">
                {hasCustomOffer ? 'Your Offer' : 'Total Price'}
              </Text>
              <Text variant="body" weight="semibold" color={hasCustomOffer ? 'accent' : 'secondary'}>
                ${displayPrice.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.priceAdjustButton}
              onPress={handleIncreasePrice}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buy Button */}
        <TouchableOpacity
          style={[styles.buyButton, hasCustomOffer && styles.buyButtonOffer]}
          onPress={handleActionPress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={hasCustomOffer ? 'pricetag' : 'cart'}
            size={20}
            color={Colors.white}
          />
          <Text variant="body" weight="regular" style={styles.buyButtonText}>
            {hasCustomOffer ? 'Send Offer' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseConfirmModal}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            {/* Modal Header */}
            <View style={styles.confirmModalHeader}>
              <View style={[
                styles.confirmModalIcon,
                hasCustomOffer ? styles.confirmModalIconOffer : styles.confirmModalIconBuy
              ]}>
                <Ionicons
                  name={hasCustomOffer ? 'pricetag' : 'cart'}
                  size={28}
                  color={Colors.white}
                />
              </View>
              <Text variant="h4" weight="semibold" align="center">
                {hasCustomOffer ? 'Send Offer' : 'Confirm Purchase'}
              </Text>
            </View>

            <Spacer size="md" />

            {/* Vehicle Summary */}
            <View style={styles.confirmVehicleSummary}>
              <Text variant="bodySmall" weight="medium" align="center">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
              <Spacer size="xs" />
              <Text variant="h4" weight="bold" color={hasCustomOffer ? 'accent' : 'secondary'} align="center">
                ${displayPrice.toLocaleString()}
              </Text>
              {hasCustomOffer && (
                <>
                  <Spacer size="xs" />
                  <Text variant="caption" color="textMuted" align="center">
                    Original price: ${totalPrice.toLocaleString()}
                  </Text>
                </>
              )}
            </View>

            <Spacer size="md" />

            {/* Dealer Info */}
            <View style={styles.confirmDealerInfo}>
              <Ionicons name="storefront-outline" size={16} color={Colors.textMuted} />
              <Text variant="bodySmall" color="textMuted">
                {hasCustomOffer ? 'Your offer will be sent to' : 'Seller'}
              </Text>
            </View>
            <Spacer size="xs" />
            <Text variant="body" weight="medium" align="center">
              {vehicle.dealer}
            </Text>

            {hasCustomOffer && (
              <>
                <Spacer size="sm" />
                <View style={styles.confirmMessageNote}>
                  <Ionicons name="chatbubble-outline" size={14} color={Colors.primary} />
                  <Text variant="caption" color="textSecondary">
                    The dealer will receive your offer via messages
                  </Text>
                </View>
              </>
            )}

            <Spacer size="lg" />

            {/* Action Buttons */}
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={handleCloseConfirmModal}
                activeOpacity={0.7}
              >
                <Text variant="bodySmall" weight="medium" color="textSecondary">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmActionButton,
                  hasCustomOffer ? styles.confirmActionButtonOffer : styles.confirmActionButtonBuy
                ]}
                onPress={handleConfirmAction}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={hasCustomOffer ? 'send' : 'checkmark'}
                  size={18}
                  color={Colors.white}
                />
                <Text variant="bodySmall" weight="semibold" style={styles.confirmActionButtonText}>
                  {hasCustomOffer ? 'Send Offer' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Modal */}
      <Modal visible={fullscreenVisible} transparent animationType="fade" onRequestClose={handleCloseFullscreen}>
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity style={styles.fullscreenClose} onPress={handleCloseFullscreen} activeOpacity={0.8}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.fullscreenCounter}>
            <Text variant="caption" weight="medium" style={styles.fullscreenCounterText}>
              {currentImageIndex + 1} / {vehicleImages.length}
            </Text>
          </View>

          <ScrollView
            ref={fullscreenScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleFullscreenScroll}
            scrollEventThrottle={16}
          >
            {vehicleImages.map((image, index) => (
              <View key={`fs-${index}`} style={styles.fullscreenImageWrapper}>
                <Image source={image} style={styles.fullscreenImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Sub-components
interface SpecItemProps { label: string; value: string; }
const SpecItem: React.FC<SpecItemProps> = React.memo(({ label, value }) => (
  <View style={styles.specItem}>
    <Text variant="label" color="textMuted">{label}</Text>
    <Text variant="bodySmall" weight="medium">{value}</Text>
  </View>
));

interface PPSRItemProps { label: string; passed: boolean; }
const PPSRItem: React.FC<PPSRItemProps> = React.memo(({ label, passed }) => (
  <View style={styles.ppsrItem}>
    <Ionicons
      name={passed ? 'checkmark-circle' : 'close-circle'}
      size={16}
      color={passed ? Colors.success : Colors.error}
    />
    <Text variant="bodySmall">{label}</Text>
  </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'absolute',
    top: Spacing.sm,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerButtonActive: {
    backgroundColor: Colors.accent + '15',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // Image Section
  imageSection: {
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  heroImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageCounter: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.white + 'CC',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  imageCounterText: {
    color: Colors.black,
    fontWeight: '300',
  },
  expandButton: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },

  // Thumbnails
  thumbnailStrip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  // Content
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // Title Section
  titleSection: {
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  titleText: {
    flex: 1,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
  },

  // Meta Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },

  // Price Card
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
  },
  priceHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  priceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceItem: {
    alignItems: 'center',
    gap: 2,
  },

  // Accordion Section
  accordionSection: {
    gap: 0,
  },

  // Spec Grid
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specItem: {
    width: '50%',
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
  },

  // PPSR Content
  ppsrContent: {
    gap: Spacing.md,
  },
  ppsrStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '10',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  ppsrStatusText: {
    gap: 2,
  },
  ppsrChecks: {
    gap: Spacing.xs,
  },
  ppsrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // Condition Content
  conditionContent: {
    gap: Spacing.md,
  },
  conditionGroup: {
    gap: 0,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  conditionText: {
    flex: 1,
    lineHeight: 18,
  },

  // Extras Content
  extrasContent: {
    gap: Spacing.xs,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  extraInfo: {
    flex: 1,
    gap: 2,
  },
  extrasTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '30',
  },

  // Seller Content
  sellerContent: {
    gap: Spacing.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInfo: {
    flex: 1,
    gap: 2,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  sellerDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  priceAdjusterCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
  },
  priceAdjusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  priceDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceAdjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  buyButtonOffer: {
    backgroundColor: Colors.accent,
  },
  buyButtonText: {
    color: Colors.white,
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

  // Fullscreen Modal
  fullscreenContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black + '80',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullscreenCounter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: Spacing.md,
    backgroundColor: Colors.black + '80',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    zIndex: 10,
  },
  fullscreenCounterText: {
    color: Colors.white,
  },
  fullscreenImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },

  // Confirmation Modal
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: Colors.black + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  confirmModalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 360,
    ...Shadows.lg,
  },
  confirmModalHeader: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  confirmModalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalIconBuy: {
    backgroundColor: Colors.secondary,
  },
  confirmModalIconOffer: {
    backgroundColor: Colors.accent,
  },
  confirmVehicleSummary: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  confirmDealerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  confirmMessageNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary + '10',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  confirmCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
  },
  confirmActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  confirmActionButtonBuy: {
    backgroundColor: Colors.secondary,
  },
  confirmActionButtonOffer: {
    backgroundColor: Colors.accent,
  },
  confirmActionButtonText: {
    color: Colors.white,
  },
});

export default VehicleDetailsScreen;
