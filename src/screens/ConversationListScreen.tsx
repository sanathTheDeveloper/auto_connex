/**
 * ConversationListScreen Component
 *
 * Modern conversation list following Auto Connex brand guidelines.
 * Consistent with HomeScreen and MessagesScreen design patterns.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  RefreshControl,
  Image,
  Dimensions,
  ScaledSize,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

// Design System
import { Text, Spacer } from '../design-system';
import { Colors, Spacing, SpacingMobile, BorderRadius, Shadows, Typography } from '../design-system/primitives';

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

/**
 * Get responsive font size based on viewport width
 */
const getResponsiveFontSize = (size: keyof typeof Typography.fontSize, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return Typography.fontSizeMobile[size];
  }
  return Typography.fontSize[size];
};

// Data
import { DEALER_NAMES } from '../data/vehicles';

// Assets
const VERIFIED_BADGE = require('../../assets/icons/verified-badge.png');

type ConversationListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ConversationList'>;

interface ConversationListScreenProps {
  navigation: ConversationListNavigationProp;
}

// Status types matching MessagesScreen flow
type ConversationStatus =
  | 'offer_pending'      // Buyer sent offer, waiting for response
  | 'offer_accepted'     // Offer accepted, awaiting payment
  | 'offer_declined'     // Offer declined
  | 'counter_pending'    // Counter offer sent, waiting for response
  | 'purchase_pending'   // Purchase request sent, waiting for confirmation
  | 'purchase_confirmed' // Purchase confirmed, awaiting payment
  | 'payment_pending'    // Payment requested, waiting for payment
  | 'payment_complete'   // Payment done, deal complete
  | 'deal_locked';       // Deal finalized

// Conversation type
interface Conversation {
  id: string;
  dealerName: string;
  dealerType: 'dealer' | 'wholesaler';
  isVerified: boolean;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  vehicleInfo?: {
    year: number;
    make: string;
    model: string;
    registration?: string;
  };
  status?: ConversationStatus;
  // Legacy fields (kept for backwards compatibility)
  hasOffer?: boolean;
  hasInvoice?: boolean;
  dealLocked?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate initials from a dealer name
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

/**
 * Generate gradient colors for avatar based on dealer type
 */
const getAvatarGradient = (dealerType: 'dealer' | 'wholesaler'): [string, string] => {
  if (dealerType === 'wholesaler') {
    return [Colors.secondary, '#006663'];
  }
  return [Colors.primary, Colors.secondary];
};

// Mock conversations data - using DEALER_NAMES from vehicles.ts for consistency
// Status values match MessagesScreen flow for consistency
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    dealerName: DEALER_NAMES[0], // AutoKing_99
    dealerType: 'dealer',
    isVerified: true,
    isOnline: true,
    lastMessage: "I've sent you a counter offer of $36,000.",
    lastMessageTime: new Date(Date.now() - 300000),
    unreadCount: 2,
    vehicleInfo: { year: 2022, make: 'Toyota', model: 'Camry', registration: 'ABC-123' },
    status: 'counter_pending',
  },
  {
    id: '2',
    dealerName: DEALER_NAMES[1], // WheelDealer_X
    dealerType: 'dealer',
    isVerified: true,
    isOnline: false,
    lastMessage: 'Payment received! Vehicle is ready for pickup.',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 0,
    vehicleInfo: { year: 2021, make: 'Honda', model: 'Accord', registration: 'XYZ-789' },
    status: 'payment_complete',
  },
  {
    id: '3',
    dealerName: DEALER_NAMES[2], // CarPro_Elite
    dealerType: 'wholesaler',
    isVerified: true,
    isOnline: true,
    lastMessage: 'I can offer $38,500 for the lot. Let me know.',
    lastMessageTime: new Date(Date.now() - 7200000),
    unreadCount: 5,
    vehicleInfo: { year: 2020, make: 'Mazda', model: 'CX-5', registration: 'DEF-456' },
    status: 'offer_pending',
  },
  {
    id: '4',
    dealerName: DEALER_NAMES[3], // MotorMaverick
    dealerType: 'dealer',
    isVerified: false,
    isOnline: false,
    lastMessage: 'Is the price negotiable?',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 0,
    vehicleInfo: { year: 2023, make: 'BMW', model: '3 Series', registration: 'BMW-001' },
    // No status - just a regular conversation
  },
  {
    id: '5',
    dealerName: DEALER_NAMES[4], // DriveMaster_AU
    dealerType: 'dealer',
    isVerified: true,
    isOnline: true,
    lastMessage: 'Purchase confirmed! Please complete the payment.',
    lastMessageTime: new Date(Date.now() - 172800000),
    unreadCount: 0,
    vehicleInfo: { year: 2022, make: 'Kia', model: 'Sportage', registration: 'KIA-234' },
    status: 'payment_pending',
  },
  {
    id: '6',
    dealerName: DEALER_NAMES[5], // SpeedTrader_77
    dealerType: 'wholesaler',
    isVerified: true,
    isOnline: false,
    lastMessage: 'Great! I accept your offer of $42,000.',
    lastMessageTime: new Date(Date.now() - 259200000),
    unreadCount: 1,
    vehicleInfo: { year: 2021, make: 'Hyundai', model: 'Tucson', registration: 'HYU-567' },
    status: 'offer_accepted',
  },
  {
    id: '7',
    dealerName: DEALER_NAMES[6], // VehicleVault
    dealerType: 'dealer',
    isVerified: false,
    isOnline: false,
    lastMessage: 'Deal complete! Thank you for your business.',
    lastMessageTime: new Date(Date.now() - 604800000),
    unreadCount: 0,
    vehicleInfo: { year: 2019, make: 'Ford', model: 'Ranger', registration: 'FRD-890' },
    status: 'deal_locked',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ConversationListScreen: React.FC<ConversationListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'deals'>('all');

  // Track viewport width for responsive sizing
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Calculate responsive values
  const responsivePadding = getResponsiveSpacing('md', viewportWidth);
  const responsiveFontSize = getResponsiveFontSize('base', viewportWidth);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleOpenConversation = useCallback((conversation: Conversation) => {
    navigation.navigate('Messages', {
      vehicleId: conversation.id,
      dealerId: conversation.id,
    });
  }, [navigation]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = MOCK_CONVERSATIONS;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.dealerName.toLowerCase().includes(query) ||
          conv.vehicleInfo?.make.toLowerCase().includes(query) ||
          conv.vehicleInfo?.model.toLowerCase().includes(query)
      );
    }

    if (activeFilter === 'unread') {
      filtered = filtered.filter((conv) => conv.unreadCount > 0);
    } else if (activeFilter === 'deals') {
      filtered = filtered.filter((conv) => conv.dealLocked || conv.hasOffer || conv.hasInvoice);
    }

    return filtered;
  }, [searchQuery, activeFilter]);

  // Format timestamp
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  // Total unread count
  const totalUnread = useMemo(() =>
    MOCK_CONVERSATIONS.reduce((sum, conv) => sum + conv.unreadCount, 0),
  []);

  // Get status badge info based on conversation status (matching MessagesScreen flow)
  const getStatusBadge = (conversation: Conversation) => {
    // Check new status field first
    if (conversation.status) {
      switch (conversation.status) {
        case 'payment_complete':
        case 'deal_locked':
          return { icon: 'checkmark-circle' as const, color: Colors.success, label: 'Complete' };
        case 'payment_pending':
          return { icon: 'card' as const, color: Colors.primary, label: 'Payment' };
        case 'purchase_confirmed':
        case 'offer_accepted':
          return { icon: 'thumbs-up' as const, color: Colors.success, label: 'Accepted' };
        case 'offer_declined':
          return { icon: 'close-circle' as const, color: Colors.error, label: 'Declined' };
        case 'counter_pending':
          return { icon: 'swap-horizontal' as const, color: Colors.secondary, label: 'Counter' };
        case 'offer_pending':
        case 'purchase_pending':
          return { icon: 'time' as const, color: Colors.warning, label: 'Pending' };
      }
    }

    // Fallback to legacy fields for backwards compatibility
    if (conversation.dealLocked) {
      return { icon: 'lock-closed' as const, color: Colors.success, label: 'Locked' };
    }
    if (conversation.hasInvoice) {
      return { icon: 'document-text' as const, color: Colors.secondary, label: 'Invoice' };
    }
    if (conversation.hasOffer) {
      return { icon: 'pricetag' as const, color: Colors.accent, label: 'Offer' };
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          Messages
        </Text>

        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { fontSize: responsiveFontSize }]}
            placeholder="Search conversations..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.7}
        >
          <Text
            variant="bodySmall"
            style={activeFilter === 'all' ? styles.filterTabTextActive : styles.filterTabText}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'unread' && styles.filterTabActive]}
          onPress={() => setActiveFilter('unread')}
          activeOpacity={0.7}
        >
          <Text
            variant="bodySmall"
            style={activeFilter === 'unread' ? styles.filterTabTextActive : styles.filterTabText}
          >
            Unread
          </Text>
          {totalUnread > 0 && activeFilter !== 'unread' && (
            <View style={styles.filterBadge}>
              <Text variant="label" weight="bold" style={styles.filterBadgeText}>
                {totalUnread}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'deals' && styles.filterTabActive]}
          onPress={() => setActiveFilter('deals')}
          activeOpacity={0.7}
        >
          <Text
            variant="bodySmall"
            style={activeFilter === 'deals' ? styles.filterTabTextActive : styles.filterTabText}
          >
            Deals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={40} color={Colors.primary} />
            </View>
            <Spacer size="md" />
            <Text variant="h4" weight="semibold" align="center">
              No conversations
            </Text>
            <Spacer size="xs" />
            <Text variant="bodySmall" color="textMuted" align="center">
              {searchQuery ? 'Try a different search' : 'Start chatting with dealers'}
            </Text>
          </View>
        ) : (
          filteredConversations.map((conversation, index) => {
            const statusBadge = getStatusBadge(conversation);
            const isUnread = conversation.unreadCount > 0;
            const initials = getInitials(conversation.dealerName);
            const gradientColors = getAvatarGradient(conversation.dealerType);

            return (
              <TouchableOpacity
                key={conversation.id}
                style={[
                  styles.conversationCard,
                  isUnread && styles.conversationCardUnread,
                ]}
                onPress={() => handleOpenConversation(conversation)}
                activeOpacity={0.7}
              >
                {/* Avatar with online indicator */}
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                  >
                    <Text variant="body" weight="bold" style={styles.avatarText}>
                      {initials}
                    </Text>
                  </LinearGradient>

                  {conversation.isOnline && (
                    <View style={styles.onlineIndicator} />
                  )}
                </View>

                {/* Content */}
                <View style={styles.conversationContent}>
                  {/* Top Row: Name + Time */}
                  <View style={styles.topRow}>
                    <View style={styles.nameContainer}>
                      <Text
                        variant="body"
                        weight={isUnread ? 'bold' : 'semibold'}
                        numberOfLines={1}
                        style={styles.dealerName}
                      >
                        {conversation.dealerName}
                      </Text>
                      {conversation.isVerified && (
                        <Image
                          source={VERIFIED_BADGE}
                          style={styles.verifiedBadge}
                        />
                      )}
                    </View>
                    <Text variant="caption" color="textMuted">
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>

                  {/* Message Preview */}
                  <Text
                    variant="bodySmall"
                    color={isUnread ? 'text' : 'textMuted'}
                    numberOfLines={2}
                    style={styles.messagePreview}
                  >
                    {conversation.lastMessage}
                  </Text>

                  {/* Bottom Row: Vehicle Info + Status/Unread */}
                  <View style={styles.bottomRow}>
                    {conversation.vehicleInfo && (
                      <View style={styles.vehicleTag}>
                        <Ionicons name="car-sport-outline" size={12} color={Colors.textMuted} />
                        <Text variant="caption" color="textMuted">
                          {conversation.vehicleInfo.year} {conversation.vehicleInfo.make}
                          {conversation.vehicleInfo.registration && ` • ${conversation.vehicleInfo.registration}`}
                        </Text>
                      </View>
                    )}

                    <View style={styles.statusContainer}>
                      {statusBadge && (
                        <View style={[styles.statusBadge, { backgroundColor: statusBadge.color + '20' }]}>
                          <Ionicons name={statusBadge.icon} size={12} color={statusBadge.color} />
                        </View>
                      )}

                      {isUnread && (
                        <View style={styles.unreadBadge}>
                          <Text variant="label" weight="bold" style={styles.unreadText}>
                            {conversation.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <Spacer size="xl" />
      </ScrollView>
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
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.text,
  },

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    // fontSize set dynamically via inline style for responsive updates
    color: Colors.text,
    paddingVertical: 2,
    fontFamily: Typography.fontFamily.vesperLibre,
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    color: Colors.text,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  filterBadge: {
    backgroundColor: Colors.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 11,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  // Conversation Card
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    ...Shadows.sm,
  },
  conversationCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.tealLight + '15', // Light teal background for unread (15% opacity)
    borderColor: Colors.primary + '30', // Subtle teal border
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    width: 52,
    height: 52,
    marginRight: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2.5,
    borderColor: Colors.white,
  },

  // Conversation Content
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
    gap: 4,
  },
  dealerName: {
    color: Colors.text,
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
  },
  messagePreview: {
    lineHeight: 18,
    marginTop: 2,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  vehicleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    backgroundColor: Colors.accent,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 11,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConversationListScreen;
