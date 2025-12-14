/**
 * ConversationListScreen Component
 *
 * Ultra-clean, modern conversation list with minimalist design.
 * Focus on readability and breathing room.
 */

import React, { useState, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

// Design System
import { Text, Spacer } from '../design-system';
import { Colors, Spacing, BorderRadius, Shadows, Typography, responsive } from '../design-system/primitives';

// Assets
const VERIFIED_BADGE = require('../../assets/icons/verified-badge.png');

type ConversationListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ConversationList'>;

interface ConversationListScreenProps {
  navigation: ConversationListNavigationProp;
}

// Conversation type
interface Conversation {
  id: string;
  dealerName: string;
  dealerAvatar: string;
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
  };
  hasOffer?: boolean;
  hasInvoice?: boolean;
  dealLocked?: boolean;
}

// Mock conversations data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    dealerName: 'Sydney Auto Group',
    dealerAvatar: 'SA',
    dealerType: 'dealer',
    isVerified: true,
    isOnline: true,
    lastMessage: "Thanks for your message! I'll get back to you shortly.",
    lastMessageTime: new Date(Date.now() - 300000),
    unreadCount: 2,
    vehicleInfo: { year: 2022, make: 'Toyota', model: 'Camry' },
    hasOffer: true,
  },
  {
    id: '2',
    dealerName: 'Melbourne Motors',
    dealerAvatar: 'MM',
    dealerType: 'dealer',
    isVerified: true,
    isOnline: false,
    lastMessage: 'The vehicle has been inspected and is ready for viewing.',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 0,
    vehicleInfo: { year: 2021, make: 'Honda', model: 'Accord' },
    dealLocked: true,
  },
  {
    id: '3',
    dealerName: 'Brisbane Wholesale',
    dealerAvatar: 'BW',
    dealerType: 'wholesaler',
    isVerified: true,
    isOnline: true,
    lastMessage: 'I can offer $38,500 for the lot. Let me know.',
    lastMessageTime: new Date(Date.now() - 7200000),
    unreadCount: 5,
    vehicleInfo: { year: 2020, make: 'Mazda', model: 'CX-5' },
    hasInvoice: true,
  },
  {
    id: '4',
    dealerName: 'Perth Premium Cars',
    dealerAvatar: 'PP',
    dealerType: 'dealer',
    isVerified: false,
    isOnline: false,
    lastMessage: 'Is the price negotiable?',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 0,
    vehicleInfo: { year: 2023, make: 'BMW', model: '3 Series' },
  },
  {
    id: '5',
    dealerName: 'Adelaide Auto Hub',
    dealerAvatar: 'AA',
    dealerType: 'dealer',
    isVerified: true,
    isOnline: true,
    lastMessage: 'Transport arranged. Pickup on Monday.',
    lastMessageTime: new Date(Date.now() - 172800000),
    unreadCount: 0,
    vehicleInfo: { year: 2022, make: 'Kia', model: 'Sportage' },
    dealLocked: true,
  },
  {
    id: '6',
    dealerName: 'Gold Coast Dealers',
    dealerAvatar: 'GC',
    dealerType: 'wholesaler',
    isVerified: true,
    isOnline: false,
    lastMessage: 'Can you send more photos of the interior?',
    lastMessageTime: new Date(Date.now() - 259200000),
    unreadCount: 1,
    vehicleInfo: { year: 2021, make: 'Hyundai', model: 'Tucson' },
  },
  {
    id: '7',
    dealerName: 'Darwin Motors',
    dealerAvatar: 'DM',
    dealerType: 'dealer',
    isVerified: false,
    isOnline: false,
    lastMessage: 'Invoice #INV-342891 has been paid. Thank you!',
    lastMessageTime: new Date(Date.now() - 604800000),
    unreadCount: 0,
    vehicleInfo: { year: 2019, make: 'Ford', model: 'Ranger' },
  },
];

export const ConversationListScreen: React.FC<ConversationListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'deals'>('all');

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

  // Get status badge info
  const getStatusBadge = (conversation: Conversation) => {
    if (conversation.dealLocked) {
      return { icon: 'lock-closed' as const, color: Colors.success, label: 'Deal Locked' };
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
      {/* Minimalist Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={26} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text variant="h2" weight="bold" style={styles.headerTitle}>
              Messages
            </Text>
          </View>

          <TouchableOpacity style={styles.composeButton} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Clean Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Simplified Filter Tabs */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.7}
        >
          <Text
            variant="bodySmall"
            weight={activeFilter === 'all' ? 'semibold' : 'regular'}
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
            weight={activeFilter === 'unread' ? 'semibold' : 'regular'}
            style={activeFilter === 'unread' ? styles.filterTabTextActive : styles.filterTabText}
          >
            Unread
          </Text>
          {totalUnread > 0 && activeFilter !== 'unread' && (
            <View style={styles.filterTabBadge}>
              <Text style={styles.filterTabBadgeText}>{totalUnread}</Text>
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
            weight={activeFilter === 'deals' ? 'semibold' : 'regular'}
            style={activeFilter === 'deals' ? styles.filterTabTextActive : styles.filterTabText}
          >
            Deals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      <ScrollView
        style={styles.conversationList}
        contentContainerStyle={styles.conversationListContent}
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

            return (
              <TouchableOpacity
                key={conversation.id}
                style={[
                  styles.conversationCard,
                  isUnread && styles.conversationCardUnread,
                  index === filteredConversations.length - 1 && styles.conversationCardLast,
                ]}
                onPress={() => handleOpenConversation(conversation)}
                activeOpacity={0.7}
              >
                {/* Avatar with online indicator */}
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={conversation.dealerType === 'wholesaler'
                      ? [Colors.secondary, '#006663']
                      : [Colors.primary, Colors.secondary]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                  >
                    <Text variant="h4" weight="bold" style={styles.avatarText}>
                      {conversation.dealerAvatar}
                    </Text>
                  </LinearGradient>

                  {conversation.isOnline && (
                    <View style={styles.onlineDot} />
                  )}
                </View>

                {/* Content */}
                <View style={styles.conversationInfo}>
                  {/* Name & Time Row */}
                  <View style={styles.topRow}>
                    <View style={styles.nameRow}>
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
                    <Text
                      variant="caption"
                      color="textMuted"
                      weight="regular"
                    >
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>

                  {/* Message Row */}
                  <View style={styles.messageRow}>
                    <Text
                      variant="bodySmall"
                      color={isUnread ? 'text' : 'textMuted'}
                      weight="regular"
                      numberOfLines={2}
                      style={styles.lastMessageText}
                    >
                      {conversation.lastMessage}
                    </Text>
                  </View>

                  {/* Bottom Row: Vehicle + Status */}
                  {(conversation.vehicleInfo || statusBadge || isUnread) && (
                    <View style={styles.bottomRow}>
                      {conversation.vehicleInfo && (
                        <View style={styles.vehicleTag}>
                          <Ionicons name="car-sport-outline" size={12} color={Colors.textMuted} />
                          <Text variant="label" color="textMuted">
                            {conversation.vehicleInfo.year} {conversation.vehicleInfo.make}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.rightIcons}>
                        {statusBadge && (
                          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color + '20' }]}>
                            <Ionicons name={statusBadge.icon} size={10} color={statusBadge.color} />
                          </View>
                        )}
                        
                        {isUnread && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>
                              {conversation.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },

  // Minimalist Header
  header: {
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? Spacing.sm : Spacing.lg,
    paddingBottom: responsive.getSpacing('lg'),
    paddingHorizontal: responsive.getSpacing('xl'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
  },
  composeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Clean Search Section
  searchSection: {
    backgroundColor: Colors.white,
    paddingVertical: responsive.getSpacing('md'),
    paddingHorizontal: responsive.getSpacing('xl'),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: responsive.getSpacing('lg'),
    paddingVertical: responsive.getSpacing('md'),
    gap: responsive.getSpacing('sm'),
  },
  searchIcon: {
    marginRight: -4,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: responsive.getFontSize('base'),
    color: Colors.text,
    padding: 0,
  },

  // Simplified Filter Tabs
  filterSection: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: responsive.getSpacing('xl'),
    paddingBottom: responsive.getSpacing('md'),
    gap: responsive.getSpacing('sm'),
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.getSpacing('md'),
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: Colors.primary + '15',
  },
  filterTabText: {
    color: Colors.textMuted,
  },
  filterTabTextActive: {
    color: Colors.primary,
  },
  filterTabBadge: {
    backgroundColor: Colors.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: -2,
  },
  filterTabBadgeText: {
    color: Colors.white,
    fontSize: responsive.getFontSize('sm'),
    fontWeight: '700',
    fontFamily: Typography.fontFamily.vesperLibre,
  },

  // Conversation List
  conversationList: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  conversationListContent: {
    paddingTop: responsive.getSpacing('md'),
    paddingHorizontal: responsive.getSpacing('lg'),
  },

  // Modern Conversation Card
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    padding: responsive.getSpacing('lg'),
    borderRadius: BorderRadius.xl,
    marginBottom: responsive.getSpacing('md'),
    ...Shadows.sm,
  },
  conversationCardUnread: {
    backgroundColor: Colors.primary + '08',  // Very subtle teal tint (8% opacity)
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingLeft: responsive.getSpacing('lg') - 3,  // Compensate for border width
    ...Shadows.md,  // Slightly stronger shadow for emphasis
  },
  conversationCardLast: {
    marginBottom: 0,
  },

  // Avatar
  avatarWrapper: {
    position: 'relative',
    marginRight: responsive.getSpacing('md'),
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
  },
  onlineDot: {
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

  // Conversation Info - Clean Layout
  conversationInfo: {
    flex: 1,
    gap: responsive.getSpacing('sm'),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: responsive.getSpacing('sm'),
    gap: 4,
  },
  dealerName: {
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    marginTop: 2,
  },

  // Message Row
  messageRow: {
    marginTop: -2,
  },
  lastMessageText: {
    lineHeight: responsive.getFontSize('lg') * 1.4,
  },

  // Bottom Row - Simplified
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  vehicleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive.getSpacing('sm'),
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Unread Badge - Accent
  unreadBadge: {
    backgroundColor: Colors.accent,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  unreadText: {
    color: Colors.white,
    fontSize: responsive.getFontSize('sm'),
    fontWeight: '700',
    fontFamily: Typography.fontFamily.vesperLibre,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConversationListScreen;
