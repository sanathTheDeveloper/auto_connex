/**
 * Badge Molecular Component
 * 
 * Status indicator with Auto Connex brand colors.
 * 
 * @example
 * <Badge variant="success" label="Available" />
 * <Badge variant="warning" label="Pending" size="sm" />
 * <Badge variant="error" label="Sold" />
 * <Badge variant="info" label="24" dot />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../primitives';
import { Text } from '../atoms/Text';

type BadgeVariant = 
  | 'success'  // #08605D dark teal
  | 'warning'  // #FF9500 orange
  | 'error'    // #FF3864 pink
  | 'info';    // #1AC8FC cyan

type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Badge variant (color scheme) */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Badge label text */
  label?: string;
  /** Show as notification dot (no label) */
  dot?: boolean;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * Badge component for status indicators
 * 
 * Success: Dark teal for positive states
 * Warning: Orange for caution states
 * Error: Pink for negative states
 * Info: Cyan for informational states
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  size = 'md',
  label,
  dot = false,
  style,
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = dot ? dotStyles[size] : badgeSizeStyles[size];
  const textVariant = size === 'sm' ? 'caption' : size === 'lg' ? 'body' : 'label';

  if (dot) {
    return <View style={[styles.dot, variantStyle, sizeStyle, style]} />;
  }

  return (
    <View style={[styles.badge, variantStyle, sizeStyle, style]}>
      <Text
        variant={textVariant}
        color="white"
        weight={Platform.OS === 'android' ? 'medium' : 'semibold'}
        style={Platform.OS !== 'android' && styles.textIOS}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: BorderRadius.full,
  },
  textIOS: {
    letterSpacing: -0.2,
  },
});

/**
 * Variant-specific styles (background colors)
 */
const variantStyles: Record<BadgeVariant, ViewStyle> = {
  success: {
    backgroundColor: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warning,
  },
  error: {
    backgroundColor: Colors.error,
  },
  info: {
    backgroundColor: Colors.info,
  },
};

/**
 * Size styles for badges with labels
 */
const badgeSizeStyles: Record<BadgeSize, ViewStyle> = {
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minHeight: 20,
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minHeight: 24,
  },
  lg: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 32,
  },
};

/**
 * Size styles for dot badges
 */
const dotStyles: Record<BadgeSize, ViewStyle> = {
  sm: {
    width: 8,
    height: 8,
  },
  md: {
    width: 12,
    height: 12,
  },
  lg: {
    width: 16,
    height: 16,
  },
};

export default Badge;
