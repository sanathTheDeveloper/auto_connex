/**
 * MyListingsScreen Component
 *
 * Displays seller's published listings with three status tabs:
 * Available, Pending, and Sold.
 * Allows sellers to view, edit, and manage their listings.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

// Design System
import { Text, Spacer } from '../design-system';
import { Colors, Spacing, BorderRadius, Shadows } from '../design-system/primitives';

// Context
import { useMyListings, ListingStatus, PublishedListing } from '../contexts/MyListingsContext';

// Data
import { formatFullPrice, formatMileage, getVehicleBackgroundImage } from '../data/vehicles';

// ============================================================================
// TYPES
// ============================================================================

type MyListingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyListings'>;

interface MyListingsScreenProps {
  navigation: MyListingsScreenNavigationProp;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Tab button component
 */
interface TabButtonProps {
  label: string;
  isActive: boolean;
  count: number;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, count, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      variant="bodySmall"
      weight={isActive ? 'semibold' : 'regular'}
      style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
    >
      {label}
    </Text>
    {count > 0 && (
      <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
        <Text variant="caption" style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
          {count}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

/**
 * Status badge component
 */
interface StatusBadgeProps {
  status: ListingStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return { label: 'Available', color: Colors.success, bg: Colors.success + '20' };
      case 'pending':
        return { label: 'Pending', color: Colors.warning, bg: Colors.warning + '20' };
      case 'sold':
        return { label: 'Sold', color: Colors.accent, bg: Colors.accent + '20' };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <Text variant="caption" style={[styles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

/**
 * Spec item for vehicle details
 */
interface SpecItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}

const SpecItem: React.FC<SpecItemProps> = ({ icon, value }) => (
  <View style={styles.specItem}>
    <Ionicons name={icon} size={14} color={Colors.textMuted} />
    <Text variant="caption" style={styles.specItemText}>{value}</Text>
  </View>
);

/**
 * Listing card component
 */
interface ListingCardProps {
  listing: PublishedListing;
  onPress: () => void;
  onStatusChange: (status: ListingStatus) => void;
  onDelete: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  onStatusChange,
  onDelete,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { vehicleDetails, photos, pricing, pickupLocation, status } = listing;

  const handleStatusPress = () => {
    setShowStatusMenu(!showStatusMenu);
  };

  const handleStatusSelect = (newStatus: ListingStatus) => {
    setShowStatusMenu(false);
    if (newStatus !== status) {
      onStatusChange(newStatus);
    }
  };

  const handleLongPress = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  // Get first photo or use placeholder
  const imageSource = photos.length > 0
    ? { uri: photos[0] }
    : getVehicleBackgroundImage(0);

  return (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.98}
    >
      {/* Vehicle Image */}
      <ImageBackground
        source={imageSource}
        style={styles.listingImageBackground}
        imageStyle={styles.listingImageStyle}
      >
        <View style={styles.imageOverlay} />

        {/* Status Badge - Top left */}
        <View style={styles.statusBadgeContainer}>
          <StatusBadge status={status} />
        </View>
      </ImageBackground>

      {/* Vehicle Details */}
      <View style={styles.listingDetails}>
        {/* Title */}
        <Text variant="body" weight="bold" style={styles.listingTitle}>
          {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model} {vehicleDetails.variant}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text variant="caption" style={styles.locationText}>
            {pickupLocation.suburb}, {pickupLocation.state}
          </Text>
        </View>

        {/* Specs Row */}
        <View style={styles.specsRow}>
          <SpecItem icon="speedometer-outline" value={formatMileage(vehicleDetails.mileage)} />
          <SpecItem
            icon="cog-outline"
            value={vehicleDetails.transmission === 'automatic' ? 'Auto' : 'Manual'}
          />
          <SpecItem
            icon="flash-outline"
            value={vehicleDetails.fuelType.charAt(0).toUpperCase() + vehicleDetails.fuelType.slice(1)}
          />
          <SpecItem icon="color-palette-outline" value={vehicleDetails.color} />
          {vehicleDetails.hasLogbook && (
            <View style={styles.logbookBadge}>
              <Ionicons name="book" size={12} color={Colors.success} />
              <Text variant="caption" style={styles.logbookBadgeText}>Logbook</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          {/* Price */}
          <View style={styles.priceContainer}>
            <Text variant="caption" style={styles.priceLabel}>Asking Price</Text>
            <Text variant="h4" weight="bold" style={styles.priceValue}>
              {formatFullPrice(pricing.askingPrice)}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.cardActions}>
            {/* Status Dropdown */}
            <View style={styles.statusDropdownContainer}>
              <TouchableOpacity
                style={styles.statusDropdownButton}
                onPress={handleStatusPress}
                activeOpacity={0.7}
              >
                <Text variant="caption" style={styles.statusDropdownText}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                <Ionicons
                  name={showStatusMenu ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={Colors.text}
                />
              </TouchableOpacity>

              {/* Status Menu */}
              {showStatusMenu && (
                <View style={styles.statusMenu}>
                  {(['available', 'pending', 'sold'] as ListingStatus[]).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusMenuItem, s === status && styles.statusMenuItemActive]}
                      onPress={() => handleStatusSelect(s)}
                    >
                      <Text
                        variant="caption"
                        style={[
                          styles.statusMenuItemText,
                          s === status && styles.statusMenuItemTextActive
                        ]}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={Colors.white} />
              <Text variant="caption" weight="semibold" style={styles.editButtonText}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Empty state component
 */
interface EmptyStateProps {
  status: ListingStatus;
  onCreateListing: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ status, onCreateListing }) => {
  const getMessage = () => {
    switch (status) {
      case 'available':
        return 'You don\'t have any available listings yet.';
      case 'pending':
        return 'No pending listings at the moment.';
      case 'sold':
        return 'You haven\'t sold any vehicles yet.';
    }
  };

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name={status === 'sold' ? 'checkmark-circle-outline' : 'car-outline'}
          size={48}
          color={Colors.textMuted}
        />
      </View>
      <Spacer size="md" />
      <Text variant="body" weight="semibold" color="textMuted" align="center">
        {getMessage()}
      </Text>
      {status === 'available' && (
        <>
          <Spacer size="lg" />
          <TouchableOpacity
            style={styles.createListingButton}
            onPress={onCreateListing}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text variant="bodySmall" weight="semibold" style={styles.createListingButtonText}>
              Create Listing
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MyListingsScreen({ navigation }: MyListingsScreenProps) {
  const [activeTab, setActiveTab] = useState<ListingStatus>('available');
  const [refreshing, setRefreshing] = useState(false);

  const {
    listings,
    isLoading,
    getListingsByStatus,
    updateListingStatus,
    deleteListing,
    refreshListings,
  } = useMyListings();

  // Refresh listings when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshListings();
    }, [refreshListings])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshListings();
    setRefreshing(false);
  };

  const availableListings = getListingsByStatus('available');
  const pendingListings = getListingsByStatus('pending');
  const soldListings = getListingsByStatus('sold');

  const getCurrentListings = (): PublishedListing[] => {
    switch (activeTab) {
      case 'available':
        return availableListings;
      case 'pending':
        return pendingListings;
      case 'sold':
        return soldListings;
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: ListingStatus) => {
    try {
      await updateListingStatus(listingId, newStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing status. Please try again.');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await deleteListing(listingId);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete listing. Please try again.');
    }
  };

  const handleCreateListing = () => {
    navigation.navigate('RegoLookup');
  };

  const handleBack = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          My Listings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TabButton
          label="Available"
          isActive={activeTab === 'available'}
          count={availableListings.length}
          onPress={() => setActiveTab('available')}
        />
        <TabButton
          label="Pending"
          isActive={activeTab === 'pending'}
          count={pendingListings.length}
          onPress={() => setActiveTab('pending')}
        />
        <TabButton
          label="Sold"
          isActive={activeTab === 'sold'}
          count={soldListings.length}
          onPress={() => setActiveTab('sold')}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {getCurrentListings().length > 0 ? (
          getCurrentListings().map((listing) => (
            <ListingCard
              key={listing.listingId}
              listing={listing}
              onPress={() => navigation.navigate('EditListing', { listingId: listing.listingId })}
              onStatusChange={(status) => handleStatusChange(listing.listingId, status)}
              onDelete={() => handleDeleteListing(listing.listingId)}
            />
          ))
        ) : (
          <EmptyState status={activeTab} onCreateListing={handleCreateListing} />
        )}

        <Spacer size="xl" />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Container
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary + '15',
  },
  tabButtonText: {
    color: Colors.textMuted,
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: Colors.primary,
  },
  tabBadgeText: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  tabBadgeTextActive: {
    color: Colors.white,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },

  // Listing Card
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    ...Shadows.sm,
  },
  listingImageBackground: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-start',
  },
  listingImageStyle: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  statusBadgeContainer: {
    padding: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontWeight: '600',
  },

  // Listing Details
  listingDetails: {
    padding: Spacing.md,
  },
  listingTitle: {
    color: Colors.text,
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

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // Status Dropdown
  statusDropdownContainer: {
    position: 'relative',
  },
  statusDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.sm,
  },
  statusDropdownText: {
    color: Colors.text,
  },
  statusMenu: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: 4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
    overflow: 'hidden',
    zIndex: 10,
  },
  statusMenuItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  statusMenuItemActive: {
    backgroundColor: Colors.primary + '15',
  },
  statusMenuItemText: {
    color: Colors.text,
  },
  statusMenuItemTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Edit Button
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  editButtonText: {
    color: Colors.white,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
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
  createListingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  createListingButtonText: {
    color: Colors.white,
  },
});
