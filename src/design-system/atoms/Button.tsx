/**
 * Button Atomic Component
 * 
 * Touchable button with Auto Connex brand variants.
 * Supports icons, loading states, and multiple sizes.
 * 
 * @example
 * <Button variant="primary" onPress={handleSubmit}>
 *   Submit Deal
 * </Button>
 * 
 * <Button variant="outline" size="sm" iconLeft="car">
 *   View Inventory
 * </Button>
 * 
 * <Button variant="accent" loading disabled>
 *   Processing...
 * </Button>
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../primitives';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 
  | 'primary'    // #0ABAB5 teal (main actions)
  | 'secondary'  // #008985 dark teal (secondary actions)
  | 'accent'     // #FF3864 pink (CTAs, destructive)
  | 'outline'    // Bordered transparent
  | 'ghost';     // Transparent no border

type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button variant (color scheme) */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button text content */
  children?: React.ReactNode;
  /** Icon name from Ionicons (left side) */
  iconLeft?: keyof typeof Ionicons.glyphMap;
  /** Icon name from Ionicons (right side) */
  iconRight?: keyof typeof Ionicons.glyphMap;
  /** Loading state (shows spinner) */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * Button component with brand-compliant styling
 * 
 * Primary: Teal #0ABAB5 for main actions
 * Secondary: Dark teal #008985 for secondary actions
 * Accent: Pink #FF3864 for CTAs and destructive actions
 * Outline: Bordered for low emphasis
 * Ghost: Text-only for minimal emphasis
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  onPress,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const textColor = getTextColor(variant);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {iconLeft && (
            <Ionicons
              name={iconLeft}
              size={getIconSize(size)}
              color={textColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            variant={size === 'sm' ? 'bodySmall' : 'body'}
            color={textColor as any}
            weight="semibold"
            style={styles.text}
          >
            {children}
          </Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={getIconSize(size)}
              color={textColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Platform.OS === 'android' ? BorderRadius.md : BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    letterSpacing: Platform.OS === 'android' ? 0 : -0.3,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

/**
 * Variant-specific styles (iOS/Web optimized)
 */
const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: Colors.primary,
    ...(Platform.OS === 'android' ? {
      elevation: 2,
    } : {
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    }),
  },
  secondary: {
    backgroundColor: Colors.secondary,
    ...(Platform.OS === 'android' ? {
      elevation: 2,
    } : {
      shadowColor: Colors.secondary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    }),
  },
  accent: {
    backgroundColor: Colors.accent,
    ...(Platform.OS === 'android' ? {
      elevation: 2,
    } : {
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    }),
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: Platform.OS === 'android' ? 2 : 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

/**
 * Size-specific styles (iOS/Web optimized heights)
 */
const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: Platform.OS === 'android' ? 36 : 32,
  },
  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'android' ? Spacing.md : 12,
    minHeight: Platform.OS === 'android' ? 48 : 44,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Platform.OS === 'android' ? Spacing.lg : 16,
    minHeight: Platform.OS === 'android' ? 56 : 50,
  },
};

/**
 * Get text color based on variant
 */
function getTextColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'outline':
    case 'ghost':
      return Colors.primary;
    default:
      return Colors.white;
  }
}

/**
 * Get icon size based on button size
 */
function getIconSize(size: ButtonSize): number {
  switch (size) {
    case 'sm':
      return 16;
    case 'md':
      return 20;
    case 'lg':
      return 24;
    default:
      return 20;
  }
}

export default Button;
