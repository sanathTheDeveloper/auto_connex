/**
 * FilterModal Component
 *
 * Bottom sheet modal for filtering vehicle listings.
 * Includes filter options and notification subscription.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius, Shadows } from '../design-system/primitives';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75;

// ============================================================================
// TYPES
// ============================================================================

export interface FilterOptions {
  make: string[];
  state: string[];
  transmission: string[];
  fuelType: string[];
  priceRange: [number, number];
  condition: string[];
  verifiedOnly: boolean;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  notificationsEnabled?: boolean;
  onToggleNotifications?: (enabled: boolean) => void;
}

// ============================================================================
// FILTER OPTIONS DATA
// ============================================================================

const MAKES = ['Toyota', 'Honda', 'Mazda', 'Ford', 'Hyundai', 'Tesla', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen'];
const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
const TRANSMISSIONS = ['automatic', 'manual'];
const FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric'];
const CONDITIONS = ['excellent', 'good', 'fair'];
const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: 'Under $30k', range: [0, 30000] },
  { label: '$30k - $50k', range: [30000, 50000] },
  { label: '$50k - $80k', range: [50000, 80000] },
  { label: '$80k - $150k', range: [80000, 150000] },
  { label: 'Over $150k', range: [150000, 999999] },
];

// ============================================================================
// DEFAULT FILTERS
// ============================================================================

export const DEFAULT_FILTERS: FilterOptions = {
  make: [],
  state: [],
  transmission: [],
  fuelType: [],
  priceRange: [0, 999999],
  condition: [],
  verifiedOnly: false,
};

// ============================================================================
// CHIP COMPONENT
// ============================================================================

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, selected && styles.chipSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      variant="caption"
      weight={selected ? 'medium' : 'regular'}
      style={[styles.chipText, selected && styles.chipTextSelected]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// ============================================================================
// COMPONENT
// ============================================================================

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters = DEFAULT_FILTERS,
  notificationsEnabled = false,
  onToggleNotifications,
}) => {
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [notifications, setNotifications] = useState(notificationsEnabled);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFilters(initialFilters);
      setNotifications(notificationsEnabled);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [isOpen, slideAnim, fadeAnim, initialFilters, notificationsEnabled]);

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...arr, value] };
    });
  };

  const setPriceRange = (range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setNotifications(false);
  };

  const handleApply = () => {
    onApply(filters);
    onToggleNotifications?.(notifications);
    onClose();
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.make.length > 0) count++;
    if (filters.state.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.fuelType.length > 0) count++;
    if (filters.condition.length > 0) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999) count++;
    if (filters.verifiedOnly) count++;
    return count;
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Modal */}
      <Animated.View
        style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset}>
            <Text variant="caption" style={{ color: Colors.primary }}>
              Reset
            </Text>
          </TouchableOpacity>
          <Text variant="caption">
            Filter Vehicles
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Notification Alert */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationLeft}>
              <View style={styles.notificationIcon}>
                <Ionicons name="notifications" size={20} color={Colors.primary} />
              </View>
              <View style={styles.notificationText}>
                <Text variant="bodySmall" weight="medium">
                  Get notified
                </Text>
                <Text variant="caption" color="textTertiary">
                  Alert me when new cars match this search
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.borderLight, true: `${Colors.primary}50` }}
              thumbColor={notifications ? Colors.primary : Colors.textTertiary}
            />
          </View>

          <Spacer size="lg" />

          {/* Make */}
          <Text variant="bodySmall" weight="medium">
            Make
          </Text>
          <Spacer size="sm" />
          <View style={styles.chipContainer}>
            {MAKES.map((make) => (
              <Chip
                key={make}
                label={make}
                selected={filters.make.includes(make)}
                onPress={() => toggleArrayFilter('make', make)}
              />
            ))}
          </View>

          <Spacer size="lg" />

          {/* Location */}
          <Text variant="bodySmall" weight="medium">
            Location
          </Text>
          <Spacer size="sm" />
          <View style={styles.chipContainer}>
            {STATES.map((state) => (
              <Chip
                key={state}
                label={state}
                selected={filters.state.includes(state)}
                onPress={() => toggleArrayFilter('state', state)}
              />
            ))}
          </View>

          <Spacer size="lg" />

          {/* Price Range */}
          <Text variant="bodySmall" weight="medium">
            Price Range
          </Text>
          <Spacer size="sm" />
          <View style={styles.chipContainer}>
            {PRICE_RANGES.map((item) => (
              <Chip
                key={item.label}
                label={item.label}
                selected={
                  filters.priceRange[0] === item.range[0] &&
                  filters.priceRange[1] === item.range[1]
                }
                onPress={() => setPriceRange(item.range)}
              />
            ))}
          </View>

          <Spacer size="lg" />

          {/* Transmission */}
          <Text variant="bodySmall" weight="medium">
            Transmission
          </Text>
          <Spacer size="sm" />
          <View style={styles.chipContainer}>
            {TRANSMISSIONS.map((trans) => (
              <Chip
                key={trans}
                label={trans.charAt(0).toUpperCase() + trans.slice(1)}
                selected={filters.transmission.includes(trans)}
                onPress={() => toggleArrayFilter('transmission', trans)}
              />
            ))}
          </View>

          <Spacer size="lg" />

          {/* Fuel Type */}
          <Text variant="bodySmall" weight="medium">
            Fuel Type
          </Text>
          <Spacer size="sm" />
          <View style={styles.chipContainer}>
            {FUEL_TYPES.map((fuel) => (
              <Chip
                key={fuel}
                label={fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                selected={filters.fuelType.includes(fuel)}
                onPress={() => toggleArrayFilter('fuelType', fuel)}
              />
            ))}
          </View>

          <Spacer size="lg" />

          {/* Condition */}
          <Text variant="bodySmall" weight="medium">
            Condition
          </Text>
          <Spacer size="sm" />
          <View style={styles.chipContainer}>
            {CONDITIONS.map((cond) => (
              <Chip
                key={cond}
                label={cond.charAt(0).toUpperCase() + cond.slice(1)}
                selected={filters.condition.includes(cond)}
                onPress={() => toggleArrayFilter('condition', cond)}
              />
            ))}
          </View>

          <Spacer size="lg" />

          {/* Verified Only */}
          <TouchableOpacity
            style={styles.verifiedRow}
            onPress={() => setFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
            activeOpacity={0.7}
          >
            <View style={styles.verifiedLeft}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
              <Text variant="bodySmall" weight="medium" style={{ marginLeft: Spacing.sm }}>
                Verified dealers only
              </Text>
            </View>
            <View style={[styles.checkbox, filters.verifiedOnly && styles.checkboxChecked]}>
              {filters.verifiedOnly && (
                <Ionicons name="checkmark" size={14} color={Colors.white} />
              )}
            </View>
          </TouchableOpacity>

          <Spacer size="xl" />
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
            <Text variant="caption" weight="medium" style={{ color: Colors.white }}>
              Apply Filters
              {activeFilterCount() > 0 && ` (${activeFilterCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1001,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  modal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: MODAL_HEIGHT,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${Colors.primary}10`,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}20`,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  notificationText: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  verifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
});

export default FilterModal;
