/**
 * MessagesScreen Component
 *
 * Clean chat interface for car negotiations between buyers and dealers.
 * Features:
 * - Clean start (no mock messages) - Facebook Marketplace style
 * - Auto-send offer/purchase from VehicleDetailsScreen
 * - Inline Accept/Decline/Counter buttons for dealers
 * - Role toggle for testing (Buyer/Dealer)
 * - Payment flow with reusable PaymentModal
 * - Email notification after successful payment
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
  Image,
  ImageBackground,
  ScaledSize,
  Animated,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

// Components
import { SubscriptionCard } from '../components/SubscriptionCard';

// Design System
import { Text, Spacer } from '../design-system';
import { Colors, Spacing, SpacingMobile, BorderRadius, Shadows, responsive } from '../design-system/primitives';

// Context
import { useAuth } from '../contexts/AuthContext';

// Data
import {
  VEHICLES,
  DEALER_NAMES,
  getVehicleBackgroundImage,
  formatFullPrice,
  formatMileage,
} from '../data/vehicles';

// Assets
const VERIFIED_BADGE = require('../../assets/icons/verified-badge.png');

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;
type MessagesScreenRouteProp = RouteProp<RootStackParamList, 'Messages'>;

interface MessagesScreenProps {
  navigation: MessagesScreenNavigationProp;
  route: MessagesScreenRouteProp;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

type MessageType =
  | 'text'
  | 'offer'
  | 'counter_offer'
  | 'purchase_request'
  | 'offer_accepted'
  | 'offer_declined'
  | 'purchase_confirmed'
  | 'payment_complete'
  | 'deal_confirmed'
  | 'system'
  | 'vehicle_card';

type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  sender: 'buyer' | 'dealer' | 'system';
  timestamp: Date;
  data?: {
    amount?: number;
    originalPrice?: number;
    status?: OfferStatus;
    counterAmount?: number;
    negotiationRound?: number;
    vehicleId?: string;
    buyerEmail?: string;
    buyerName?: string;
    buyerPhone?: string;
    buyerABN?: string;
    buyerBusinessName?: string;
    buyerState?: string;
    buyerPostcode?: string;
    consentGiven?: boolean;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate initials from a name
 * Handles gaming-style usernames (e.g., AutoKing_99 -> AK)
 * For underscored names, takes first letter of each part
 * For camelCase/PascalCase, extracts capital letters
 */
const getInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return '??';

  // Remove numbers and clean up
  const cleanName = name.replace(/[0-9]/g, '').trim();

  // Split by underscore first (for names like AutoKing_99)
  const parts = cleanName.split('_').filter(Boolean);

  if (parts.length >= 2) {
    // Take first letter of first two parts (e.g., AutoKing_X -> AX)
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // For single part names, try to extract from camelCase/PascalCase
  const singlePart = parts[0] || cleanName;
  const capitals = singlePart.match(/[A-Z]/g);

  if (capitals && capitals.length >= 2) {
    return (capitals[0] + capitals[1]).toUpperCase();
  }

  // Fallback: first two characters
  return singlePart.substring(0, 2).toUpperCase();
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DEALER = {
  name: DEALER_NAMES[0], // AutoKing_99 - using gaming-style username
  rating: 4.8,
  verified: true,
  email: 'autoking99@autoconnex.com.au',
};

const MOCK_BUYER = {
  name: DEALER_NAMES[7], // GearHead_Pro - using gaming-style username for buyer too
  verified: false,
  email: 'gearhead.pro@email.com',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation, route }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();

  // Track viewport width for responsive sizing
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Calculate responsive padding
  const responsivePadding = getResponsiveSpacing('md', viewportWidth);

  // Get params from navigation
  const { vehicleId, offerAmount, offerMessage, isPurchase, purchaseMessage } = route.params || {};

  // Get vehicle data
  const vehicle = useMemo(() => {
    if (vehicleId) {
      return VEHICLES.find((v) => v.id === vehicleId) || VEHICLES[0];
    }
    return VEHICLES[0];
  }, [vehicleId]);

  // ============================================================================
  // STATE
  // ============================================================================

  // Role toggle for testing (buyer or dealer view)
  const [currentRole, setCurrentRole] = useState<'buyer' | 'dealer'>('buyer');

  // Messages state - starts empty
  const [messages, setMessages] = useState<Message[]>([]);

  // Input state
  const [messageText, setMessageText] = useState('');

  // Modal states
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [pendingOfferMessageId, setPendingOfferMessageId] = useState<string | null>(null);
  const [pendingOfferAmount, setPendingOfferAmount] = useState<number>(0);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentContext, setPaymentContext] = useState<'offer' | 'purchase' | null>(null);

  // Quick action menu state
  const [showQuickActionMenu, setShowQuickActionMenu] = useState(false);

  // Negotiation tracking
  const [negotiationRound, setNegotiationRound] = useState(0);
  const MAX_NEGOTIATION_ROUNDS = 2;
  
  // Buyer details section toggle
  const [buyerDetailsExpanded, setBuyerDetailsExpanded] = useState(true);

  // Animation refs for Deal Confirmed card
  const dealCardFadeAnim = useRef(new Animated.Value(0)).current;
  const dealCardScaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;

  // ============================================================================
  // HELPERS
  // ============================================================================

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    scrollToBottom();
    return newMessage.id;
  }, [scrollToBottom]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  // ============================================================================
  // INITIAL MESSAGE EFFECT
  // ============================================================================

  useEffect(() => {
    // Only run once when component mounts
    if (messages.length > 0) return;

    // Add vehicle card first
    addMessage({
      type: 'vehicle_card',
      content: 'Vehicle Details',
      sender: 'system',
      data: { vehicleId: vehicle.id },
    });

    // If coming with an offer amount, auto-send the offer
    if (offerAmount) {
      setTimeout(() => {
        addMessage({
          type: 'offer',
          content: offerMessage || `I'd like to make an offer on this vehicle.`,
          sender: 'buyer',
          data: {
            amount: offerAmount,
            originalPrice: vehicle.askingPrice || vehicle.price,
            status: 'pending',
            negotiationRound: 1,
          },
        });
        setNegotiationRound(1);
      }, 300);
    }

    // If coming with a purchase request
    if (isPurchase) {
      setTimeout(() => {
        addMessage({
          type: 'purchase_request',
          content: purchaseMessage || 'I would like to purchase this vehicle at the asking price.',
          sender: 'buyer',
          data: {
            amount: vehicle.askingPrice || vehicle.price,
            status: 'pending',
          },
        });
      }, 300);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // DEAL CONFIRMED ANIMATION EFFECT
  // ============================================================================

  // Trigger animations when a deal_confirmed message appears
  useEffect(() => {
    const hasDealConfirmed = messages.some((m) => m.type === 'deal_confirmed');
    if (hasDealConfirmed) {
      // Reset animations first
      dealCardFadeAnim.setValue(0);
      dealCardScaleAnim.setValue(0.8);
      checkmarkScaleAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.timing(dealCardFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(dealCardScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Delayed checkmark animation
      setTimeout(() => {
        Animated.spring(checkmarkScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }, 150);
    }
  }, [messages, dealCardFadeAnim, dealCardScaleAnim, checkmarkScaleAnim]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;

    addMessage({
      type: 'text',
      content: messageText.trim(),
      sender: currentRole,
    });

    setMessageText('');
  }, [messageText, addMessage, currentRole]);

  // Dealer accepts an offer
  const handleAcceptOffer = useCallback((messageId: string, amount: number) => {
    // Update the original offer status to accepted
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, data: { ...msg.data, status: 'accepted' as OfferStatus } }
          : msg
      )
    );

    // Show payment modal - acceptance message will be sent after payment
    setPaymentAmount(amount);
    setPaymentContext('offer');
    setShowPaymentModal(true);
  }, []);

  // Dealer declines an offer
  const handleDeclineOffer = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, data: { ...msg.data, status: 'declined' as OfferStatus } }
          : msg
      )
    );

    addMessage({
      type: 'offer_declined',
      content: 'Sorry, I cannot accept this offer. The price is too low.',
      sender: 'dealer',
    });
  }, [addMessage]);

  // Dealer sends a counter offer
  const handleCounterOffer = useCallback((messageId: string, currentOfferAmount: number) => {
    if (negotiationRound >= MAX_NEGOTIATION_ROUNDS) {
      addMessage({
        type: 'system',
        content: 'Maximum negotiation rounds reached. Please accept or decline.',
        sender: 'system',
      });
      return;
    }
    setPendingOfferMessageId(messageId);
    setPendingOfferAmount(currentOfferAmount);
    setShowCounterModal(true);
  }, [negotiationRound, addMessage]);

  // Submit counter offer (works for both dealer counter and buyer new offer)
  const handleSubmitCounterOffer = useCallback(() => {
    const amount = parseInt(counterAmount.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0) return;

    // Determine if this is a response to an existing offer or a new offer
    const isCounterToExisting = pendingOfferMessageId !== null;

    if (isCounterToExisting) {
      // Update original offer as countered
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingOfferMessageId
            ? { ...msg, data: { ...msg.data, status: 'countered' as OfferStatus } }
            : msg
        )
      );
    }

    // Send offer/counter offer based on current role
    const messageContent = counterMessage.trim() ||
      (currentRole === 'dealer'
        ? `I can offer the vehicle at ${formatFullPrice(amount)}.`
        : `I'd like to make an offer of ${formatFullPrice(amount)}.`);

    addMessage({
      type: isCounterToExisting ? 'counter_offer' : 'offer',
      content: messageContent,
      sender: currentRole,
      data: {
        amount,
        originalPrice: vehicle.askingPrice || vehicle.price,
        status: 'pending',
        negotiationRound: isCounterToExisting ? negotiationRound + 1 : 1,
      },
    });

    if (isCounterToExisting) {
      setNegotiationRound((prev) => prev + 1);
    } else {
      setNegotiationRound(1);
    }

    setShowCounterModal(false);
    setCounterAmount('');
    setCounterMessage('');
    setPendingOfferMessageId(null);
    setPendingOfferAmount(0);
  }, [counterAmount, counterMessage, pendingOfferMessageId, negotiationRound, addMessage, currentRole, vehicle]);

  // Buyer accepts counter offer
  const handleAcceptCounterOffer = useCallback((messageId: string, amount: number) => {
    // Update the counter offer status to accepted
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, data: { ...msg.data, status: 'accepted' as OfferStatus } }
          : msg
      )
    );

    // Send acceptance message (buyer already paid transaction fee with initial offer)
    addMessage({
      type: 'offer_accepted',
      content: `I accept your counter offer of ${formatFullPrice(amount)}!`,
      sender: 'buyer',
      data: { amount },
    });

    // Show system message about next steps
    setTimeout(() => {
      addMessage({
        type: 'system',
        content: 'Counter offer accepted! The dealer will receive notification and arrange pickup details.',
        sender: 'system',
      });
    }, 500);
  }, [addMessage]);

  // Buyer declines counter offer
  const handleDeclineCounterOffer = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, data: { ...msg.data, status: 'declined' as OfferStatus } }
          : msg
      )
    );

    addMessage({
      type: 'text',
      content: "I'll pass on this one. Thanks for your time.",
      sender: 'buyer',
    });
  }, [addMessage]);

  // Dealer confirms purchase request
  const handleConfirmPurchase = useCallback((messageId: string, amount: number) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, data: { ...msg.data, status: 'accepted' as OfferStatus } }
          : msg
      )
    );

    // Show payment modal - confirmation message will be sent after payment
    setPaymentAmount(amount);
    setPaymentContext('purchase');
    setShowPaymentModal(true);
  }, []);

  // Handle payment initiation
  const handleInitiatePayment = useCallback(() => {
    setShowPaymentModal(true);
  }, []);

  // Handle payment success
  const handlePaymentSuccess = useCallback((paymentData: any) => {
    setShowPaymentModal(false);

    // Send the acceptance/confirmation message based on context
    // Note: Only dealer pays when accepting offer, and when confirming purchase
    if (paymentContext === 'offer') {
      // Dealer accepting buyer's offer
      addMessage({
        type: 'offer_accepted',
        content: `Offer of ${formatFullPrice(paymentAmount)} has been accepted!`,
        sender: 'dealer',
        data: { amount: paymentAmount },
      });

      // Show Deal Confirmed card with buyer email reveal
      setTimeout(() => {
        addMessage({
          type: 'deal_confirmed',
          content: 'Deal confirmed! Buyer contact details revealed.',
          sender: 'system',
          data: {
            amount: paymentAmount,
            buyerEmail: user?.email || MOCK_BUYER.email,
            buyerName: user?.fullName || MOCK_BUYER.name,
            buyerPhone: user?.phone,
            buyerABN: user?.abn,
            buyerBusinessName: user?.businessName,
            buyerState: user?.state,
            buyerPostcode: user?.postcode,
            consentGiven: user?.consentToShareDetails || false,
          },
        });
      }, 600);
    } else if (paymentContext === 'purchase') {
      // Dealer confirming purchase request
      addMessage({
        type: 'purchase_confirmed',
        content: 'Purchase confirmed! The vehicle is reserved for you.',
        sender: 'dealer',
        data: { amount: paymentAmount },
      });

      // Show Deal Confirmed card with buyer email reveal
      setTimeout(() => {
        addMessage({
          type: 'deal_confirmed',
          content: 'Deal confirmed! Buyer contact details revealed.',
          sender: 'system',
          data: {
            amount: paymentAmount,
            buyerEmail: user?.email || MOCK_BUYER.email,
            buyerName: user?.fullName || MOCK_BUYER.name,
            buyerPhone: user?.phone,
            buyerABN: user?.abn,
            buyerBusinessName: user?.businessName,
            buyerState: user?.state,
            buyerPostcode: user?.postcode,
            consentGiven: user?.consentToShareDetails || false,
          },
        });
      }, 600);
    }

    // Reset payment context (removed all payment-related system messages)
    setPaymentContext(null);
  }, [paymentAmount, paymentContext, currentRole, addMessage]);

  // ============================================================================
  // RENDER VEHICLE CARD (HomeScreen style with ImageBackground)
  // ============================================================================

  const renderVehicleCard = () => {
    if (!vehicle) return null;

    return (
      <TouchableOpacity
        style={styles.vehicleCard}
        activeOpacity={0.98}
        onPress={() => navigation.navigate('VehicleDetails', { vehicleId: vehicle.id })}
      >
        <ImageBackground
          source={getVehicleBackgroundImage(vehicle.backgroundImageIndex)}
          style={styles.vehicleImageBackground}
          imageStyle={styles.vehicleImageStyle}
        >
          <View style={styles.imageOverlay} />
        </ImageBackground>

        <View style={styles.vehicleDetails}>
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

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
            <Text variant="caption" style={styles.locationText}>
              {vehicle.suburb}, {vehicle.state}
            </Text>
            {vehicle.registration && (
              <>
                <View style={styles.dotSeparator} />
                <Text variant="caption" style={styles.registrationText}>{vehicle.registration}</Text>
              </>
            )}
            <View style={styles.dotSeparator} />
            <Text variant="caption" style={styles.dealerName}>{vehicle.dealerName}</Text>
          </View>

          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Ionicons name="speedometer-outline" size={14} color={Colors.textMuted} />
              <Text variant="caption" style={styles.specItemText}>{formatMileage(vehicle.mileage)}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="cog-outline" size={14} color={Colors.textMuted} />
              <Text variant="caption" style={styles.specItemText}>
                {vehicle.transmission === 'automatic' ? 'Auto' : 'Manual'}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="flash-outline" size={14} color={Colors.textMuted} />
              <Text variant="caption" style={styles.specItemText}>
                {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text variant="caption" style={styles.priceLabel}>Asking Price</Text>
              <Text variant="h4" weight="bold" style={styles.priceValue}>
                {formatFullPrice(vehicle.askingPrice || vehicle.price)}
              </Text>
            </View>
            <View style={styles.viewDetailsButton}>
              <Text variant="bodySmall" weight="semibold" style={styles.viewDetailsText}>
                View Details
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.white} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ============================================================================
  // RENDER MESSAGE
  // ============================================================================

  const renderMessage = (message: Message) => {
    const isCurrentUser =
      (currentRole === 'buyer' && message.sender === 'buyer') ||
      (currentRole === 'dealer' && message.sender === 'dealer');
    const isSystem = message.sender === 'system';

    // Vehicle Card
    if (message.type === 'vehicle_card') {
      return (
        <View key={message.id} style={styles.vehicleCardContainer}>
          {renderVehicleCard()}
        </View>
      );
    }

    // Deal Confirmed Card - Role-based views for buyer and wholesaler
    if (message.type === 'deal_confirmed' && message.data?.buyerEmail) {
      
      // Share buyer details via native share sheet
      const handleShareDetails = async () => {
        const details = `🚗 BUYER INVOICE DETAILS
━━━━━━━━━━━━━━━━━━━━━
${message.data!.buyerName || 'N/A'}
✉️ ${message.data!.buyerEmail || 'N/A'}
${message.data!.buyerPhone ? `📱 ${message.data!.buyerPhone}` : ''}

💼 ABN: ${message.data!.buyerABN || 'N/A'}
🏢 ${message.data!.buyerBusinessName || 'N/A'}
📍 ${message.data!.buyerState || ''} ${message.data!.buyerPostcode || ''}

🚘 Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}
💰 Agreed Price: ${message.data!.amount ? formatFullPrice(message.data!.amount) : 'N/A'}
📅 ${formatTime(message.timestamp)}`;
        
        try {
          await Share.share({
            message: details,
            title: 'Buyer Invoice Details',
          });
        } catch (error) {
          console.log('Share error:', error);
        }
      };

      // Copy all details to clipboard (silent - no toast)
      const handleCopyAllDetails = async () => {
        const details = `BUYER INVOICE DETAILS
━━━━━━━━━━━━━━━━━━━━━
Name: ${message.data!.buyerName || 'N/A'}
Email: ${message.data!.buyerEmail || 'N/A'}
Phone: ${message.data!.buyerPhone || 'N/A'}

ABN: ${message.data!.buyerABN || 'N/A'}
Business Name: ${message.data!.buyerBusinessName || 'N/A'}
Location: ${message.data!.buyerState || ''} ${message.data!.buyerPostcode || ''}

Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}
Agreed Price: ${message.data!.amount ? formatFullPrice(message.data!.amount) : 'N/A'}
Date: ${formatTime(message.timestamp)}`;
        
        await Clipboard.setStringAsync(details);
      };

      // Copy email only (silent - no toast)
      const handleCopyEmail = async () => {
        await Clipboard.setStringAsync(message.data!.buyerEmail!);
      };

      // Format ABN for display
      const formatABN = (abn: string) => {
        const cleaned = abn.replace(/\s/g, '');
        if (cleaned.length === 11) {
          return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 11)}`;
        }
        return abn;
      };

      return (
        <View key={message.id} style={styles.dealCardWrapper}>
          <Animated.View
            style={[
              styles.dealCard,
              {
                opacity: dealCardFadeAnim,
                transform: [{ scale: dealCardScaleAnim }],
              }
            ]}
          >
            {/* Animated checkmark with rings */}
            <View style={styles.checkmarkContainer}>
              <View style={styles.outerRing} />
              <Animated.View
                style={[
                  styles.innerCircle,
                  { transform: [{ scale: checkmarkScaleAnim }] }
                ]}
              >
                <Ionicons name="checkmark" size={28} color={Colors.white} />
              </Animated.View>
            </View>

            <Spacer size="sm" />

            {/* Title */}
            <Text variant="h4" weight="bold" align="center" style={styles.dealCardTitle}>
              Deal Confirmed!
            </Text>

            {/* Agreed Price */}
            {message.data?.amount && (
              <View style={styles.dealAmountContainer}>
                <Text variant="caption" color="textMuted" align="center">
                  Agreed Price
                </Text>
                <Text variant="h3" weight="bold" style={styles.dealAmountText}>
                  {formatFullPrice(message.data.amount)}
                </Text>
              </View>
            )}

            <Spacer size="md" />

            {/* Role-specific content */}
            {currentRole === 'buyer' ? (
              /* BUYER VIEW */
              <View style={styles.roleContentSection}>
                <View style={styles.roleContentHeader}>
                  <View style={styles.roleIconCircle}>
                    <Ionicons name="mail-open-outline" size={18} color={Colors.primary} />
                  </View>
                  <Text variant="bodySmall" weight="semibold" color="text">
                    Check Your Email
                  </Text>
                </View>
                <Text variant="caption" color="textSecondary" style={styles.roleContentMessage}>
                  The wholesaler will send you an invoice shortly. Keep an eye on your inbox!
                </Text>
              </View>
            ) : (
              /* WHOLESALER/DEALER VIEW - Modern design with share functionality */
              <View style={styles.roleContentSection}>
                {message.data.consentGiven ? (
                  /* Full buyer details when consent given */
                  <>
                    <TouchableOpacity
                      style={styles.buyerDetailsHeader}
                      onPress={() => setBuyerDetailsExpanded(!buyerDetailsExpanded)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.roleContentHeader}>
                        <View style={styles.roleIconCircle}>
                          <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
                        </View>
                        <Text variant="bodySmall" weight="semibold" color="text" style={{ flex: 1 }}>
                          Buyer's Invoice Details
                        </Text>
                        <Ionicons
                          name={buyerDetailsExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={Colors.textMuted}
                        />
                      </View>
                    </TouchableOpacity>

                    <Text variant="caption" color="textSecondary" style={styles.roleContentMessage}>
                      All information needed to create an invoice
                    </Text>

                    {buyerDetailsExpanded && (
                      <>
                        <Spacer size="sm" />

                        {/* Buyer Details Card - Clean Modern Design */}
                        <View style={styles.buyerDetailsCard}>
                          {/* Full Name */}
                          {message.data.buyerName && (
                            <View style={styles.detailRow}>
                              <Text variant="caption" weight="medium" style={styles.detailLabel}>
                                NAME
                              </Text>
                              <Text variant="bodySmall" weight="semibold" style={styles.detailValue}>
                                {message.data.buyerName}
                              </Text>
                            </View>
                          )}

                          {/* Email */}
                          {message.data.buyerEmail && (
                            <View style={styles.detailRow}>
                              <Text variant="caption" weight="medium" style={styles.detailLabel}>
                                EMAIL
                              </Text>
                              <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                                {message.data.buyerEmail}
                              </Text>
                            </View>
                          )}

                          {/* Phone */}
                          {message.data.buyerPhone && (
                            <View style={styles.detailRow}>
                              <Text variant="caption" weight="medium" style={styles.detailLabel}>
                                PHONE
                              </Text>
                              <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                                {message.data.buyerPhone}
                              </Text>
                            </View>
                          )}

                          {/* Divider */}
                          <View style={styles.detailDivider} />

                          {/* ABN */}
                          {message.data.buyerABN && (
                            <View style={styles.detailRow}>
                              <Text variant="caption" weight="medium" style={styles.detailLabel}>
                                ABN
                              </Text>
                              <Text variant="bodySmall" weight="semibold" style={styles.detailValue}>
                                {formatABN(message.data.buyerABN)}
                              </Text>
                            </View>
                          )}

                          {/* Business Name */}
                          {message.data.buyerBusinessName && (
                            <View style={styles.detailRow}>
                              <Text variant="caption" weight="medium" style={styles.detailLabel}>
                                BUSINESS
                              </Text>
                              <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                                {message.data.buyerBusinessName}
                              </Text>
                            </View>
                          )}

                          {/* Location */}
                          {(message.data.buyerState || message.data.buyerPostcode) && (
                            <View style={styles.detailRow}>
                              <Text variant="caption" weight="medium" style={styles.detailLabel}>
                                LOCATION
                              </Text>
                              <Text variant="bodySmall" weight="medium" style={styles.detailValue}>
                                {message.data.buyerState} {message.data.buyerPostcode}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Spacer size="sm" />

                        {/* Action Buttons Row - Copy & Share */}
                        <View style={styles.actionButtonsRow}>
                          <TouchableOpacity
                            style={styles.secondaryActionButton}
                            onPress={handleCopyAllDetails}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="copy-outline" size={18} color={Colors.black} />
                            <Text variant="bodySmall" weight="semibold" style={styles.secondaryActionButtonText}>
                              Copy
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.primaryActionButton}
                            onPress={handleShareDetails}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="share-outline" size={18} color={Colors.black} />
                            <Text variant="bodySmall" weight="semibold" style={styles.primaryActionButtonText}>
                              Share Details
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  /* No consent given - show limited info */
                  <>
                    <View style={styles.roleContentHeader}>
                      <View style={styles.roleIconCircle}>
                        <Ionicons name="alert-circle-outline" size={18} color={Colors.warning} />
                      </View>
                      <Text variant="bodySmall" weight="semibold" color="text">
                        Limited Information
                      </Text>
                    </View>
                    <Text variant="caption" color="textSecondary" style={styles.roleContentMessage}>
                      The buyer has not consented to share detailed information. Contact them directly.
                    </Text>

                    <Spacer size="xs" />

                    {/* Email only - Clean display with copy button */}
                    <View style={styles.limitedInfoCard}>
                      <View style={styles.limitedInfoRow}>
                        <Ionicons name="mail" size={16} color={Colors.secondary} />
                        <Text variant="bodySmall" weight="medium" style={styles.limitedInfoEmail}>
                          {message.data.buyerEmail}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.limitedInfoCopyButton}
                        onPress={handleCopyEmail}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="copy-outline" size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Timestamp */}
            <Text variant="caption" color="textMuted" align="center" style={styles.dealTimestamp}>
              {formatTime(message.timestamp)}
            </Text>
          </Animated.View>
        </View>
      );
    }

    // Payment Complete Card - DISABLED (don't show in chat)
    // if (message.type === 'payment_complete' && message.data?.amount) {
    //   return (
    //     <View key={message.id} style={[styles.offerCardWrapper, styles.paymentCardCenter]}>
    //       <View style={[styles.offerCard, styles.paymentCompleteCard]}>
    //         {/* Card Header */}
    //         <View style={styles.paymentCompleteHeader}>
    //           <Ionicons name="checkmark-circle" size={14} color={Colors.white} />
    //           <Text variant="caption" weight="semibold" style={styles.offerCardHeaderText}>
    //             Payment Successful
    //           </Text>
    //         </View>
    //
    //         {/* Card Body */}
    //         <View style={styles.offerCardBody}>
    //           <Text variant="h3" weight="bold" style={styles.paymentCompletePrice}>
    //             {formatFullPrice(message.data.amount)}
    //           </Text>
    //           <Text variant="bodySmall" color="success" style={styles.paymentCompleteMessage}>
    //             Transaction complete
    //           </Text>
    //           <Text variant="label" color="textMuted" style={styles.paymentCompleteTime}>
    //             {formatTime(message.timestamp)}
    //           </Text>
    //         </View>
    //       </View>
    //     </View>
    //   );
    // }

    if (isSystem) {
      return (
        <View key={message.id} style={styles.systemMessageContainer}>
          <View style={styles.systemMessage}>
            <Text variant="caption" color="textMuted" align="center">
              {message.content}
            </Text>
          </View>
        </View>
      );
    }

    // Check message types
    const isOffer = message.type === 'offer' || message.type === 'counter_offer';
    const isPurchaseReq = message.type === 'purchase_request';
    const showDealerActions =
      currentRole === 'dealer' &&
      (message.type === 'offer' || message.type === 'purchase_request') &&
      message.data?.status === 'pending';
    const showBuyerActions =
      currentRole === 'buyer' &&
      message.type === 'counter_offer' &&
      message.data?.status === 'pending';

    // Offer/Purchase Request - Full-width brand-compliant card
    if ((isOffer || isPurchaseReq) && message.data) {
      const isSenderCurrentUser =
        (currentRole === 'buyer' && message.sender === 'buyer') ||
        (currentRole === 'dealer' && message.sender === 'dealer');

      return (
        <View key={message.id} style={styles.offerCardWrapper}>
          {/* Full-width Offer Card */}
          <View style={styles.offerCard}>
            {/* Card Header with gradient-like styling */}
            <View style={[
              styles.offerCardHeader,
              isPurchaseReq ? styles.offerCardHeaderPurchase : styles.offerCardHeaderOffer,
            ]}>
              <View style={styles.offerCardHeaderLeft}>
                <View style={[
                  styles.offerCardIconCircle,
                  styles.offerCardIconCircleDark,
                ]}>
                  <Ionicons
                    name={isPurchaseReq ? 'cart' : 'pricetag'}
                    size={18}
                    color={Colors.white}
                  />
                </View>
                <View>
                  <Text variant="bodySmall" weight="bold" style={styles.offerCardHeaderTextLight}>
                    {isPurchaseReq ? 'Purchase Request' : message.type === 'counter_offer' ? 'Counter Offer' : 'Price Offer'}
                  </Text>
                  <Text variant="caption" style={styles.offerCardHeaderSubtextLight}>
                    from {message.sender === 'buyer' ? MOCK_BUYER.name : MOCK_DEALER.name}
                  </Text>
                </View>
              </View>
              <View style={styles.offerCardHeaderRight}>
                <Text variant="caption" style={styles.offerCardTimeTextLight}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>

            {/* Card Body */}
            <View style={styles.offerCardBody}>
              {/* Price Section */}
              <View style={styles.offerPriceSection}>
                <Text variant="caption" color="textTertiary" style={styles.offerPriceLabel}>
                  Offered Amount
                </Text>
                <Text variant="h2" weight="bold" style={styles.offerCardPrice}>
                  {formatFullPrice(message.data.amount || 0)}
                </Text>
              </View>

              {/* Status Badge - Only show for non-pending statuses */}
              {message.data.status !== 'pending' && (
                <View style={styles.offerCardStatusRow}>
                  <View style={[
                    styles.offerCardStatus,
                    message.data.status === 'accepted' && styles.statusAccepted,
                    message.data.status === 'declined' && styles.statusDeclined,
                    message.data.status === 'countered' && styles.statusCountered,
                  ]}>
                    <Ionicons
                      name={
                        message.data.status === 'accepted' ? 'checkmark' :
                        message.data.status === 'declined' ? 'close' : 'swap-horizontal'
                      }
                      size={12}
                      color={Colors.text}
                    />
                    <Text variant="label" weight="semibold" style={styles.statusText}>
                      {message.data.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons - Inside the card for dealer/buyer */}
              {showDealerActions && (
                <View style={styles.offerCardActions}>
                  <TouchableOpacity
                    style={[styles.offerActionBtn, styles.acceptBtn]}
                    onPress={() => isPurchaseReq
                      ? handleConfirmPurchase(message.id, message.data!.amount!)
                      : handleAcceptOffer(message.id, message.data!.amount!)
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                    <Text variant="bodySmall" weight="semibold" style={styles.actionBtnText}>Accept</Text>
                  </TouchableOpacity>

                  {!isPurchaseReq && (
                    <TouchableOpacity
                      style={[styles.offerActionBtn, styles.counterBtn]}
                      onPress={() => handleCounterOffer(message.id, message.data!.amount!)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="swap-horizontal" size={16} color={Colors.white} />
                      <Text variant="bodySmall" weight="semibold" style={styles.actionBtnText}>Counter</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.offerActionBtn, styles.declineBtn]}
                    onPress={() => handleDeclineOffer(message.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={16} color={Colors.white} />
                    <Text variant="bodySmall" weight="semibold" style={styles.actionBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showBuyerActions && (
                <View style={styles.offerCardActions}>
                  <TouchableOpacity
                    style={[styles.offerActionBtn, styles.acceptBtn]}
                    onPress={() => handleAcceptCounterOffer(message.id, message.data!.amount!)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                    <Text variant="bodySmall" weight="semibold" style={styles.actionBtnText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.offerActionBtn, styles.declineBtn]}
                    onPress={() => handleDeclineCounterOffer(message.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={16} color={Colors.white} />
                    <Text variant="bodySmall" weight="semibold" style={styles.actionBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Message shown as bubble below the card */}
          {message.content && (
            <View style={[
              styles.messageRow,
              isSenderCurrentUser ? styles.messageRowUser : styles.messageRowOther,
              styles.offerMessageBubbleRow,
            ]}>
              {!isSenderCurrentUser && (
                <View style={styles.avatarSmall}>
                  <Text variant="label" weight="semibold" style={styles.avatarText}>
                    {getInitials(message.sender === 'dealer' ? MOCK_DEALER.name : MOCK_BUYER.name)}
                  </Text>
                </View>
              )}
              <View style={[
                styles.messageBubble,
                isSenderCurrentUser ? styles.messageBubbleUser : styles.messageBubbleOther,
              ]}>
                <Text variant="bodySmall" color={isSenderCurrentUser ? 'white' : 'text'}>
                  {message.content}
                </Text>
              </View>
            </View>
          )}
        </View>
      );
    }

    // Regular text message or status message
    return (
      <View
        key={message.id}
        style={[
          styles.messageRow,
          isCurrentUser ? styles.messageRowUser : styles.messageRowOther,
        ]}
      >
        {/* Avatar for other user's messages */}
        {!isCurrentUser && (
          <View style={styles.avatarSmall}>
            <Text variant="label" weight="semibold" style={styles.avatarText}>
              {getInitials(message.sender === 'dealer' ? MOCK_DEALER.name : MOCK_BUYER.name)}
            </Text>
          </View>
        )}

        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.messageBubbleUser : styles.messageBubbleOther,
        ]}>
          {/* Regular Text Message */}
          {message.type === 'text' && (
            <Text variant="bodySmall" color={isCurrentUser ? 'white' : 'text'}>
              {message.content}
            </Text>
          )}

          {/* Accepted/Declined/Confirmed Messages - Simple text only */}
          {(message.type === 'offer_accepted' || message.type === 'offer_declined' || message.type === 'purchase_confirmed') && (
            <Text variant="bodySmall" color={isCurrentUser ? 'white' : 'text'}>
              {message.content}
            </Text>
          )}

          <Text
            variant="label"
            color={isCurrentUser ? 'white' : 'textMuted'}
            style={styles.messageTime}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text variant="caption" weight="semibold" style={styles.avatarText}>
                {getInitials(currentRole === 'buyer' ? MOCK_DEALER.name : MOCK_BUYER.name)}
              </Text>
              {currentRole === 'buyer' && MOCK_DEALER.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={8} color={Colors.white} />
                </View>
              )}
            </View>
            <View style={styles.headerText}>
              <Text variant="bodySmall" weight="semibold">
                {currentRole === 'buyer' ? MOCK_DEALER.name : MOCK_BUYER.name}
              </Text>
              <Text variant="caption" color="textMuted">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.registration ? `• ${vehicle.registration}` : ''}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Role Toggle - For Testing */}
        <View style={styles.roleToggleContainer}>
          <Text variant="caption" color="textMuted">Viewing as:</Text>
          <View style={styles.roleToggle}>
            <TouchableOpacity
              style={[styles.roleOption, currentRole === 'buyer' && styles.roleOptionActive]}
              onPress={() => setCurrentRole('buyer')}
              activeOpacity={0.7}
            >
              <Text
                variant="caption"
                weight={currentRole === 'buyer' ? 'semibold' : 'regular'}
                style={currentRole === 'buyer' ? styles.roleTextActive : styles.roleText}
              >
                Buyer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleOption, currentRole === 'dealer' && styles.roleOptionActive]}
              onPress={() => setCurrentRole('dealer')}
              activeOpacity={0.7}
            >
              <Text
                variant="caption"
                weight={currentRole === 'dealer' ? 'semibold' : 'regular'}
                style={currentRole === 'dealer' ? styles.roleTextActive : styles.roleText}
              >
                Dealer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(renderMessage)}
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
              <Spacer size="md" />
              <Text variant="body" color="textMuted" align="center">
                Start a conversation about this vehicle
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          {/* Quick Action Button - Opens Action Menu */}
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowQuickActionMenu(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textTertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Make Offer / Counter Offer Modal */}
        <Modal
          visible={showCounterModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowCounterModal(false);
            setCounterAmount('');
            setCounterMessage('');
            setPendingOfferMessageId(null);
            setPendingOfferAmount(0);
          }}
        >
          <TouchableWithoutFeedback onPress={() => setShowCounterModal(false)}>
            <View style={styles.offerModalOverlay}>
              <TouchableWithoutFeedback>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                  <View style={styles.offerModalContent}>
                    {/* Header with Icon */}
                    <View style={styles.offerModalHeader}>
                      <View style={[
                        styles.offerModalIconBadge,
                        pendingOfferMessageId ? styles.counterOfferBadge : styles.newOfferBadge,
                      ]}>
                        <Ionicons
                          name={pendingOfferMessageId ? 'swap-horizontal' : 'pricetag'}
                          size={24}
                          color={Colors.white}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setShowCounterModal(false);
                          setCounterAmount('');
                          setCounterMessage('');
                          setPendingOfferMessageId(null);
                          setPendingOfferAmount(0);
                        }}
                        style={styles.offerModalCloseButton}
                      >
                        <Ionicons name="close" size={24} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <Text variant="h4" weight="bold" align="center">
                      {pendingOfferMessageId ? 'Counter Offer' : 'Make an Offer'}
                    </Text>

                    <Spacer size="md" />

                    {/* Vehicle Info Card */}
                    <View style={styles.offerVehicleCard}>
                      <Text variant="bodySmall" weight="semibold" color="secondary" align="center">
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.registration ? `• ${vehicle.registration}` : ''}
                      </Text>
                      <View style={styles.offerVehiclePriceRow}>
                        <Text variant="caption" color="textMuted">Asking Price:</Text>
                        <Text variant="body" weight="bold" color="text">
                          {formatFullPrice(vehicle.askingPrice || vehicle.price)}
                        </Text>
                      </View>
                      {/* Show current offer when countering */}
                      {pendingOfferMessageId && pendingOfferAmount > 0 && (
                        <View style={styles.offerVehiclePriceRow}>
                          <Text variant="caption" color="textMuted">Their Offer:</Text>
                          <Text variant="body" weight="bold" color="accent">
                            {formatFullPrice(pendingOfferAmount)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Spacer size="md" />

                    {/* Negotiation Round Indicator (only for counter offers) */}
                    {pendingOfferMessageId && (
                      <>
                        <View style={styles.negotiationIndicator}>
                          <View style={styles.negotiationDot} />
                          <Text variant="caption" color="textMuted">
                            Negotiation Round {negotiationRound + 1} of {MAX_NEGOTIATION_ROUNDS}
                          </Text>
                        </View>
                        <Spacer size="sm" />
                      </>
                    )}

                    {/* Price Input */}
                    <Text variant="caption" weight="semibold" color="textTertiary">
                      Your {pendingOfferMessageId ? 'Counter' : 'Offer'} Price
                    </Text>
                    <Spacer size="xs" />
                    <View style={styles.offerPriceInputContainer}>
                      <Text variant="h3" weight="bold" color="primary">$</Text>
                      <TextInput
                        style={styles.offerPriceInput}
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                        value={counterAmount}
                        onChangeText={(text) => setCounterAmount(text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                      />
                    </View>

                    <Spacer size="md" />

                    {/* Message Input */}
                    <Text variant="caption" weight="semibold" color="textTertiary">
                      Add a Message (Optional)
                    </Text>
                    <Spacer size="xs" />
                    <TextInput
                      style={styles.offerMessageInput}
                      placeholder={pendingOfferMessageId
                        ? "e.g., This is my best price..."
                        : "e.g., I'm very interested in this vehicle..."}
                      placeholderTextColor={Colors.textMuted}
                      value={counterMessage}
                      onChangeText={setCounterMessage}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      maxLength={200}
                    />

                    <Spacer size="lg" />

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={[
                        styles.offerSubmitButton,
                        pendingOfferMessageId ? styles.counterSubmitButton : styles.newOfferSubmitButton,
                        !counterAmount && styles.offerSubmitButtonDisabled,
                      ]}
                      onPress={handleSubmitCounterOffer}
                      disabled={!counterAmount}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={pendingOfferMessageId ? 'swap-horizontal' : 'send'}
                        size={18}
                        color={Colors.white}
                      />
                      <Text variant="body" weight="semibold" style={styles.offerSubmitButtonText}>
                        {pendingOfferMessageId ? 'Send Counter Offer' : 'Send Offer'}
                      </Text>
                    </TouchableOpacity>

                    {/* Cancel Button */}
                    <TouchableOpacity
                      style={styles.offerCancelButton}
                      onPress={() => {
                        setShowCounterModal(false);
                        setCounterAmount('');
                        setCounterMessage('');
                        setPendingOfferMessageId(null);
                        setPendingOfferAmount(0);
                      }}
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

        {/* Quick Action Menu Modal */}
        <Modal
          visible={showQuickActionMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQuickActionMenu(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowQuickActionMenu(false)}>
            <View style={styles.quickActionOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.quickActionMenuContent}>
                  {/* Make Offer Option */}
                  <TouchableOpacity
                    style={styles.quickActionMenuItem}
                    onPress={() => {
                      setShowQuickActionMenu(false);
                      setPendingOfferMessageId(null);
                      setPendingOfferAmount(0);
                      setShowCounterModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.quickActionIconWrapper, styles.quickActionIconOffer]}>
                      <Ionicons name="pricetag" size={20} color={Colors.white} />
                    </View>
                    <View style={styles.quickActionTextContainer}>
                      <Text variant="body" weight="semibold">Make an Offer</Text>
                      <Text variant="caption" color="textMuted">Send a price offer for this vehicle</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                  </TouchableOpacity>

                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={styles.quickActionCancelButton}
                    onPress={() => setShowQuickActionMenu(false)}
                    activeOpacity={0.7}
                  >
                    <Text variant="body" weight="medium" color="textMuted">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Payment Modal - SubscriptionCard */}
        <SubscriptionCard
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          amount={paymentAmount}
          vehicleInfo={{
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            variant: vehicle.variant,
            licensePlate: vehicle.registration,
            dealerName: currentRole === 'buyer' ? vehicle.dealerName : undefined,
            buyerName: currentRole === 'dealer' ? MOCK_BUYER.name : undefined,
          }}
          actionType={currentRole === 'buyer' ? 'purchase' : 'offer'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  keyboardAvoid: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  headerText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },

  // Role Toggle
  roleToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  roleOption: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  roleOptionActive: {
    backgroundColor: Colors.primary,
  },
  roleText: {
    color: Colors.textMuted,
  },
  roleTextActive: {
    color: Colors.white,
  },

  // Messages
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  messagesContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },

  // Message Row (for regular messages)
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },

  // Small Avatar
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Message Bubble (for regular text messages)
  messageBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    maxWidth: '75%',
  },
  messageBubbleUser: {
    backgroundColor: Colors.secondary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  messageBubbleOther: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.sm,
    ...Shadows.sm,
  },
  messageTime: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },

  // Message bubble row for offer cards
  offerMessageBubbleRow: {
    marginTop: Spacing.sm,
    marginBottom: 0,
  },

  // Status Message Content
  statusMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusMsgText: {
    flex: 1,
  },

  // Offer Card Wrapper - Full Width
  offerCardWrapper: {
    width: '100%',
    marginBottom: Spacing.lg,
  },

  // Offer Card - Full-width brand-compliant style
  offerCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },

  // Offer Card Header
  offerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  offerCardHeaderOffer: {
    backgroundColor: Colors.secondary,
  },
  offerCardHeaderPurchase: {
    backgroundColor: Colors.secondary,
  },
  offerCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  offerCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerCardIconCircleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  offerCardHeaderText: {
    color: Colors.text,
  },
  offerCardHeaderTextLight: {
    color: Colors.white,
  },
  offerCardHeaderSubtext: {
    color: Colors.textTertiary,
    marginTop: 2,
  },
  offerCardHeaderSubtextLight: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  offerCardHeaderRight: {
    alignItems: 'flex-end',
  },
  offerCardTimeText: {
    color: Colors.textTertiary,
  },
  offerCardTimeTextLight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Offer Card Body
  offerCardBody: {
    padding: Spacing.lg,
  },
  offerPriceSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
  },
  offerPriceLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    marginBottom: 4,
  },
  offerCardPrice: {
    color: Colors.text,
  },
  offerMessageSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  offerCardMessage: {
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Offer Card Status Row
  offerCardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  offerCardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning + '40',
  },
  statusAccepted: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '40',
  },
  statusDeclined: {
    backgroundColor: Colors.accent + '10',
    borderColor: Colors.accent + '40',
  },
  statusCountered: {
    backgroundColor: Colors.secondary + '10',
    borderColor: Colors.secondary + '40',
  },
  statusText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Offer Card Actions
  offerCardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  offerActionBtn: {
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
  acceptBtn: {
    borderColor: Colors.success,
    backgroundColor: Colors.success ,
  },
  counterBtn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  declineBtn: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  actionBtnText: {
    color: Colors.white,
  },

  // Legacy styles (keeping for compatibility)
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  offerMessage: {
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },

  // System Messages
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
    maxWidth: '90%',
  },
  systemMessageSuccess: {
    backgroundColor: Colors.success + '15',
  },
  systemIcon: {
    marginRight: Spacing.xs,
  },

  // Payment Button (legacy)
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  paymentButtonText: {
    color: Colors.white,
  },

  // Payment Card Styles
  paymentCardCenter: {
    justifyContent: 'center',
  },
  paymentCard: {
    backgroundColor: Colors.white,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.secondary,
  },
  paymentVehicleInfo: {
    marginBottom: Spacing.sm,
  },
  paymentCardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  paymentCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },

  // Payment Complete Card Styles
  paymentCompleteCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  paymentCompleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.success,
  },
  paymentCompletePrice: {
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  paymentCompleteMessage: {
    marginBottom: Spacing.xs,
  },
  paymentCompleteTime: {
    marginTop: Spacing.xs,
  },

  // Vehicle Card (HomeScreen style)
  vehicleCardContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  vehicleCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  vehicleImageBackground: {
    width: '100%',
    height: 160,
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
  registrationText: {
    color: Colors.primary,
    fontWeight: '600',
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
    backgroundColor: Colors.surface,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  specItemText: {
    color: '#555',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
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

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
    maxHeight: 100,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: responsive.getFontSize('base'),
    color: Colors.text,
    maxHeight: 80,
    minHeight: 20,
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    ...Shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },

  // Quick Action Button
  quickActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },

  // Quick Action Menu Styles
  quickActionOverlay: {
    flex: 1,
    backgroundColor: Colors.black + 'AA',
    justifyContent: 'flex-end',
  },
  quickActionMenuContent: {
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
  quickActionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  quickActionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  quickActionIconOffer: {
    backgroundColor: Colors.accent,
  },
  quickActionIconPayment: {
    backgroundColor: Colors.primary,
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionCancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },

  // Offer Modal Styles (Brand-compliant)
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  newOfferBadge: {
    backgroundColor: Colors.accent,
  },
  counterOfferBadge: {
    backgroundColor: Colors.secondary,
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

  // Offer Vehicle Card
  offerVehicleCard: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  offerVehiclePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // Negotiation Indicator
  negotiationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  negotiationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },

  // Offer Price Input
  offerPriceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  offerPriceInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: Spacing.xs,
  },

  // Offer Message Input
  offerMessageInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  // Offer Submit Buttons
  offerSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  newOfferSubmitButton: {
    backgroundColor: Colors.accent,
  },
  counterSubmitButton: {
    backgroundColor: Colors.secondary,
  },
  offerSubmitButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.6,
  },
  offerSubmitButtonText: {
    color: Colors.white,
  },
  offerCancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },

  // Legacy Modal Styles (keeping for compatibility)
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.black + 'CC',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? Spacing['3xl'] : Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  modalButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  modalButtonText: {
    color: Colors.white,
  },

  // ============================================================================
  // NEW Deal Confirmed Card Styles (Modern Redesign)
  // ============================================================================

  dealCardWrapper: {
    width: '100%',
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  dealCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    position: 'relative',
    ...Shadows.md,
  },

  // Decorative circles - removed for cleaner look
  decoCircle1: {
    display: 'none',
  },
  decoCircle2: {
    display: 'none',
  },
  decoCircle3: {
    display: 'none',
  },

  // Checkmark rings
  checkmarkContainer: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.success + '20',
  },
  middleRing: {
    display: 'none',
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },

  // Title
  dealCardTitle: {
    color: Colors.text,
  },

  // Amount display
  dealAmountContainer: {
    alignItems: 'center',
  },
  dealAmountText: {
    color: Colors.success,
  },

  // Role-specific content section
  roleContentSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  roleContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  roleIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleContentMessage: {
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },

  // Next steps row
  nextStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },

  // Timestamp
  dealTimestamp: {
    marginTop: Spacing.sm,
  },

  // Enhanced Buyer Details Styles
  buyerDetailsHeader: {
    marginBottom: Spacing.xs,
  },
  buyerDetailsCard: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    padding: SpacingMobile.md,
    borderWidth: 1,
    borderColor: Colors.greyscale300 + '40',
  },
  detailRow: {
    marginBottom: SpacingMobile.sm,
  },
  detailLabel: {
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontSize: responsive.getFontSize('xs'),
  },
  detailValue: {
    color: Colors.text,
    lineHeight: 20,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.greyscale300 + '30',
    marginVertical: SpacingMobile.sm,
  },

  // Action Buttons Row (Design System Compliant)
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 44, // Design system tap target
  },
  secondaryActionButtonText: {
    letterSpacing: 0.3,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 44, // Design system tap target
    ...(Platform.OS === 'android' ? {
      elevation: 2,
    } : {
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    }),
  },
  primaryActionButtonText: {
    letterSpacing: 0.3,
  },

  // Limited Info Card (No Consent - Design System Compliant)
  limitedInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.greyscale300 + '40',
  },
  limitedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  limitedInfoEmail: {
    color: Colors.text,
    flex: 1,
  },
  limitedInfoCopyButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MessagesScreen;
