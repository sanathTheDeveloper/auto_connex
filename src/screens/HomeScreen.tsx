/**
 * HomeScreen Component
 * 
 * Main dashboard with toggle between Available Listings (buyer view) and My Listings (seller view).
 * Shows vehicle cards in grid layout with search functionality.
 * Integrates with AuthContext to personalize experience based on user type.
 * 
 * @example
 * <Stack.Screen name="Home" component={HomeScreen} />
 */

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Text } from '../design-system/atoms/Text';
import { Card } from '../design-system/molecules/Card';
import { Input } from '../design-system/molecules/Input';
import { Spacer } from '../design-system/atoms/Spacer';
import { Badge } from '../design-system/molecules/Badge';
import { Colors, Spacing, Typography, BorderRadius } from '../design-system/primitives';
import { useAuth } from '../contexts/AuthContext';

/**
 * Mock vehicle data
 */
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair';
  imageUrl?: string;
  dealer?: string;
}

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    price: 32500,
    location: 'Sydney, NSW',
    mileage: 15000,
    condition: 'excellent',
    dealer: 'Sydney Premium Motors',
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Accord',
    year: 2022,
    price: 28900,
    location: 'Melbourne, VIC',
    mileage: 22000,
    condition: 'excellent',
    dealer: 'Melbourne Auto Traders',
  },
  {
    id: '3',
    make: 'Mazda',
    model: 'CX-5',
    year: 2023,
    price: 38000,
    location: 'Brisbane, QLD',
    mileage: 8500,
    condition: 'excellent',
    dealer: 'Brisbane Vehicle Solutions',
  },
  {
    id: '4',
    make: 'Ford',
    model: 'Ranger',
    year: 2021,
    price: 42000,
    location: 'Sydney, NSW',
    mileage: 35000,
    condition: 'good',
    dealer: 'Sydney Premium Motors',
  },
  {
    id: '5',
    make: 'Hyundai',
    model: 'Tucson',
    year: 2022,
    price: 31500,
    location: 'Melbourne, VIC',
    mileage: 18000,
    condition: 'excellent',
    dealer: 'Melbourne Auto Traders',
  },
  {
    id: '6',
    make: 'Volkswagen',
    model: 'Tiguan',
    year: 2023,
    price: 45000,
    location: 'Brisbane, QLD',
    mileage: 5000,
    condition: 'excellent',
    dealer: 'Brisbane Vehicle Solutions',
  },
];

/**
 * HomeScreen
 * 
 * Main dashboard with toggle between Available and My Listings.
 * Shows vehicle grid with search, filters by view mode.
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'available' | 'my'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [toggleAnim] = useState(new Animated.Value(0));

  /**
   * Toggle between Available and My Listings
   */
  const handleToggle = (mode: 'available' | 'my') => {
    setViewMode(mode);
    
    // Animate toggle indicator
    Animated.spring(toggleAnim, {
      toValue: mode === 'available' ? 0 : 1,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Filter vehicles based on view mode and search
   */
  const filteredVehicles = MOCK_VEHICLES.filter(vehicle => {
    const matchesSearch = searchQuery.trim() === '' || 
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  /**
   * Format price as AUD currency
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  /**
   * Render vehicle card
   */
  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <View style={styles.cardWrapper}>
      <Card variant="elevated" padding="md">
        {/* Placeholder image */}
        <View style={styles.vehicleImage}>
          <Text variant="h3" color="textTertiary">
            🚗
          </Text>
        </View>
        
        <Spacer size="sm" />
        
        {/* Vehicle title */}
        <Text variant="h4" weight="bold" numberOfLines={1}>
          {item.year} {item.make} {item.model}
        </Text>
        
        <Spacer size="xs" />
        
        {/* Price */}
        <Text variant="h3" weight="bold" color="primary">
          {formatPrice(item.price)}
        </Text>
        
        <Spacer size="xs" />
        
        {/* Details */}
        <Text variant="bodySmall" color="textSecondary">
          📍 {item.location}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          🛣️ {item.mileage.toLocaleString()} km
        </Text>
        
        <Spacer size="sm" />
        
        {/* Condition badge */}
        <Badge 
          variant={item.condition === 'excellent' ? 'success' : 'warning'} 
          size="sm"
          label={item.condition.toUpperCase()}
        />
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2" weight="bold">
          {viewMode === 'available' ? 'Available Listings' : 'My Listings'}
        </Text>
        
        {user && (
          <>
            <Spacer size="xs" />
            <Text variant="bodySmall" color="textSecondary">
              {user.businessName || user.fullName}
            </Text>
          </>
        )}
      </View>
      
      <Spacer size="md" />
      
      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggle}>
          {/* Animated background indicator */}
          <Animated.View
            style={[
              styles.toggleIndicator,
              {
                transform: [{
                  translateX: toggleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 165], // Half width
                  }),
                }],
              },
            ]}
          />
          
          {/* Toggle buttons */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => handleToggle('available')}
            activeOpacity={0.7}
          >
            <Text
              variant="body"
              weight={viewMode === 'available' ? 'bold' : 'regular'}
              color={viewMode === 'available' ? 'background' : 'textSecondary'}
            >
              Available
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => handleToggle('my')}
            activeOpacity={0.7}
          >
            <Text
              variant="body"
              weight={viewMode === 'my' ? 'bold' : 'regular'}
              color={viewMode === 'my' ? 'background' : 'textSecondary'}
            >
              My Listings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Spacer size="lg" />
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by make, model, or location..."
          value={searchQuery}
          onChange={setSearchQuery}
          leftIcon="search"
        />
      </View>
      
      <Spacer size="md" />
      
      {/* Vehicle grid */}
      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicleCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="h4" color="textTertiary" align="center">
              No vehicles found
            </Text>
            <Spacer size="sm" />
            <Text variant="body" color="textTertiary" align="center">
              Try adjusting your search or view mode
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.md,
  },
  toggleContainer: {
    alignItems: 'center',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: 4,
    position: 'relative',
  },
  toggleIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: '48%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    zIndex: 1,
  },
  searchContainer: {
    paddingHorizontal: 0,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  cardWrapper: {
    flex: 1,
    padding: Spacing.xs,
    maxWidth: '50%',
  },
  vehicleImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
});
