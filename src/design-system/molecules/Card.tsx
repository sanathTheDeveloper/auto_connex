/**
 * Card Molecular Component
 * 
 * Container component with Auto Connex brand styling.
 * 
 * @example
 * <Card variant="elevated">
 *   <Text variant="h3">Vehicle Details</Text>
 *   <Text variant="body">2024 Tesla Model 3</Text>
 * </Card>
 * 
 * <Card variant="outlined" padding="lg" onPress={handlePress}>
 *   <Text>Touchable card content</Text>
 * </Card>
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
  TouchableOpacityProps,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../primitives';

type CardVariant = 
  | 'flat'      // No shadow
  | 'elevated'  // With shadow
  | 'outlined'; // With border

type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Card variant (elevation style) */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Card content */
  children?: React.ReactNode;
  /** Make card touchable */
  onPress?: () => void;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * Card component for content containers
 * 
 * Flat: No shadow, minimal elevation
 * Elevated: Shadow for depth
 * Outlined: Border without shadow
 */
export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  children,
  onPress,
  style,
  ...rest
}) => {
  const variantStyle = variantStyles[variant];
  const paddingStyle = paddingStyles[padding];

  const cardStyle = [
    styles.base,
    variantStyle,
    paddingStyle,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Platform.OS === 'android' ? BorderRadius.lg : BorderRadius.xl,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
});

/**
 * Variant-specific styles (iOS/Web optimized)
 */
const variantStyles: Record<CardVariant, ViewStyle> = {
  flat: {
    backgroundColor: Colors.background,
  },
  elevated: {
    backgroundColor: Colors.background,
    ...(Platform.OS === 'android' ? {
      elevation: 3,
    } : {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    }),
  },
  outlined: {
    backgroundColor: Colors.background,
    borderWidth: Platform.OS === 'android' ? 1 : 1.5,
    borderColor: Colors.border,
  },
};

/**
 * Padding styles
 */
const paddingStyles: Record<CardPadding, ViewStyle> = {
  sm: {
    padding: Spacing.md,
  },
  md: {
    padding: Spacing.lg,
  },
  lg: {
    padding: Spacing.xl,
  },
};

export default Card;
