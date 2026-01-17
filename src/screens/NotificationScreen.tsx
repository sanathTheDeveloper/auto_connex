/**
 * NotificationScreen Component
 *
 * iOS-style notification center with clean design.
 * Features swipe-to-dismiss and mark all as read.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Animated,
  PanResponder,
  Dimensions,
  ScaledSize,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

// Design System
import { Text, Spacer } from '../design-system';
import { Colors, Spacing, BorderRadius, Shadows } from '../design-system/primitives';

// Context
import { useNotifications, Notification, NotificationType } from '../contexts/NotificationContext';

// ============================================================================
// TYPES
// ============================================================================

type NotificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

interface NotificationScreenProps {
  navigation: NotificationScreenNavigationProp;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon and color for notification type
 */
const getNotificationIcon = (type: NotificationType): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
  switch (type) {
    case 'new_listing':
      return { icon: 'car-sport', color: Colors.primary };
    case 'offer_received':
      return { icon: 'pricetag', color: Colors.accent };
    case 'offer_status':
      return { icon: 'swap-horizontal', color: Colors.secondary };
    case 'favorite_update':
      return { icon: 'heart', color: Colors.accent };
    case 'payment_reminder':
      return { icon: 'card', color: '#FF9500' };
    case 'deal_confirmed':
      return { icon: 'checkmark-circle', color: Colors.success };
    case 'system_announcement':
      return { icon: 'megaphone', color: '#5856D6' };
    case 'message':
      return { icon: 'chatbubble', color: Colors.primary };
    case 'counter_offer':
      return { icon: 'repeat', color: Colors.secondary };
    case 'weekly_summary':
      return { icon: 'bar-chart', color: Colors.primary };
    default:
      return { icon: 'notifications', color: Colors.textMuted };
  }
};

/**
 * Format timestamp for display - iOS style
 */
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
};

// ============================================================================
// NOTIFICATION CARD COMPONENT
// ============================================================================

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDismiss: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDismiss,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const cardHeight = useRef(new Animated.Value(1)).current;
  const SWIPE_THRESHOLD = -100;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -150));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // Swipe to delete
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -500,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(cardHeight, {
              toValue: 0,
              duration: 250,
              delay: 100,
              useNativeDriver: false,
            }),
          ]).start(() => onDismiss());
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const { icon, color } = getNotificationIcon(notification.type);
  const isUnread = !notification.isRead;

  return (
    <Animated.View style={[styles.cardWrapper, { opacity: cardHeight }]}>
      {/* Delete background */}
      <View style={styles.deleteBackground}>
        <View style={styles.deleteContent}>
          <Ionicons name="trash" size={20} color={Colors.white} />
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      </View>

      {/* Main card */}
      <Animated.View
        style={[styles.cardAnimated, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.card, isUnread && styles.cardUnread]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {/* Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Header row */}
            <View style={styles.headerRow}>
              <Text
                variant="body"
                weight={isUnread ? 'bold' : 'medium'}
                numberOfLines={1}
                style={[styles.title, isUnread && styles.titleUnread]}
              >
                {notification.title}
              </Text>
              <View style={styles.timestampRow}>
                <Text variant="caption" style={styles.timestamp}>
                  {formatTimestamp(notification.timestamp)}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={styles.chevron} />
              </View>
            </View>

            {/* Message */}
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={[styles.message, isUnread && styles.messageUnread]}
            >
              {notification.message}
            </Text>

            {/* Vehicle info tag */}
            {notification.metadata?.vehicleInfo && (
              <View style={styles.metaRow}>
                <View style={styles.vehiclePill}>
                  <Ionicons name="car-outline" size={12} color={Colors.textMuted} />
                  <Text variant="caption" color="textMuted" style={styles.vehicleText}>
                    {notification.metadata.vehicleInfo.year} {notification.metadata.vehicleInfo.make} {notification.metadata.vehicleInfo.model}
                  </Text>
                </View>
                {notification.metadata.vehicleInfo.registration && (
                  <View style={styles.regoPill}>
                    <Ionicons name="card-outline" size={11} color={Colors.primary} />
                    <Text style={styles.regoText}>
                      {notification.metadata.vehicleInfo.registration}
                    </Text>
                  </View>
                )}
                {notification.metadata.priceChange && (
                  <View style={styles.pricePill}>
                    <Ionicons name="arrow-down" size={10} color={Colors.success} />
                    <Text style={styles.priceText}>
                      ${(notification.metadata.priceChange.oldPrice - notification.metadata.priceChange.newPrice).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const {
    notifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refreshNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  // Track viewport width for responsive sizing
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    await markAsRead(notification.id);
    const { screen, params } = notification.deepLink;
    navigation.navigate(screen as any, params);
  }, [markAsRead, navigation]);

  const handleDismiss = useCallback(async (notificationId: string) => {
    await dismissNotification(notificationId);
  }, [dismissNotification]);

  const totalUnread = getUnreadCount();

  return (
    <SafeAreaView style={styles.container}>
      {/* iOS-style Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text variant="h3" weight="bold" style={styles.headerTitle}>
            Notifications
          </Text>
        </View>

        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
          activeOpacity={0.6}
          disabled={totalUnread === 0}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            variant="body"
            weight="medium"
            style={[
              styles.markAllText,
              totalUnread === 0 && styles.markAllTextDisabled
            ]}
          >
            Read All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unread count banner */}
      {totalUnread > 0 && (
        <View style={styles.unreadBanner}>
          <View style={styles.unreadBannerDot} />
          <Text variant="bodySmall" weight="semibold" style={styles.unreadBannerText}>
            {totalUnread} unread notification{totalUnread !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notification List */}
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
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
            </View>
            <Spacer size="lg" />
            <Text variant="h4" weight="semibold" align="center" color="text">
              All Caught Up!
            </Text>
            <Spacer size="xs" />
            <Text variant="body" color="textMuted" align="center" style={styles.emptyText}>
              No new notifications.{'\n'}Pull down to refresh.
            </Text>
          </View>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onDismiss={() => handleDismiss(notification.id)}
              />
            ))}
            <Spacer size="xl" />
          </>
        )}
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
    backgroundColor: '#F2F2F7', // iOS system background
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },

  // Header - iOS style
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F2F2F7',
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 17,
  },
  markAllButton: {
    width: 70,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  markAllText: {
    color: Colors.primary,
    fontSize: 15,
  },
  markAllTextDisabled: {
    color: Colors.textMuted,
  },

  // Unread banner
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary + '12',
    gap: 6,
  },
  unreadBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  unreadBannerText: {
    color: Colors.primary,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // Card wrapper
  cardWrapper: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardAnimated: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },

  // Delete background
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FF3B30', // iOS red
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteContent: {
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 80,
  },
  cardUnread: {
    backgroundColor: Colors.primary + '08', // Subtle teal tint for unread
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },

  // Icon
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    lineHeight: 20,
    marginRight: Spacing.xs,
  },
  titleUnread: {
    color: Colors.text,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  chevron: {
    marginLeft: 2,
  },
  message: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 2,
  },
  messageUnread: {
    color: '#3C3C43', // iOS secondary label
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  vehicleText: {
    fontSize: 11,
  },
  regoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '12',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  regoText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 3,
  },
  priceText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'] * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    lineHeight: 22,
  },
});

export default NotificationScreen;
