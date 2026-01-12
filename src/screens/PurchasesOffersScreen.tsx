/**
 * PurchasesOffersScreen Component
 *
 * Clean 2-tab interface with sub-tabs for managing transactions.
 * Design pattern matches WelcomeScreen with animated tab switcher.
 *
 * Main Tabs:
 * - Offers: Sub-tabs for Incoming / Sent
 * - History: Sub-tabs for Purchases / Sold
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Animated,
  Dimensions,
  ScaledSize,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Text, Spacer } from '../design-system';
import { Colors, Spacing, SpacingMobile, BorderRadius, Shadows } from '../design-system/primitives';
import { usePurchasesOffers, OfferSent, OfferReceived } from '../contexts/PurchasesOffersContext';
import { VEHICLES, getVehicleImage, formatMileage, VehicleImageKey } from '../data/vehicles';

// Assets
const VERIFIED_BADGE = require('../../assets/icons/verified-badge.png');

// ============================================================================
// RESPONSIVE HELPERS
// ============================================================================

const getResponsiveWidth = (screenWidth: number) => {
  return Platform.OS === 'web' ? Math.min(480, screenWidth) : screenWidth;
};

const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

// ============================================================================
// TYPES
// ============================================================================

type PurchasesOffersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PurchasesOffers'>;

interface PurchasesOffersScreenProps {
  navigation: PurchasesOffersScreenNavigationProp;
}

type MainTabType = 'offers' | 'history';
type OffersSubTab = 'incoming' | 'sent';
type HistorySubTab = 'purchases' | 'sold';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
};

const formatCurrency = (amount: number): string => `$${amount.toLocaleString()}`;

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get full vehicle data from VEHICLES array by vehicleId or imageKey
 */
const getFullVehicleData = (vehicleId?: string, imageKey?: string) => {
  if (vehicleId) {
    const vehicle = VEHICLES.find(v => v.id === vehicleId);
    if (vehicle) return vehicle;
  }
  if (imageKey) {
    const vehicle = VEHICLES.find(v => v.imageKey === imageKey);
    if (vehicle) return vehicle;
  }
  return null;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Sub-Tab - Clean underline style
 */
interface SubTabProps {
  label: string;
  count?: number;
  isActive: boolean;
  onPress: () => void;
  activeColor: string;
}

const SubTab: React.FC<SubTabProps> = ({ label, count, isActive, onPress, activeColor }) => (
  <TouchableOpacity
    style={styles.subTab}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      variant="body"
      weight={isActive ? 'semibold' : 'regular'}
      style={{ color: isActive ? Colors.text : Colors.textMuted }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <Text
          variant="body"
          weight={isActive ? 'semibold' : 'regular'}
          style={{ color: isActive ? activeColor : Colors.textMuted }}
        >
          {' '}({count})
        </Text>
      )}
    </Text>
    {isActive && <View style={[styles.subTabUnderline, { backgroundColor: activeColor }]} />}
  </TouchableOpacity>
);

/**
 * Status Badge - Compact design for pending/approved/declined
 */
interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'declined';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    pending: { icon: 'time-outline' as const, label: 'Pending', color: Colors.warning },
    approved: { icon: 'checkmark-circle' as const, label: 'Approved', color: Colors.success },
    declined: { icon: 'close-circle' as const, label: 'Declined', color: Colors.textMuted },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color + '12' }]}>
      <Ionicons name={config.icon} size={11} color={config.color} />
      <Text variant="caption" style={{ color: config.color, fontWeight: '600', fontSize: 10 }}>
        {config.label}
      </Text>
    </View>
  );
};

/**
 * Unified Transaction Card - Single reusable component matching HomeScreen design
 * Larger image (200px), compact spacing, clean footer with actions
 */
interface TransactionCardProps {
  type: 'incoming' | 'sent' | 'purchased' | 'sold';
  vehicleDetails: { make: string; model: string; year: number; mileage?: number; imageKey: VehicleImageKey };
  vehicleId?: string;
  amount: number;
  askingPrice?: number;
  dealerName: string;
  status?: 'pending' | 'approved' | 'declined';
  date: string;
  message?: string;
  onPress: () => void;
  onViewVehicle: () => void;
  primaryAction?: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; color: string };
  secondaryAction?: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; color: string };
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  type,
  vehicleDetails,
  vehicleId,
  amount,
  askingPrice,
  dealerName,
  status,
  date,
  message,
  onPress,
  onViewVehicle,
  primaryAction,
  secondaryAction,
}) => {
  const fullVehicle = getFullVehicleData(vehicleId, vehicleDetails.imageKey);
  const vehicleImage = getVehicleImage(vehicleDetails.imageKey);
  
  const typeConfig = {
    incoming: { icon: 'pricetag' as const, label: 'Incoming Offer' },
    sent: { icon: 'paper-plane' as const, label: 'Offer Sent' },
    purchased: { icon: 'cart' as const, label: 'Purchased' },
    sold: { icon: 'cash-outline' as const, label: 'Vehicle Sold' },
  }[type];

  return (
    <View style={styles.transactionCard}>
      {/* Vehicle Image - Larger (200px) */}
      <TouchableOpacity onPress={onViewVehicle} activeOpacity={0.95}>
        <Image source={vehicleImage} style={styles.cardImage} resizeMode="cover" />
      </TouchableOpacity>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Header: License Plate + Status + Date */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            {/* License Plate Badge - Show registration or fallback only for incoming offers */}
            {fullVehicle?.registration ? (
              <View style={styles.registrationBadge}>
                <Ionicons name="card-outline" size={11} color={Colors.primary} />
                <Text variant="caption" style={{ color: Colors.primary, fontWeight: '600', fontSize: 10 }}>
                  {fullVehicle.registration}
                </Text>
              </View>
            ) : (
              type === 'incoming' && (
                <View style={styles.typeBadge}>
                  <Ionicons name={typeConfig.icon} size={11} color={Colors.primary} />
                  <Text variant="caption" style={{ color: Colors.primary, fontWeight: '600', fontSize: 10 }}>
                    {typeConfig.label}
                  </Text>
                </View>
              )
            )}
            {status && <StatusBadge status={status} />}
          </View>
          <Text variant="caption" color="textMuted" style={{ fontSize: 10, fontWeight: '500' }}>
            {formatRelativeTime(date)}
          </Text>
        </View>

        {/* Vehicle Title with Verified Badge - Inline */}
        <Text variant="body" weight="bold" numberOfLines={1} style={{ marginBottom: 6, lineHeight: 22 }}>
          {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
          {fullVehicle?.verified && (
            <Text style={{ lineHeight: 22 }}>
              {' '}<Image source={VERIFIED_BADGE} style={{ width: 16, height: 16 }} />
            </Text>
          )}
        </Text>

        {/* Location & Dealer */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
          <Text variant="caption" style={{ color: Colors.textMuted, fontSize: 11 }}>
            {fullVehicle?.suburb || 'N/A'}, {fullVehicle?.state || 'N/A'}
          </Text>
          <View style={styles.dotSeparator} />
          <Text variant="caption" style={{ color: Colors.secondary, fontSize: 11, fontWeight: '600' }}>
            {dealerName}
          </Text>
        </View>

        {/* Specs Row - includes all badges like HomeScreen */}
        <View style={styles.specsRow}>
          {/* Mileage Badge */}
          {(fullVehicle?.mileage || vehicleDetails.mileage) && (
            <View style={styles.specBadge}>
              <Ionicons name="speedometer-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.specText}>
                {formatMileage((fullVehicle?.mileage || vehicleDetails.mileage) as number)}
              </Text>
            </View>
          )}

          {/* Transmission Badge */}
          {fullVehicle?.transmission && (
            <View style={styles.specBadge}>
              <Ionicons name="cog-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.specText}>
                {fullVehicle.transmission === 'automatic' ? 'Auto' : 'Manual'}
              </Text>
            </View>
          )}

          {/* Fuel Type Badge */}
          {fullVehicle?.fuelType && (
            <View style={styles.specBadge}>
              <Ionicons name="flash-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.specText}>
                {fullVehicle.fuelType.charAt(0).toUpperCase() + fullVehicle.fuelType.slice(1)}
              </Text>
            </View>
          )}

          {/* Color Badge */}
          {fullVehicle?.color && (
            <View style={styles.specBadge}>
              <Ionicons name="color-palette-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.specText}>{fullVehicle.color}</Text>
            </View>
          )}

          {/* Logbook Badge */}
          {fullVehicle?.hasLogbook && (
            <View style={styles.logbookBadgeInline}>
              <Ionicons name="book" size={11} color={Colors.success} />
              <Text style={styles.logbookBadgeTextInline}>Logbook</Text>
            </View>
          )}
        </View>

        {/* Price Section - Clean modern pricing */}
        <View style={styles.priceSection}>
          <View style={styles.priceMainRow}>
            <View style={styles.priceLeft}>
              <Text style={styles.priceLabel}>
                {type === 'incoming' || type === 'sent' ? 'OFFER' : type === 'purchased' ? 'PAID' : 'SOLD'}
              </Text>
              <Text variant="h4" weight="bold">{formatCurrency(amount)}</Text>
            </View>
            {askingPrice && (type === 'incoming' || type === 'sent') && (
              <View style={styles.priceRight}>
                <Text style={styles.priceSecondaryLabel}>ASKING</Text>
                <Text variant="body" weight="semibold" style={styles.askingPriceText}>
                  {formatCurrency(askingPrice)}
                </Text>
              </View>
            )}
          </View>
          {askingPrice && type !== 'incoming' && type !== 'sent' && (
            <View style={styles.priceSecondary}>
              <Text style={styles.priceSecondaryItem}>
                Asking: {formatCurrency(askingPrice)}
              </Text>
            </View>
          )}
        </View>

        {/* Message - De-emphasized with left border accent */}
        {message && (
          <View style={styles.messageBox}>
            <Ionicons name="chatbubble-outline" size={11} color={Colors.textMuted} style={{ marginTop: 1 }} />
            <Text numberOfLines={2} style={styles.messageText}>
              "{message}"
            </Text>
          </View>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <View style={styles.cardActions}>
            {primaryAction && (
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  primaryAction.label === 'Accept' && styles.acceptBtn,
                  primaryAction.label === 'Decline' && styles.declineBtn,
                ]}
                onPress={primaryAction.onPress}
                activeOpacity={0.8}
              >
                <Ionicons name={primaryAction.icon} size={16} color={Colors.white} />
                <Text variant="bodySmall" weight="semibold" style={styles.actionBtnText}>
                  {primaryAction.label}
                </Text>
              </TouchableOpacity>
            )}
            {secondaryAction && (
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  secondaryAction.label === 'Accept' && styles.acceptBtn,
                  secondaryAction.label === 'Decline' && styles.declineBtn,
                ]}
                onPress={secondaryAction.onPress}
                activeOpacity={0.8}
              >
                <Ionicons name={secondaryAction.icon} size={16} color={Colors.white} />
                <Text variant="bodySmall" weight="semibold" style={styles.actionBtnText}>
                  {secondaryAction.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* View Conversation */}
        <TouchableOpacity style={styles.conversationLink} onPress={onPress} activeOpacity={0.7}>
          <Ionicons name="chatbubble-ellipses-outline" size={11} color={Colors.primary} />
          <Text style={{ color: Colors.primary, fontSize: 11, fontWeight: '600', letterSpacing: 0.1 }}>
            View conversation
          </Text>
          <Ionicons name="chevron-forward" size={11} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/** Wrapper: Incoming Offer Card - Uses TransactionCard */
interface IncomingOfferCardProps {
  offer: OfferReceived;
  onApprove: () => void;
  onDecline: () => void;
  onViewVehicle: () => void;
  onViewConversation: () => void;
}

const IncomingOfferCard: React.FC<IncomingOfferCardProps> = ({ offer, onApprove, onDecline, onViewVehicle, onViewConversation }) => (
  <TransactionCard
    type="incoming"
    vehicleDetails={offer.vehicleDetails}
    vehicleId={offer.vehicleId}
    amount={offer.offerAmount}
    askingPrice={offer.askingPrice}
    dealerName={offer.buyerName}
    status={offer.status}
    date={offer.createdAt}
    message={offer.message}
    onPress={onViewConversation}
    onViewVehicle={onViewVehicle}
    primaryAction={{ label: 'Accept', icon: 'checkmark-circle', onPress: onApprove, color: Colors.success }}
    secondaryAction={{ label: 'Decline', icon: 'close-circle', onPress: onDecline, color: Colors.accent }}
  />
);

/** Wrapper: Offer Sent Card - Uses TransactionCard */
interface OfferSentCardProps {
  offer: OfferSent;
  onPress: () => void;
  onViewVehicle: () => void;
}

const OfferSentCard: React.FC<OfferSentCardProps> = ({ offer, onPress, onViewVehicle }) => (
  <TransactionCard
    type="sent"
    vehicleDetails={offer.vehicleDetails}
    vehicleId={offer.vehicleId}
    amount={offer.offerAmount}
    askingPrice={offer.askingPrice}
    dealerName={offer.sellerName}
    status={offer.status}
    date={offer.createdAt}
    onPress={onPress}
    onViewVehicle={onViewVehicle}
  />
);

/** Wrapper: History Card - Uses TransactionCard */
interface HistoryCardProps {
  type: 'purchased' | 'sold';
  vehicleId?: string;
  vehicleDetails: { make: string; model: string; year: number; mileage?: number; imageKey: VehicleImageKey };
  amount: number;
  counterpartyName: string;
  date: string;
  onViewVehicle: () => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ type, vehicleId, vehicleDetails, amount, counterpartyName, date, onViewVehicle }) => (
  <TransactionCard
    type={type}
    vehicleDetails={vehicleDetails}
    vehicleId={vehicleId}
    amount={amount}
    dealerName={type === 'sold' ? `Sold to ${counterpartyName}` : `Bought from ${counterpartyName}`}
    date={date}
    onPress={() => {}} // No conversation for history
    onViewVehicle={onViewVehicle}
  />
);

/**
 * Empty State
 */
interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name={icon} size={40} color={Colors.textMuted} />
    </View>
    <Spacer size="md" />
    <Text variant="body" weight="semibold" align="center">{title}</Text>
    <Text variant="caption" color="textMuted" align="center" style={{ marginTop: 4 }}>{subtitle}</Text>
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PurchasesOffersScreen: React.FC<PurchasesOffersScreenProps> = ({ navigation }) => {
  const {
    offersSent,
    offersReceived,
    purchases,
    soldVehicles,
    approveOffer,
    declineOffer,
  } = usePurchasesOffers();

  // Main tab state
  const [activeMainTab, setActiveMainTab] = useState<MainTabType>('offers');
  // Sub-tab states
  const [offersSubTab, setOffersSubTab] = useState<OffersSubTab>('incoming');
  const [historySubTab, setHistorySubTab] = useState<HistorySubTab>('purchases');

  const [containerWidth, setContainerWidth] = useState(() => getResponsiveWidth(Dimensions.get('window').width));
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Animation values (matching WelcomeScreen pattern)
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentSlideAnim = useRef(new Animated.Value(0)).current;

  // Handle dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setContainerWidth(getResponsiveWidth(window.width));
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Main tab change handler with animation
  const handleMainTabChange = useCallback((tab: MainTabType) => {
    if (tab === activeMainTab) return;

    const isGoingRight = tab === 'history';

    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue: isGoingRight ? -20 : 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveMainTab(tab);
      contentSlideAnim.setValue(isGoingRight ? 20 : -20);

      Animated.parallel([
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlideAnim, {
          toValue: 0,
          tension: 120,
          friction: 14,
          useNativeDriver: true,
        }),
      ]).start();
    });

    Animated.spring(tabIndicatorAnim, {
      toValue: tab === 'offers' ? 0 : 1,
      tension: 120,
      friction: 14,
      useNativeDriver: false,
    }).start();
  }, [activeMainTab, contentFadeAnim, contentSlideAnim, tabIndicatorAnim]);

  // Responsive spacing
  const spacingXl = getResponsiveSpacing('xl', viewportWidth);

  // Tab indicator position
  const tabWidth = (containerWidth - spacingXl * 2 - 8) / 2;
  const indicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  // Data
  const pendingOffers = useMemo(() => offersReceived.filter(o => o.status === 'pending'), [offersReceived]);
  const pendingCount = pendingOffers.length;
  const sentCount = offersSent.length;
  const purchasesCount = purchases.length;
  const soldCount = soldVehicles.length;

  // Action handlers
  const handleApprove = useCallback(async (offerId: string) => {
    try {
      await approveOffer(offerId);
      Alert.alert('Success', 'Offer accepted!');
      navigation.navigate('Messages', { offerApproved: true } as any);
    } catch {
      Alert.alert('Error', 'Failed to accept offer.');
    }
  }, [approveOffer, navigation]);

  const handleDecline = useCallback((offerId: string) => {
    Alert.alert('Decline Offer', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => declineOffer(offerId) },
    ]);
  }, [declineOffer]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  // Navigate to vehicle details
  const handleViewVehicle = useCallback((vehicleId?: string, imageKey?: string) => {
    // Try to find the vehicle by ID first, then by imageKey
    const vehicle = getFullVehicleData(vehicleId, imageKey);
    if (vehicle) {
      navigation.navigate('VehicleDetails', { vehicleId: vehicle.id });
    } else {
      // Fallback: show alert if vehicle not found in VEHICLES array
      Alert.alert('Vehicle Details', 'Full details not available for this vehicle.');
    }
  }, [navigation]);

  // Tab colors
  const mainTabColor = activeMainTab === 'offers' ? Colors.accent : Colors.success;

  // Render content based on active tabs
  const renderContent = () => {
    if (activeMainTab === 'offers') {
      if (offersSubTab === 'incoming') {
        return pendingOffers.length > 0 ? (
          <View style={styles.contentSection}>
            {pendingOffers.map(offer => (
              <IncomingOfferCard
                key={offer.offerId}
                offer={offer}
                onApprove={() => handleApprove(offer.offerId)}
                onDecline={() => handleDecline(offer.offerId)}
                onViewVehicle={() => handleViewVehicle(undefined, offer.vehicleDetails.imageKey)}
                onViewConversation={() => navigation.navigate('Messages', { offerId: offer.offerId } as any)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="mail-open-outline"
            title="No incoming offers"
            subtitle="Offers from buyers will appear here"
          />
        );
      } else {
        return offersSent.length > 0 ? (
          <View style={styles.contentSection}>
            {offersSent.map(offer => (
              <OfferSentCard
                key={offer.offerId}
                offer={offer}
                onPress={() => navigation.navigate('Messages', { vehicleId: offer.vehicleId } as any)}
                onViewVehicle={() => handleViewVehicle(offer.vehicleId, offer.vehicleDetails.imageKey)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="paper-plane-outline"
            title="No offers sent"
            subtitle="Offers you make will appear here"
          />
        );
      }
    } else {
      if (historySubTab === 'purchases') {
        return purchases.length > 0 ? (
          <View style={styles.contentSection}>
            {purchases.map(p => (
              <HistoryCard
                key={p.purchaseId}
                type="purchased"
                vehicleId={p.vehicleId}
                vehicleDetails={p.vehicleDetails}
                amount={p.purchaseAmount}
                counterpartyName={p.sellerName}
                date={p.purchaseDate}
                onViewVehicle={() => handleViewVehicle(p.vehicleId, p.vehicleDetails.imageKey)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="cart-outline"
            title="No purchases yet"
            subtitle="Vehicles you buy will appear here"
          />
        );
      } else {
        return soldVehicles.length > 0 ? (
          <View style={styles.contentSection}>
            {soldVehicles.map(s => (
              <HistoryCard
                key={s.soldId}
                type="sold"
                vehicleId={s.vehicleDetails.imageKey}
                vehicleDetails={s.vehicleDetails}
                amount={s.saleAmount}
                counterpartyName={s.buyerName}
                date={s.saleDate}
                onViewVehicle={() => handleViewVehicle(s.vehicleDetails.imageKey, s.vehicleDetails.imageKey)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="checkmark-done-outline"
            title="No sales yet"
            subtitle="Vehicles you sell will appear here"
          />
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text variant="h3" weight="bold">Purchases & Offers</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacingXl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Tab Switcher (WelcomeScreen style) */}
          <View style={styles.tabContainer}>
            <View style={styles.tabBackground}>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    width: tabWidth,
                    transform: [{ translateX: indicatorTranslateX }],
                    backgroundColor: mainTabColor,
                  },
                ]}
              />

              <TouchableOpacity
                style={styles.tab}
                onPress={() => handleMainTabChange('offers')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="pricetags"
                  size={16}
                  color={activeMainTab === 'offers' ? Colors.white : Colors.text}
                  style={styles.tabIcon}
                />
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  style={activeMainTab === 'offers' ? styles.tabTextActive : styles.tabText}
                >
                  Offers
                </Text>
                {pendingCount > 0 && (
                  <View style={[styles.tabBadge, activeMainTab === 'offers' && styles.tabBadgeActive]}>
                    <Text variant="caption" style={styles.tabBadgeText}>{pendingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tab}
                onPress={() => handleMainTabChange('history')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="time"
                  size={16}
                  color={activeMainTab === 'history' ? Colors.white : Colors.text}
                  style={styles.tabIcon}
                />
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  style={activeMainTab === 'history' ? styles.tabTextActive : styles.tabText}
                >
                  History
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Spacer size="lg" />

          {/* Sub-Tabs */}
          <View style={styles.subTabsContainer}>
            {activeMainTab === 'offers' ? (
              <>
                <SubTab
                  label="Incoming"
                  count={pendingCount}
                  isActive={offersSubTab === 'incoming'}
                  onPress={() => setOffersSubTab('incoming')}
                  activeColor={Colors.accent}
                />
                <SubTab
                  label="Sent"
                  count={sentCount}
                  isActive={offersSubTab === 'sent'}
                  onPress={() => setOffersSubTab('sent')}
                  activeColor={Colors.accent}
                />
              </>
            ) : (
              <>
                <SubTab
                  label="Purchases"
                  count={purchasesCount}
                  isActive={historySubTab === 'purchases'}
                  onPress={() => setHistorySubTab('purchases')}
                  activeColor={Colors.success}
                />
                <SubTab
                  label="Sold"
                  count={soldCount}
                  isActive={historySubTab === 'sold'}
                  onPress={() => setHistorySubTab('sold')}
                  activeColor={Colors.success}
                />
              </>
            )}
          </View>

          {/* Animated Content */}
          <Animated.View
            style={{
              opacity: contentFadeAnim,
              transform: [{ translateX: contentSlideAnim }],
              marginTop: Spacing.xl, // 32px spacing between subtabs and cards
            }}
          >
            {renderContent()}
          </Animated.View>

          <Spacer size="xl" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEF2',
  },
  innerContainer: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: Spacing.lg, paddingBottom: Spacing['3xl'] },

  // Main Tab Styles (matching WelcomeScreen)
  tabContainer: { paddingHorizontal: Spacing.xs },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabIndicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    borderRadius: BorderRadius.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs + 2,
    zIndex: 1,
  },
  tabIcon: { marginRight: 6 },
  tabText: { color: Colors.text },
  tabTextActive: { color: Colors.white },
  tabBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '600' },

  // Sub-Tab Styles
  subTabsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg, // Reduced from '2xl' (from 32px to 24px)
    paddingLeft: Spacing.xs,
    marginBottom: 0, // Remove extra spacing, handled by marginTop on content
  },
  subTab: {
    paddingVertical: 0, // Removed vertical padding
    paddingBottom: Spacing.xs, // Reduced from 'md' (from 16px to 8px)
    position: 'relative',
  },
  subTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2, // Reduced from 3px to 2px for subtler line
    borderRadius: 1,
  },

  // Content
  contentSection: { gap: Spacing.sm },

  // Unified Transaction Card - Compact modern minimal
  transactionCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md, // 12px (reduced from lg)
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: Spacing.md, // 16px (reduced from 24px)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, // More subtle
        shadowRadius: 8, // Tighter shadow
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
    }),
  },

  // Vehicle Image - Compact size
  cardImage: {
    width: '100%',
    height: 160, // Reduced from 220px for compact look
    backgroundColor: '#F8F8F8',
  },

  // Card Content - Compact padding
  cardContent: {
    paddingHorizontal: Spacing.md, // 16px (reduced from 24px)
    paddingTop: Spacing.md, // 16px (reduced from 24px)
    paddingBottom: Spacing.sm, // 8px (reduced from 16px)
  },

  // Header Row - Compact
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs, // 8px (reduced from 16px)
    flexWrap: 'wrap',
  },

  // Header Left - Badge group
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Reduced from 8px
    flex: 1,
  },

  // Type Badge - Compact
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '08',
    paddingVertical: 3, // Reduced from 5px
    paddingHorizontal: 8, // Reduced from 10px
    borderRadius: BorderRadius.full,
  },

  // Status Badge - Compact
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3, // Reduced from 5px
    paddingHorizontal: 8, // Reduced from 10px
    borderRadius: BorderRadius.full,
    borderWidth: 0,
  },

  // Specs Row - Compact layout
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6, // Reduced from 8px
    marginTop: 6, // Reduced from 8px
    marginBottom: Spacing.sm, // 8px (reduced from 16px)
    alignItems: 'center',
  },

  // Spec Badge - Compact
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F8F8',
    paddingVertical: 3, // Reduced from 5px
    paddingHorizontal: 7, // Reduced from 9px
    borderRadius: BorderRadius.sm,
  },

  // Spec Text
  specText: {
    fontSize: 11, // Reduced from 12px
    color: '#555',
    fontWeight: '500' as '500',
  },

  // Location Row
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },

  // Dot Separator
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 2,
  },

  // Logbook Badge - Inline with other specs
  logbookBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: BorderRadius.sm,
  },

  logbookBadgeTextInline: {
    color: Colors.success,
    fontWeight: '600' as '600',
    fontSize: 11,
  },

  // Registration Badge - License plate with primary color
  registrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '08',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: BorderRadius.sm,
  },

  registrationText: {
    color: Colors.primary,
    fontWeight: '600' as '600',
    fontSize: 11,
  },

  // Price Section - Compact with better visibility
  priceSection: {
    marginTop: Spacing.sm, // 8px (reduced from 16px)
    paddingTop: Spacing.sm, // 8px (reduced from 16px)
    paddingBottom: Spacing.sm, // 8px
    paddingHorizontal: Spacing.sm, // 8px for internal padding
    backgroundColor: Colors.primary + '05', // Very subtle teal background
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '15', // Light teal border
  },

  // Price Main Row
  priceMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4, // Reduced from 8px
  },

  // Price Left Column
  priceLeft: {
    flex: 1,
  },

  // Price Label - More prominent
  priceLabel: {
    fontSize: 10, // Slightly larger for better visibility
    fontWeight: Platform.OS === 'android' ? '700' : '800',
    letterSpacing: 0.8,
    color: Colors.primary, // Use primary color instead of muted
    marginBottom: 2,
    textTransform: 'uppercase' as 'uppercase',
  },

  // Price Secondary Info Row
  priceSecondary: {
    flexDirection: 'row',
    gap: 6, // Reduced from 8px
    marginTop: 4, // Reduced from 6px
  },

  // Price Secondary Item
  priceSecondaryItem: {
    fontSize: 10, // Reduced from 11px
    color: Colors.textMuted,
    fontWeight: '500' as '500',
  },

  // Price Right - For asking price (side-by-side layout)
  priceRight: {
    alignItems: 'flex-end',
  },

  // Price Secondary Label - Small uppercase label for "ASKING"
  priceSecondaryLabel: {
    fontSize: 10,
    fontWeight: '800' as '800',
    letterSpacing: 0.8,
    color: Colors.textMuted, // Keep muted for secondary info
    textTransform: 'uppercase' as 'uppercase',
    marginBottom: 2,
  },

  // Asking Price Text - For the asking price value
  askingPriceText: {
    fontSize: 15,
    color: Colors.text,
  },

  // Message Box - Compact with left border
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'transparent',
    paddingLeft: 6,
    paddingVertical: 6,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary + '20',
    marginTop: Spacing.xs, // 4px (reduced from 8px)
    marginBottom: 0,
  },

  // Message Text
  messageText: {
    flex: 1,
    fontSize: 11, // Reduced from 12px
    lineHeight: 16, // Reduced from 18px
    color: Colors.textMuted,
    fontStyle: 'italic' as 'italic',
  },

  // Card Actions - Matching MessagesScreen
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },

  // Action Button - Base style matching MessagesScreen
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  // Accept button - Green
  acceptBtn: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  
  // Decline button - Red/Accent
  declineBtn: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  
  // Button text color
  actionBtnText: {
    color: Colors.white,
  },

  // Conversation Link - Compact
  conversationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.xs, // 8px (reduced from 12px)
    marginTop: Spacing.sm, // 8px (reduced from 16px)
    opacity: 0.8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PurchasesOffersScreen;
