/**
 * VehicleDetailsScreen Component (Modern Marketplace Design)
 *
 * Clean, modern vehicle details view with intuitive sections and
 * streamlined price breakdown. Optimized for mobile web devices.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Animated,
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
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.85;
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
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number | null>(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const mainScrollRef = useRef<ScrollView>(null);
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  const vehicle = useMemo(() => VEHICLES.find((v) => v.id === vehicleId), [vehicleId]);

  const vehicleImages = useMemo(() => {
    if (!vehicle) return [];
    if (vehicle.images && vehicle.images.length > 0) {
      return vehicle.images.map((imgKey) => getVehicleImage(imgKey));
    }
    return [getVehicleImage(vehicle.imageKey)];
  }, [vehicle]);

  // Use askingPrice from vehicle data (already includes extras calculation)
  const askingPrice = useMemo(() => {
    if (!vehicle) return 0;
    return vehicle.askingPrice || vehicle.price;
  }, [vehicle]);

  // Current display price (offer price or asking price)
  const displayPrice = offerPrice !== null ? offerPrice : askingPrice;

  // Price adjustment increment (1000)
  const PRICE_INCREMENT = 1000;

  const handleIncreasePrice = useCallback(() => {
    const currentPrice = offerPrice !== null ? offerPrice : askingPrice;
    setOfferPrice(currentPrice + PRICE_INCREMENT);
  }, [offerPrice, askingPrice]);

  const handleDecreasePrice = useCallback(() => {
    const currentPrice = offerPrice !== null ? offerPrice : askingPrice;
    const newPrice = currentPrice - PRICE_INCREMENT;
    if (newPrice >= 1000) {
      setOfferPrice(newPrice);
    }
  }, [offerPrice, askingPrice]);

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

  // Thumbnail animation values - scale and opacity for blur effect
  const thumbnailScales = useRef<Animated.Value[]>([]).current;
  const thumbnailOpacities = useRef<Animated.Value[]>([]).current;

  // Initialize animation values when vehicleImages changes
  useEffect(() => {
    // Ensure we have the right number of animation values
    while (thumbnailScales.length < vehicleImages.length) {
      thumbnailScales.push(new Animated.Value(thumbnailScales.length === currentImageIndex ? 1.1 : 0.9));
      thumbnailOpacities.push(new Animated.Value(thumbnailScales.length - 1 === currentImageIndex ? 1 : 0.5));
    }
  }, [vehicleImages.length]);

  // Animate thumbnails when current image changes
  useEffect(() => {
    if (thumbnailScales.length === 0) return;

    // Animate all thumbnails
    const animations = vehicleImages.map((_, index) => {
      const isActive = index === currentImageIndex;
      return Animated.parallel([
        Animated.spring(thumbnailScales[index] || new Animated.Value(1), {
          toValue: isActive ? 1.1 : 0.9,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(thumbnailOpacities[index] || new Animated.Value(1), {
          toValue: isActive ? 1 : 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();
  }, [currentImageIndex, vehicleImages.length]);

  // Auto-scroll thumbnail strip to center active thumbnail
  useEffect(() => {
    if (thumbnailScrollRef.current && vehicleImages.length > 1) {
      // Calculate scroll position to center the active thumbnail
      const thumbnailTotalWidth = THUMBNAIL_SIZE + Spacing.sm; // thumbnail + gap
      const containerPadding = Spacing.md; // thumbnailStrip paddingHorizontal
      const viewportWidth = IMAGE_WIDTH;

      // Position of active thumbnail's center
      const thumbnailCenterX = containerPadding + (currentImageIndex * thumbnailTotalWidth) + (THUMBNAIL_SIZE / 2);

      // Scroll to center the active thumbnail in viewport
      const scrollX = Math.max(0, thumbnailCenterX - (viewportWidth / 2));

      thumbnailScrollRef.current.scrollTo({ x: scrollX, animated: true });
    }
  }, [currentImageIndex, vehicleImages.length]);

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

  // Send offer - navigate to messages
  const handleSendOffer = useCallback(() => {
    if (!vehicle) return;
    setOfferModalVisible(false);
    // Navigate to messages screen for negotiation
    navigation.navigate('Messages', { vehicleId: vehicle.id });
  }, [vehicle, navigation]);

  // Open purchase modal
  const handlePurchasePress = useCallback(() => {
    setPurchaseModalVisible(true);
  }, []);

  // Send purchase request - navigate to messages
  const handleSendPurchase = useCallback(() => {
    if (!vehicle) return;
    setPurchaseModalVisible(false);
    // Navigate to messages screen for purchase
    navigation.navigate('Messages', { vehicleId: vehicle.id });
  }, [vehicle, navigation]);

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
            <TouchableOpacity
              style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
              onPress={handleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? Colors.white : Colors.accent}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={18} color={Colors.text} />
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

        {/* Thumbnail Strip with Animations */}
        {vehicleImages.length > 1 && (
          <ScrollView
            ref={thumbnailScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailStrip}
          >
            {vehicleImages.map((image, index) => {
              const isActive = index === currentImageIndex;
              const scale = thumbnailScales[index] || new Animated.Value(1);
              const opacity = thumbnailOpacities[index] || new Animated.Value(1);

              return (
                <TouchableOpacity
                  key={`thumb-${index}`}
                  onPress={() => handleThumbnailPress(index)}
                  activeOpacity={0.9}
                >
                  <Animated.View
                    style={[
                      styles.thumbnail,
                      isActive && styles.thumbnailActive,
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  >
                    <Image source={image} style={styles.thumbnailImage} resizeMode="cover" />
                    {/* Overlay for non-active thumbnails */}
                    {!isActive && (
                      <View style={styles.thumbnailOverlay} />
                    )}
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text variant="h3" weight="bold">
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

          {/* Location - Suburb, State for pickup */}
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
            <Text variant="caption" color="textTertiary">
              {vehicle.suburb}, {vehicle.state}
            </Text>
          </View>

          <Spacer size="md" />

          {/* Specs Row - Matching HomeScreen style */}
          <View style={styles.specsRow}>
            <View style={styles.specBadge}>
              <Ionicons name="speedometer-outline" size={14} color={Colors.textTertiary} />
              <Text variant="caption" style={styles.specBadgeText}>{formatMileage(vehicle.mileage)}</Text>
            </View>
            <View style={styles.specBadge}>
              <Ionicons name="cog-outline" size={14} color={Colors.textTertiary} />
              <Text variant="caption" style={styles.specBadgeText}>
                {vehicle.transmission === 'automatic' ? 'Auto' : 'Manual'}
              </Text>
            </View>
            <View style={styles.specBadge}>
              <Ionicons name="flash-outline" size={14} color={Colors.textTertiary} />
              <Text variant="caption" style={styles.specBadgeText}>
                {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}
              </Text>
            </View>
            <View style={styles.specBadge}>
              <Ionicons name="color-palette-outline" size={14} color={Colors.textTertiary} />
              <Text variant="caption" style={styles.specBadgeText}>{vehicle.color}</Text>
            </View>
            {vehicle.hasLogbook && (
              <View style={styles.logbookBadge}>
                <Ionicons name="book" size={12} color={Colors.success} />
                <Text variant="caption" style={styles.logbookBadgeText}>Logbook</Text>
              </View>
            )}
            {vehicle.registration && (
              <View style={styles.specBadge}>
                <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
                <Text variant="caption" style={styles.specBadgeText}>{vehicle.registration}</Text>
              </View>
            )}
          </View>

          <Spacer size="lg" />

          {/* Price Card - Clean Single Price Display */}
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text variant="caption" color="textTertiary">Asking Price</Text>
              <Text variant="h2" weight="bold" color="secondary">
                ${askingPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          <Spacer size="lg" />

          {/* Accordions Section */}
          <View style={styles.accordionSection}>
            {/* Vehicle Details - Comprehensive Australian Standards */}
            <Accordion title="Vehicle Details" icon="car-sport-outline" defaultExpanded={false}>
              <View style={styles.specGrid}>
                {/* Basic Vehicle Information */}
                <SpecItem label="Year" value={vehicle.year.toString()} />
                <SpecItem label="Make" value={vehicle.make} />
                <SpecItem label="Model" value={vehicle.model} />
                {vehicle.variant && <SpecItem label="Variant" value={vehicle.variant} />}
                <SpecItem label="Body Type" value={vehicle.bodyType} />
                <SpecItem label="Colour" value={vehicle.color} />

                {/* Mechanical Details */}
                <SpecItem label="Transmission" value={vehicle.transmission === 'automatic' ? 'Automatic' : 'Manual'} />
                <SpecItem label="Fuel Type" value={vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)} />
                <SpecItem label="Odometer" value={formatMileage(vehicle.mileage)} />

                {/* Registration & Compliance */}
                {vehicle.registration && <SpecItem label="Registration" value={vehicle.registration} />}
                <SpecItem label="State" value={vehicle.state} />
                <SpecItem label="Condition" value={vehicle.condition.charAt(0).toUpperCase() + vehicle.condition.slice(1)} />
                <SpecItem label="Vehicle Age" value={`${vehicle.age} ${vehicle.age === 1 ? 'year' : 'years'}`} />

                {/* Seller Information */}
                <SpecItem label="Seller Type" value={vehicle.sellerType} />
                <SpecItem label="Location" value={`${vehicle.suburb}, ${vehicle.state}`} />
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
                        <Text variant="body" weight="bold" style={{ color: Colors.success }}>
                          Clear Title
                        </Text>
                        <Text variant="caption" color="textTertiary">
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
                  title={`Aftermarket Extras (+$${vehicle.afterMarketExtrasDetailed.reduce((sum, e) => sum + e.cost, 0).toLocaleString()})`}
                  icon="construct-outline"
                  defaultExpanded={false}
                >
                  <View style={styles.extrasContent}>
                    {vehicle.afterMarketExtrasDetailed.map((extra, idx) => (
                      <View key={`extra-${idx}`} style={styles.extraItem}>
                        <Text variant="body" weight="medium">{extra.name}</Text>
                        <Text variant="body" weight="semibold" color="secondary">
                          ${extra.cost.toLocaleString()}
                        </Text>
                      </View>
                    ))}
                    {/* Total Row */}
                    <View style={styles.extrasTotalRow}>
                      <Text variant="body" weight="semibold">Total</Text>
                      <Text variant="body" weight="bold" color="secondary">
                        ${vehicle.afterMarketExtrasDetailed.reduce((sum, e) => sum + e.cost, 0).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </Accordion>
                <Spacer size="sm" />
              </>
            )}
          </View>

          <Spacer size="xl" />
        </View>
      </ScrollView>

      {/* Bottom Action Bar - Modern Design */}
      <View style={styles.bottomBar}>
        {/* Price Section */}
        <View style={styles.bottomPriceSection}>
          <Text variant="caption" color="textMuted">Asking Price</Text>
          <Text variant="h4" weight="bold" color="secondary">
            ${askingPrice.toLocaleString()}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          {/* Request Offer Button */}
          <TouchableOpacity
            style={styles.makeOfferButton}
            onPress={() => setOfferModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pricetag-outline" size={18} color={Colors.secondary} />
            <Text variant="caption" weight="semibold" color="secondary">
              Request Offer
            </Text>
          </TouchableOpacity>

          {/* Purchase Button */}
          <TouchableOpacity
            style={styles.buyNowButton}
            onPress={handlePurchasePress}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={18} color={Colors.white} />
            <Text variant="body" weight="semibold" style={styles.buyNowButtonText}>
              Purchase
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offer Modal - Modern Design */}
      <Modal
        visible={offerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOfferModalVisible(false)}>
          <View style={styles.offerModalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <View style={styles.offerModalContent}>
                  {/* Header with Icon */}
                  <View style={styles.offerModalHeader}>
                    <View style={styles.offerModalIconBadge}>
                      <Ionicons name="pricetag" size={24} color={Colors.white} />
                    </View>
                    <TouchableOpacity
                      onPress={() => setOfferModalVisible(false)}
                      style={styles.offerModalCloseButton}
                    >
                      <Ionicons name="close" size={24} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text variant="h4" weight="bold" align="center">Request Offer</Text>

                  <Spacer size="md" />

                  {/* Vehicle Info Card */}
                  <View style={styles.offerVehicleInfo}>
                    <Text variant="bodySmall" weight="medium" color="textBrand" align="center">
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
                    </Text>
                    {vehicle.registration && (
                      <View style={styles.offerLicensePlate}>
                        <Ionicons name="card-outline" size={14} color={Colors.textMuted} />
                        <Text variant="caption" color="textMuted">
                          {vehicle.registration}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Spacer size="sm" />

                  {/* Info Message */}
                  <View style={styles.offerInfoMessage}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.textBrand} />
                    <Text variant="caption" color="textSecondary" style={styles.offerInfoText}>
                      The dealer will receive your offer and negotiate with you via messages
                    </Text>
                  </View>

                  <Spacer size="md" />

                  {/* Original Price */}
                  <View style={styles.offerOriginalPrice}>
                    <Text variant="bodySmall" color="textMuted">Asking Price: </Text>
                    <Text variant="bodySmall" weight="bold" color="text">
                      ${askingPrice.toLocaleString()}
                    </Text>
                  </View>

                  <Spacer size="sm" />

                  {/* Price Input */}
                  <View style={styles.offerPriceRow}>
                    <TouchableOpacity
                      style={styles.offerPriceButton}
                      onPress={handleDecreasePrice}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove" size={22} color={Colors.textBrand} />
                    </TouchableOpacity>
                    <View style={styles.offerPriceDisplay}>
                      <Text variant="label" color="textMuted">Your Offer</Text>
                      <Text variant="h2" weight="bold" color="textBrand">
                        ${displayPrice.toLocaleString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.offerPriceButton}
                      onPress={handleIncreasePrice}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={22} color={Colors.textBrand} />
                    </TouchableOpacity>
                  </View>

                  <Spacer size="md" />

                  {/* Message Input */}
                  <TextInput
                    style={styles.offerMessageInput}
                    placeholder="Add a message (optional)"
                    placeholderTextColor={Colors.textMuted}
                    value={offerMessage}
                    onChangeText={setOfferMessage}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />

                  <Spacer size="lg" />

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={styles.offerSubmitButton}
                    onPress={handleSendOffer}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="send" size={18} color={Colors.white} />
                    <Text variant="bodySmall" weight="semibold" style={styles.offerSubmitButtonText}>
                      Send My Offer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.offerCancelButton}
                    onPress={() => setOfferModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text variant="bodySmall" weight="medium" color="textMuted">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Purchase Modal */}
      <Modal
        visible={purchaseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPurchaseModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPurchaseModalVisible(false)}>
          <View style={styles.offerModalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <View style={styles.offerModalContent}>
                  {/* Header with Icon */}
                  <View style={styles.offerModalHeader}>
                    <View style={styles.purchaseModalIconBadge}>
                      <Ionicons name="cart" size={24} color={Colors.white} />
                    </View>
                    <TouchableOpacity
                      onPress={() => setPurchaseModalVisible(false)}
                      style={styles.offerModalCloseButton}
                    >
                      <Ionicons name="close" size={24} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text variant="h4" weight="bold" align="center">Purchase Vehicle</Text>

                  <Spacer size="md" />

                  {/* Vehicle Info Card */}
                  <View style={styles.offerVehicleInfo}>
                    <Text variant="bodySmall" weight="medium" color="textBrand" align="center">
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
                    </Text>
                    {vehicle.registration && (
                      <View style={styles.offerLicensePlate}>
                        <Ionicons name="card-outline" size={14} color={Colors.textMuted} />
                        <Text variant="caption" color="textMuted">
                          {vehicle.registration}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Spacer size="md" />

                  {/* Price Display */}
                  <View style={styles.purchasePriceDisplay}>
                    <Text variant="label" color="textMuted">Total Price</Text>
                    <Text variant="h2" weight="bold" color="textBrand">
                      ${askingPrice.toLocaleString()}
                    </Text>
                  </View>

                  <Spacer size="md" />

                  {/* Info Message */}
                  <View style={styles.offerInfoMessage}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.textBrand} />
                    <Text variant="caption" color="textSecondary" style={styles.offerInfoText}>
                      The dealer will receive your purchase request and contact you to finalize the sale
                    </Text>
                  </View>

                  <Spacer size="md" />

                  {/* Message Input */}
                  <TextInput
                    style={styles.offerMessageInput}
                    placeholder="Add a message to the dealer (optional)"
                    placeholderTextColor={Colors.textMuted}
                    value={purchaseMessage}
                    onChangeText={setPurchaseMessage}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />

                  <Spacer size="lg" />

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={styles.purchaseSubmitButton}
                    onPress={handleSendPurchase}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                    <Text variant="bodySmall" weight="semibold" style={styles.offerSubmitButtonText}>
                      Confirm Purchase
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.offerCancelButton}
                    onPress={() => setPurchaseModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text variant="bodySmall" weight="medium" color="textMuted">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    <Text variant="caption" color="textTertiary">{label}</Text>
    <Text variant="body" weight="medium">{value}</Text>
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
    <Text variant="body" weight="medium">{label}</Text>
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
    borderWidth: 3,
    borderColor: Colors.border,
  },
  thumbnailActive: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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

  // Specs Row - Matching HomeScreen style
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  specBadgeText: {
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

  // Stats Row (legacy - keeping for compatibility)
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

  // Pricing Details List
  pricingDetailsList: {
    gap: Spacing.sm,
  },
  pricingDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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

  // Bottom Bar - Modern Design
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  bottomPriceSection: {
    gap: 2,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  makeOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.secondary + '12',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  buyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  buyNowButtonText: {
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

  // Offer Modal - Modern Design
  offerModalOverlay: {
    flex: 1,
    backgroundColor: Colors.black + 'AA',
    justifyContent: 'flex-end',
  },
  offerModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: 'center',
    ...Shadows.lg,
  },
  offerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  offerModalIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.textBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerModalCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerInfoMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.textBrand + '10',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  offerInfoText: {
    flex: 1,
    lineHeight: 18,
  },
  offerVehicleInfo: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  offerLicensePlate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offerOriginalPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  offerPriceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.textBrand + '30',
  },
  offerPriceDisplay: {
    alignItems: 'center',
    gap: 4,
  },
  offerMessageInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
    minHeight: 72,
  },
  offerSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.textBrand,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  offerSubmitButtonText: {
    color: Colors.white,
  },
  offerCancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },

  // Purchase Modal Styles
  purchaseModalIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchasePriceDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  purchaseSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
});

export default VehicleDetailsScreen;
