/**
 * SearchBar Component
 *
 * Reusable search input with filter button.
 * Shows active filter count badge when filters are applied.
 *
 * @example
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Search vehicles, dealers..."
 *   activeFilterCount={3}
 *   onFilterPress={() => setIsFilterOpen(true)}
 * />
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../design-system/atoms/Text';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../design-system/primitives';
import { responsive } from '../design-system/primitives';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback when search text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Number of active filters (shows badge if > 0) */
  activeFilterCount?: number;
  /** Callback when filter button is pressed */
  onFilterPress?: () => void;
  /** Whether to show the filter button */
  showFilterButton?: boolean;
  /** Callback when sort button is pressed */
  onSortPress?: () => void;
  /** Whether to show the sort button */
  showSortButton?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  activeFilterCount = 0,
  onFilterPress,
  showFilterButton = true,
  onSortPress,
  showSortButton = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonWidth = useRef(new Animated.Value(44)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonWidth, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonWidth, {
        toValue: 44,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {showSortButton && (
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              opacity: buttonOpacity,
              width: buttonWidth,
              marginLeft: buttonWidth.interpolate({
                inputRange: [0, 44],
                outputRange: [0, Spacing.xs],
              }),
            },
          ]}
          pointerEvents={isFocused ? 'none' : 'auto'}
        >
          <TouchableOpacity
            style={styles.sortButton}
            onPress={onSortPress}
            activeOpacity={0.8}
          >
            <Ionicons name="funnel" size={15} color={Colors.black} />
          </TouchableOpacity>
        </Animated.View>
      )}
      {showFilterButton && (
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              opacity: buttonOpacity,
              width: buttonWidth,
              marginLeft: buttonWidth.interpolate({
                inputRange: [0, 44],
                outputRange: [0, Spacing.xs],
              }),
            },
          ]}
          pointerEvents={isFocused ? 'none' : 'auto'}
        >
          <TouchableOpacity
            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
            onPress={onFilterPress}
          >
            <Ionicons name="options-outline" size={18} color={Colors.black} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text variant="label" style={styles.filterBadgeText}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: responsive.getFontSize('base'),
    color: Colors.text,
    paddingVertical: 2,
    fontFamily: Typography.fontFamily.vesperLibre,
  },
  buttonWrapper: {
    overflow: 'hidden',
  },
  sortButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.secondary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    minWidth: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: responsive.getFontSize('xs'),
    fontWeight: '700',
  },
});

export default SearchBar;
