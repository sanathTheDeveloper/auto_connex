/**
 * OnboardingPagination Organism Component
 * 
 * Pagination dots indicator for onboarding carousel.
 * Shows current slide position with animated transitions.
 * Uses iOS-style spring physics for smooth animations.
 * 
 * @example
 * <OnboardingPagination
 *   totalSlides={3}
 *   currentIndex={1}
 *   activeColor={Colors.primary}
 *   inactiveColor={Colors.greyscale300}
 * />
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../primitives';

export interface OnboardingPaginationProps {
  /** Total number of slides */
  totalSlides: number;
  /** Current active slide index (0-based) */
  currentIndex: number;
  /** Active dot color */
  activeColor?: string;
  /** Inactive dot color */
  inactiveColor?: string;
  /** Dot size */
  dotSize?: number;
  /** Spacing between dots */
  dotSpacing?: number;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * OnboardingPagination organism
 * 
 * Renders horizontal row of dots with animated active indicator.
 * Active dot scales and changes color with spring animation.
 * Follows iOS design patterns for onboarding pagination.
 */
export const OnboardingPagination: React.FC<OnboardingPaginationProps> = ({
  totalSlides,
  currentIndex,
  activeColor = Colors.primary,
  inactiveColor = Colors.greyscale300,
  dotSize = 8,
  dotSpacing = 8,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSlides }).map((_, index) => {
        const isActive = index === currentIndex;
        
        return (
          <PaginationDot
            key={index}
            isActive={isActive}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            size={dotSize}
            spacing={dotSpacing}
          />
        );
      })}
    </View>
  );
};

/**
 * Individual pagination dot with animation
 */
interface PaginationDotProps {
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
  size: number;
  spacing: number;
}

const PaginationDot: React.FC<PaginationDotProps> = ({
  isActive,
  activeColor,
  inactiveColor,
  size,
  spacing,
}) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.2 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.4)).current;

  useEffect(() => {
    // iOS-style spring animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.2 : 1,
        tension: 100, // Higher tension = snappier
        friction: 7,  // Lower friction = more bounce
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.4,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isActive ? activeColor : inactiveColor,
          marginHorizontal: spacing / 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  dot: {
    // Styles applied dynamically in component
  },
});
