/**
 * SortModal Component
 *
 * Bottom sheet modal for sorting vehicle listings.
 * Reusable component that slides up from bottom with sort options.
 *
 * @example
 * <SortModal
 *   isOpen={isSortOpen}
 *   onClose={() => setIsSortOpen(false)}
 *   onApply={(sortOption) => setSortOption(sortOption)}
 *   currentSort="newest"
 * />
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius, Shadows } from '../design-system/primitives';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.5; // Shorter than filter modal

// ============================================================================
// TYPES
// ============================================================================

export type SortOption = 
  | 'price-asc' 
  | 'price-desc' 
  | 'newest' 
  | 'oldest' 
  | 'mileage-asc'
  | 'mileage-desc'
  | 'alphabetical';

export interface SortOptionConfig {
  value: SortOption;
  label: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (sortOption: SortOption) => void;
  currentSort: SortOption;
  options?: SortOptionConfig[];
}

// ============================================================================
// DEFAULT SORT OPTIONS
// ============================================================================

export const DEFAULT_SORT_OPTIONS: SortOptionConfig[] = [
  {
    value: 'newest',
    label: 'Year: Newest First',
    description: 'Latest model year first',
    icon: 'calendar',
  },
  {
    value: 'oldest',
    label: 'Year: Oldest First',
    description: 'Earliest model year first',
    icon: 'time',
  },
  {
    value: 'price-asc',
    label: 'Price: Low to High',
    description: 'Cheapest vehicles first',
    icon: 'arrow-up',
  },
  {
    value: 'price-desc',
    label: 'Price: High to Low',
    description: 'Most expensive first',
    icon: 'arrow-down',
  },
  {
    value: 'mileage-asc',
    label: 'Mileage: Low to High',
    description: 'Lowest kilometers first',
    icon: 'speedometer',
  },
  {
    value: 'mileage-desc',
    label: 'Mileage: High to Low',
    description: 'Highest kilometers first',
    icon: 'speedometer-outline',
  },
];

// ============================================================================
// SORT OPTION ITEM COMPONENT
// ============================================================================

interface SortOptionItemProps {
  option: SortOptionConfig;
  isSelected: boolean;
  onPress: () => void;
}

const SortOptionItem: React.FC<SortOptionItemProps> = ({ option, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.sortOption, isSelected && styles.sortOptionSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.sortOptionLeft}>
      <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
        <Ionicons
          name={option.icon}
          size={20}
          color={isSelected ? Colors.primary : Colors.textMuted}
        />
      </View>
      <View style={styles.sortOptionText}>
        <Text
          variant="bodySmall"
          weight={isSelected ? 'semibold' : 'regular'}
          style={[styles.sortLabel, isSelected && styles.sortLabelSelected]}
        >
          {option.label}
        </Text>
        {option.description && (
          <Text variant="caption" color="textTertiary" style={styles.sortDescription}>
            {option.description}
          </Text>
        )}
      </View>
    </View>
    {isSelected && (
      <View style={styles.checkmarkContainer}>
        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
      </View>
    )}
  </TouchableOpacity>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentSort,
  options = DEFAULT_SORT_OPTIONS,
}) => {
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(currentSort);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setSelectedSort(currentSort);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
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
  }, [isOpen, slideAnim, fadeAnim, currentSort]);

  const handleSelect = (sortOption: SortOption) => {
    setSelectedSort(sortOption);
    // Apply immediately and close
    onApply(sortOption);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backdropTouch} 
          onPress={onClose} 
          activeOpacity={1} 
        />
      </Animated.View>

      {/* Modal */}
      <Animated.View
        style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle Bar */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="funnel" size={20} color={Colors.primary} />
            <Text variant="caption">
              Sort By
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Sort Options List */}
        <View style={styles.content}>
          {options.map((option, index) => (
            <React.Fragment key={option.value}>
              <SortOptionItem
                option={option}
                isSelected={selectedSort === option.value}
                onPress={() => handleSelect(option.value)}
              />
              {index < options.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <Spacer size="md" />
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
    zIndex: 9999,
    ...(Platform.OS === 'web' && {
      position: 'fixed' as any,
    }),
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
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    ...Shadows.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 72,
  },
  sortOptionSelected: {
    backgroundColor: Colors.primary + '08',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: Colors.primary + '15',
  },
  sortOptionText: {
    flex: 1,
  },
  sortLabel: {
    color: Colors.text,
    marginBottom: 2,
  },
  sortLabelSelected: {
    color: Colors.primary,
  },
  sortDescription: {
    lineHeight: 16,
  },
  checkmarkContainer: {
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border + '50',
    marginHorizontal: Spacing.lg,
  },
});
