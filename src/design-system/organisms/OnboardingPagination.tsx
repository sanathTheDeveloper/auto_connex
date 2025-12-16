/**
 * OnboardingPagination Organism Component
 * 
 * Pagination dots indicator for onboarding carousel.
 * Shows current slide position with animated transitions.
 * Active dot expands to pill shape (32px width) to match SignupScreen design.
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
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * OnboardingPagination organism
 * 
 * Renders horizontal row of dots with animated active indicator.
 * Active dot expands to 32px width (pill shape) with smooth animation.
 * Matches SignupScreen progress indicator design for consistency.
 */
export const OnboardingPagination: React.FC<OnboardingPaginationProps> = ({
  totalSlides,
  currentIndex,
  activeColor = Colors.primary,
  inactiveColor = Colors.greyscale300,
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
}

const PaginationDot: React.FC<PaginationDotProps> = ({
  isActive,
  activeColor,
  inactiveColor,
}) => {
  // Animate width from 8px (inactive) to 32px (active)
  const widthAnim = useRef(new Animated.Value(isActive ? 32 : 8)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: isActive ? 32 : 8,
      duration: 300,
      useNativeDriver: false, // Width animation requires false
    }).start();
  }, [isActive, widthAnim]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: widthAnim,
          backgroundColor: isActive ? activeColor : inactiveColor,
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
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
