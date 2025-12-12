/**
 * PillButton Atomic Component
 * 
 * Modern pill-shaped button with icon and smooth animations.
 * Inspired by modern mobile app design patterns.
 * Optimized for both mobile and web with press animations.
 * 
 * @example
 * <PillButton variant="next" onPress={handleNext} />
 * <PillButton variant="prev" onPress={handlePrev} />
 */

import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
  View,
  Easing,
} from 'react-native';
import { Colors, Spacing, responsive } from '../primitives';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

type PillVariant = 'next' | 'prev' | 'skip';

export interface PillButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button variant (next, prev, skip) */
  variant?: PillVariant;
  /** Button text content */
  children?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * PillButton component with modern pill shape and smooth animations
 * 
 * Features:
 * - Pill-shaped design (rounded ends)
 * - Icon + text layout
 * - Press animation (scale + opacity)
 * - Brand colors (teal for next, coral for prev)
 * - Web and mobile optimized
 */
export const PillButton: React.FC<PillButtonProps> = ({
  variant = 'next',
  children,
  disabled = false,
  style,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const arrowMoveAnim = useRef(new Animated.Value(0)).current;
  const arrowOpacityAnim = useRef(new Animated.Value(1)).current;
  const variantStyle = variantStyles[variant];
  const textColor = getTextColor(variant);
  const icon = getIcon(variant);
  const iconPosition = getIconPosition(variant);

  // Continuous arrow animation for next/prev buttons
  useEffect(() => {
    if (variant === 'next' || variant === 'prev') {
      const moveAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(arrowMoveAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(arrowOpacityAnim, {
              toValue: 0.4,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(arrowMoveAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(arrowOpacityAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      moveAnimation.start();
      return () => moveAnimation.stop();
    }
  }, [variant, arrowMoveAnim, arrowOpacityAnim]);

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
    onPressOut?.(e);
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  // Arrow animation styles
  const arrowAnimatedStyle = {
    transform: [
      {
        translateX: arrowMoveAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, variant === 'next' ? 5 : -5],
        }),
      },
    ],
    opacity: arrowOpacityAnim,
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      {...rest}
    >
      <Animated.View
        style={[
          styles.base,
          variantStyle,
          disabled && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        {iconPosition === 'left' && icon && (
          <Animated.View style={[styles.doubleIcon, arrowAnimatedStyle]}>
            <Ionicons
              name={icon}
              size={20}
              color={textColor}
              style={[styles.iconLeft, styles.iconDouble1]}
            />
            <Ionicons
              name={icon}
              size={20}
              color={textColor}
              style={[styles.iconLeft, styles.iconDouble2]}
            />
          </Animated.View>
        )}
        
        <Text
          variant="bodySmall"
          color={textColor as any}
          weight="regular"
          style={styles.text}
        >
          {children || (variant === 'next' ? 'NEXT' : variant === 'prev' ? 'PREV' : 'Skip')}
        </Text>

        {iconPosition === 'right' && icon && (
          <Animated.View style={[styles.multiArrowContainer, arrowAnimatedStyle]}>
            <Ionicons
              name={icon}
              size={18}
              color={textColor}
              style={[styles.iconRight, styles.arrow1]}
            />
            <Ionicons
              name={icon}
              size={18}
              color={textColor}
              style={[styles.iconRight, styles.arrow2]}
            />
            <Ionicons
              name={icon}
              size={18}
              color={textColor}
              style={[styles.iconRight, styles.arrow3]}
            />
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.getSpacing('sm'),
    paddingHorizontal: responsive.getSpacing('2xl'),
    borderRadius: 999, // Pill shape (fully rounded)
    minHeight: 44,
    minWidth: 180,
    // Shadow for depth
    ...(Platform.OS === 'android' ? {
      elevation: 2,
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    }),
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'capitalize',
    paddingRight: Spacing.sm,
  },
  doubleIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  multiArrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginLeft: Spacing.md,
  },
  iconLeft: {
    marginRight: Spacing.md,
  },
  iconRight: {
    marginLeft: 2,
  },
  iconDouble1: {
    marginRight: -8, // Overlap for double chevron effect
  },
  iconDouble2: {
    opacity: 0.6, // Slight transparency for depth
  },
  // Multi-arrow styles with staggered opacity
  arrow1: {
    marginLeft: -6,
    opacity: 0.5,
  },
  arrow2: {
    marginLeft: -6,
    opacity: 0.75,
  },
  arrow3: {
    marginLeft: -6,
    opacity: 1,
  },
  disabled: {
    opacity: 0.4,
  },
});

/**
 * Variant-specific styles
 */
const variantStyles: Record<PillVariant, ViewStyle> = {
  next: {
    backgroundColor: Colors.primary, // Teal
  },
  prev: {
    backgroundColor: Colors.accent, // Coral/pink
  },
  skip: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
};

/**
 * Get text color based on variant
 */
function getTextColor(variant: PillVariant): string {
  switch (variant) {
    case 'skip':
      return Colors.textTertiary;
    default:
      return Colors.white;
  }
}

/**
 * Get icon name based on variant (double chevron for emphasis)
 */
function getIcon(variant: PillVariant): keyof typeof Ionicons.glyphMap | null {
  switch (variant) {
    case 'next':
      return 'chevron-forward-outline';
    case 'prev':
      return 'chevron-back-outline';
    default:
      return null;
  }
}

/**
 * Get icon position based on variant
 */
function getIconPosition(variant: PillVariant): 'left' | 'right' | null {
  switch (variant) {
    case 'next':
      return 'right';
    case 'prev':
      return 'left';
    default:
      return null;
  }
}

export default PillButton;
