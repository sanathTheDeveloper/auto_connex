/**
 * MessagesScreen Component
 *
 * Chat interface for car negotiations between buyers and dealers.
 * Features: Price negotiation, transport options,
 * and deal locking flow as per the Auto Connex workflow.
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

// Design System
import { Text, Spacer } from '../design-system';
import { Colors, Spacing, BorderRadius, Shadows, responsive } from '../design-system/primitives';

// Data
import { VEHICLES, getVehicleImage } from '../data/vehicles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;
type MessagesScreenRouteProp = RouteProp<RootStackParamList, 'Messages'>;

interface MessagesScreenProps {
  navigation: MessagesScreenNavigationProp;
  route: MessagesScreenRouteProp;
}

// Message types
type MessageType = 'text' | 'offer' | 'transport' | 'system' | 'deal_locked' | 'vehicle_card';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  sender: 'user' | 'dealer' | 'system';
  timestamp: Date;
  data?: {
    amount?: number;
    originalPrice?: number;
    status?: 'pending' | 'accepted' | 'rejected';
    transportType?: 'pickup' | 'delivery';
    // Vehicle card data
    vehicleId?: string;
    vehicleYear?: number;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleVariant?: string;
    vehiclePrice?: number;
    vehicleLocation?: string;
    vehicleDealer?: string;
    vehicleImageKey?: string;
  };
}

// Mock data for demonstration
const MOCK_DEALER = {
  name: 'Sydney Auto Group',
  avatar: 'SA',
  rating: 4.8,
  verified: true,
};

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation, route }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get vehicle data from route params or use first vehicle as fallback
  const { vehicleId } = route.params || {};
  const vehicle = useMemo(() => {
    if (vehicleId) {
      return VEHICLES.find(v => v.id === vehicleId) || VEHICLES[0];
    }
    return VEHICLES[0];
  }, [vehicleId]);

  // Use actual vehicle data or mock data
  const MOCK_VEHICLE = {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    variant: vehicle.variant,
    price: vehicle.price, // This is the buying/asking price
  };

  const [messageText, setMessageText] = useState('');
  
  // Initialize messages with vehicle-specific content
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: `Conversation started for ${MOCK_VEHICLE.year} ${MOCK_VEHICLE.make} ${MOCK_VEHICLE.model}`,
      sender: 'system',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '1.5',
      type: 'vehicle_card',
      content: 'Vehicle Details',
      sender: 'system',
      timestamp: new Date(Date.now() - 3550000),
      data: {
        vehicleId: vehicle.id,
        vehicleYear: vehicle.year,
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        vehicleVariant: vehicle.variant,
        vehiclePrice: vehicle.price, // Buying price
        vehicleLocation: vehicle.location,
        vehicleDealer: vehicle.dealer,
        vehicleImageKey: vehicle.imageKey,
      },
    },
    {
      id: '2',
      type: 'text',
      content: `Hi! I'm interested in the ${MOCK_VEHICLE.year} ${MOCK_VEHICLE.make} ${MOCK_VEHICLE.model}. Is it still available?`,
      sender: 'user',
      timestamp: new Date(Date.now() - 3500000),
    },
    {
      id: '3',
      type: 'text',
      content: `Yes, it's still available! Great choice. The buying price is $${MOCK_VEHICLE.price.toLocaleString()}. Would you like to make an offer?`,
      sender: 'dealer',
      timestamp: new Date(Date.now() - 3400000),
    },
  ]);

  // Modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Form states
  const [offerAmount, setOfferAmount] = useState('');

  // Deal state
  const [dealLocked, setDealLocked] = useState(false);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;

    addMessage({
      type: 'text',
      content: messageText.trim(),
      sender: 'user',
    });

    setMessageText('');

    // Simulate dealer response
    setTimeout(() => {
      addMessage({
        type: 'text',
        content: "Thanks for your message! I'll get back to you shortly.",
        sender: 'dealer',
      });
    }, 1500);
  }, [messageText, addMessage]);

  const handleSendOffer = useCallback(() => {
    const amount = parseInt(offerAmount.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0) return;

    addMessage({
      type: 'offer',
      content: `Offer: $${amount.toLocaleString()}`,
      sender: 'user',
      data: {
        amount,
        originalPrice: MOCK_VEHICLE.price,
        status: 'pending',
      },
    });

    setShowOfferModal(false);
    setOfferAmount('');

    // Simulate dealer response
    setTimeout(() => {
      addMessage({
        type: 'text',
        content: `I've received your offer of $${amount.toLocaleString()}. Let me review it and get back to you.`,
        sender: 'dealer',
      });
    }, 1000);
  }, [offerAmount, addMessage]);

  const handleSelectTransport = useCallback((type: 'pickup' | 'delivery') => {
    addMessage({
      type: 'transport',
      content: type === 'pickup' ? 'I will arrange my own pickup' : 'I would like delivery quotes',
      sender: 'user',
      data: {
        transportType: type,
      },
    });

    setShowTransportModal(false);

    // Simulate system response
    setTimeout(() => {
      if (type === 'delivery') {
        addMessage({
          type: 'system',
          content: 'Getting real-time quotes from CEVA/Prixcar...',
          sender: 'system',
        });

        setTimeout(() => {
          addMessage({
            type: 'text',
            content: 'We have delivery quotes available:\n\n• Standard (5-7 days): $450\n• Express (2-3 days): $750\n\nWould you like to proceed with booking?',
            sender: 'dealer',
          });
        }, 2000);
      } else {
        addMessage({
          type: 'text',
          content: "Great! Once the deal is finalized, we'll share the pickup location and arrange a convenient time.",
          sender: 'dealer',
        });
      }
    }, 1000);
  }, [addMessage]);

  const handleLockDeal = useCallback(() => {
    setDealLocked(true);

    addMessage({
      type: 'deal_locked',
      content: 'Deal Locked! Both parties have agreed to the terms.',
      sender: 'system',
      data: {
        amount: MOCK_VEHICLE.price,
        status: 'accepted',
      },
    });

    // Platform fee message
    setTimeout(() => {
      addMessage({
        type: 'system',
        content: 'Platform fee calculated. Both parties will be charged a 2% service fee.',
        sender: 'system',
      });

      // Reveal contact details
      setTimeout(() => {
        addMessage({
          type: 'system',
          content: 'Full contact details have been revealed. You can now communicate directly.',
          sender: 'system',
        });

        // Transport question
        setTimeout(() => {
          addMessage({
            type: 'text',
            content: 'Congratulations on your purchase! How would you like to arrange vehicle collection?',
            sender: 'dealer',
          });
          setShowTransportModal(true);
        }, 1500);
      }, 1500);
    }, 1500);
  }, [addMessage]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';

    if (isSystem) {
      // Vehicle Card Message - Modern Full-Width Image Design
      if (message.type === 'vehicle_card' && message.data) {
        return (
          <View key={message.id} style={styles.vehicleCardContainer}>
            <TouchableOpacity
              style={styles.vehicleCard}
              activeOpacity={0.95}
              onPress={() => navigation.navigate('VehicleDetails', { vehicleId: message.data!.vehicleId! })}
            >
              {/* Full-Width Hero Image */}
              <View style={styles.vehicleCardImageContainer}>
                <Image
                  source={getVehicleImage(message.data.vehicleImageKey as any)}
                  style={styles.vehicleCardImage}
                  resizeMode="cover"
                />
                {/* Gradient Overlay for better text readability */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)']}
                  style={styles.vehicleCardImageOverlay}
                />
              </View>

              {/* Vehicle Details Section */}
              <View style={styles.vehicleCardContent}>
                {/* Title Row */}
                <View style={styles.vehicleCardTitleRow}>
                  <View style={styles.vehicleCardTitleContainer}>
                    <Text variant="h4" weight="bold" numberOfLines={1}>
                      {message.data.vehicleYear} {message.data.vehicleMake}
                    </Text>
                    <Text variant="body" weight="medium" numberOfLines={1} color="textMuted">
                      {message.data.vehicleModel}
                    </Text>
                  </View>

                  {message.data.vehicleVariant && (
                    <View style={styles.vehicleCardBadge}>
                      <Text variant="label" weight="medium" style={styles.vehicleCardBadgeText}>
                        {message.data.vehicleVariant}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Meta Info Row */}
                <View style={styles.vehicleCardMetaContainer}>
                  <View style={styles.vehicleCardMetaRow}>
                    <Ionicons name="location" size={14} color={Colors.primary} />
                    <Text variant="caption" color="textMuted" numberOfLines={1} style={styles.vehicleCardMetaText}>
                      {message.data.vehicleLocation}
                    </Text>
                  </View>

                  <View style={styles.vehicleCardMetaDivider} />

                  <View style={styles.vehicleCardMetaRow}>
                    <Ionicons name="business" size={14} color={Colors.secondary} />
                    <Text variant="caption" color="textMuted" numberOfLines={1} style={styles.vehicleCardMetaText}>
                      {message.data.vehicleDealer}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Price Footer Bar */}
              <View style={styles.vehicleCardPriceBar}>
                <View style={styles.vehicleCardPriceContainer}>
                  <Text variant="caption" weight="medium" style={styles.vehicleCardPriceLabel}>
                    Buying Price
                  </Text>
                  <Text variant="h3" weight="bold" style={styles.vehicleCardPriceText}>
                    ${message.data.vehiclePrice?.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.vehicleCardArrowContainer}>
                  <Ionicons name="chevron-forward" size={20} color={Colors.white} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      }

      // System Message
      return (
        <View key={message.id} style={styles.systemMessageContainer}>
          <View style={styles.systemMessage}>
            {message.type === 'deal_locked' && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={styles.systemIcon} />
            )}
            <Text variant="caption" color="textMuted" align="center">
              {message.content}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.messageContainerUser : styles.messageContainerDealer,
        ]}
      >
        {!isUser && (
          <View style={styles.dealerAvatar}>
            <Text variant="caption" weight="semibold" style={styles.avatarText}>
              {MOCK_DEALER.avatar}
            </Text>
          </View>
        )}

        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleDealer]}>
          {/* Offer Message */}
          {message.type === 'offer' && message.data && (
            <View style={styles.specialMessageContent}>
              <View style={styles.offerHeader}>
                <Ionicons name="pricetag" size={16} color={Colors.accent} />
                <Text variant="caption" weight="semibold" color="accent">
                  Price Offer
                </Text>
              </View>
              <Text variant="h4" weight="bold" color={isUser ? 'white' : 'text'}>
                ${message.data.amount?.toLocaleString()}
              </Text>
              {message.data.originalPrice && (
                <Text variant="caption" color={isUser ? 'white' : 'textMuted'}>
                  Original: ${message.data.originalPrice.toLocaleString()}
                </Text>
              )}
              <View style={[
                styles.statusBadge,
                message.data.status === 'pending' && styles.status_pending,
                message.data.status === 'accepted' && styles.status_accepted,
                message.data.status === 'rejected' && styles.status_rejected,
              ]}>
                <Text variant="label" weight="medium" style={styles.statusText}>
                  {message.data.status?.toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          {/* Transport Message */}
          {message.type === 'transport' && message.data && (
            <View style={styles.specialMessageContent}>
              <View style={styles.transportHeader}>
                <Ionicons
                  name={message.data.transportType === 'pickup' ? 'car' : 'airplane'}
                  size={16}
                  color={Colors.primary}
                />
                <Text variant="caption" weight="semibold" color="primary">
                  {message.data.transportType === 'pickup' ? 'Self Pickup' : 'Delivery Request'}
                </Text>
              </View>
              <Text variant="bodySmall" color={isUser ? 'white' : 'text'}>
                {message.content}
              </Text>
            </View>
          )}

          {/* Regular Text Message */}
          {message.type === 'text' && (
            <Text variant="bodySmall" color={isUser ? 'white' : 'text'}>
              {message.content}
            </Text>
          )}

          <Text
            variant="label"
            color={isUser ? 'white' : 'textMuted'}
            style={styles.messageTime}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text variant="caption" weight="semibold" style={styles.avatarText}>
                {MOCK_DEALER.avatar}
              </Text>
              {MOCK_DEALER.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={8} color={Colors.white} />
                </View>
              )}
            </View>
            <View style={styles.headerText}>
              <Text variant="bodySmall" weight="semibold">{MOCK_DEALER.name}</Text>
              <Text variant="caption" color="textMuted">
                {MOCK_VEHICLE.year} {MOCK_VEHICLE.make} {MOCK_VEHICLE.model}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Deal Status Bar */}
        {dealLocked && (
          <View style={styles.dealStatusBar}>
            <Ionicons name="lock-closed" size={14} color={Colors.success} />
            <Text variant="caption" weight="medium" style={{ color: Colors.success }}>
              Deal Locked - Contact details revealed
            </Text>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Quick Actions */}
        {showActionsMenu && (
          <View style={styles.quickActionsMenu}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => {
                setShowActionsMenu(false);
                setShowOfferModal(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.accent + '15' }]}>
                <Ionicons name="pricetag" size={20} color={Colors.accent} />
              </View>
              <Text variant="caption" weight="medium">Make Offer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => {
                setShowActionsMenu(false);
                setShowTransportModal(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name="car" size={20} color={Colors.primary} />
              </View>
              <Text variant="caption" weight="medium">Transport</Text>
            </TouchableOpacity>

            {!dealLocked && (
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => {
                  setShowActionsMenu(false);
                  handleLockDeal();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: Colors.success + '15' }]}>
                  <Ionicons name="lock-closed" size={20} color={Colors.success} />
                </View>
                <Text variant="caption" weight="medium">Lock Deal</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Input Bar - Enhanced Design */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowActionsMenu(!showActionsMenu)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showActionsMenu ? 'close' : 'add-circle'}
              size={24}
              color={Colors.primary}
            />
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

        {/* Offer Modal */}
        <Modal
          visible={showOfferModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowOfferModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text variant="h4" weight="semibold">Make an Offer</Text>
                <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Spacer size="md" />

              <View style={styles.vehicleInfo}>
                <Text variant="bodySmall" color="textMuted">
                  {MOCK_VEHICLE.year} {MOCK_VEHICLE.make} {MOCK_VEHICLE.model} {MOCK_VEHICLE.variant}
                </Text>
                <Text variant="body" weight="semibold">
                  Asking: ${MOCK_VEHICLE.price.toLocaleString()}
                </Text>
              </View>

              <Spacer size="lg" />

              <Text variant="caption" weight="medium" color="textMuted">Your Offer</Text>
              <Spacer size="xs" />
              <View style={styles.priceInputContainer}>
                <Text variant="h4" weight="bold" color="textMuted">$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  value={offerAmount}
                  onChangeText={setOfferAmount}
                  keyboardType="numeric"
                />
              </View>

              <Spacer size="lg" />

              <TouchableOpacity
                style={[styles.modalButton, !offerAmount && styles.modalButtonDisabled]}
                onPress={handleSendOffer}
                disabled={!offerAmount}
                activeOpacity={0.8}
              >
                <Ionicons name="pricetag" size={18} color={Colors.white} />
                <Text variant="bodySmall" weight="semibold" style={styles.modalButtonText}>
                  Send Offer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Transport Modal */}
        <Modal
          visible={showTransportModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTransportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text variant="h4" weight="semibold">Transport Options</Text>
                <TouchableOpacity onPress={() => setShowTransportModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Spacer size="md" />

              <Text variant="bodySmall" color="textMuted" align="center">
                How would you like to collect your vehicle?
              </Text>

              <Spacer size="lg" />

              <TouchableOpacity
                style={styles.transportOption}
                onPress={() => handleSelectTransport('pickup')}
                activeOpacity={0.7}
              >
                <View style={[styles.transportIcon, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name="car" size={24} color={Colors.primary} />
                </View>
                <View style={styles.transportInfo}>
                  <Text variant="body" weight="semibold">Self Pickup</Text>
                  <Text variant="caption" color="textMuted">
                    Arrange your own collection from the dealer
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>

              <Spacer size="sm" />

              <TouchableOpacity
                style={styles.transportOption}
                onPress={() => handleSelectTransport('delivery')}
                activeOpacity={0.7}
              >
                <View style={[styles.transportIcon, { backgroundColor: Colors.secondary + '15' }]}>
                  <Ionicons name="airplane" size={24} color={Colors.secondary} />
                </View>
                <View style={styles.transportInfo}>
                  <Text variant="body" weight="semibold">Get Delivery Quotes</Text>
                  <Text variant="caption" color="textMuted">
                    Real-time quotes from CEVA/Prixcar
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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

  // Deal Status
  dealStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.success + '10',
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

  // Message Styles
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  messageContainerUser: {
    alignSelf: 'flex-end',
  },
  messageContainerDealer: {
    alignSelf: 'flex-start',
  },
  dealerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    marginTop: 4,
  },
  messageBubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    maxWidth: '100%',
  },
  messageBubbleUser: {
    backgroundColor: Colors.secondary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  messageBubbleDealer: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.sm,
    ...Shadows.sm,
  },
  messageTime: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },

  // System Message
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  systemIcon: {
    marginRight: Spacing.xs,
  },

  // Vehicle Card - Modern Full-Width Image Design
  vehicleCardContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  vehicleCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  vehicleCardImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  vehicleCardImage: {
    width: '100%',
    height: '100%',
  },
  vehicleCardImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  vehicleCardContent: {
    padding: Spacing.md,
  },
  vehicleCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  vehicleCardTitleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  vehicleCardBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  vehicleCardBadgeText: {
    color: Colors.primary,
    fontSize: responsive.getFontSize('xs'),
  },
  vehicleCardMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  vehicleCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleCardMetaDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.sm,
  },
  vehicleCardMetaText: {
    marginLeft: 2,
  },
  vehicleCardPriceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  vehicleCardPriceContainer: {
    flex: 1,
  },
  vehicleCardPriceLabel: {
    color: Colors.textTertiary,
    fontSize: responsive.getFontSize('xs'),
    marginBottom: 2,
  },
  vehicleCardPriceText: {
    color: Colors.primary,
    fontSize: responsive.getFontSize('xl'),
  },
  vehicleCardArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Special Message Content
  specialMessageContent: {
    gap: Spacing.xs,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  status_pending: {
    backgroundColor: Colors.warning,
  },
  status_accepted: {
    backgroundColor: Colors.success,
  },
  status_rejected: {
    backgroundColor: Colors.error,
  },
  statusText: {
    color: Colors.white,
    fontSize: responsive.getFontSize('sm'),
  },

  // Quick Actions
  quickActionsMenu: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.lg,
    justifyContent: 'center',
  },
  quickActionItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input Bar - Brand-compliant design
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
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
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
    fontFamily: 'VesperLibre-Regular',
    fontSize: responsive.getFontSize('base'),
    color: Colors.text,
    maxHeight: 80,
    minHeight: 20,
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

  // Modal Styles
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
  vehicleInfo: {
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
    fontFamily: 'Volkhov-Bold',
    fontSize: responsive.getFontSize('2xl'),
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  descriptionInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontFamily: 'VesperLibre-Regular',
    fontSize: responsive.getFontSize('lg'),
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.secondary,
  },
  modalButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  modalButtonText: {
    color: Colors.white,
  },

  // Transport Options
  transportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  transportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});

export default MessagesScreen;
