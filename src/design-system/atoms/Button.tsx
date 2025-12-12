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
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, responsive } from '../primitives';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

// Helper to detect mobile viewport (including mobile web)
const isMobileViewport = () => {
  const width = Dimensions.get('window').width;
  return width < 768; // True for both native mobile and mobile web
};

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
            variant={getTextVariant(size)}
            color={textColor as any}
            weight="regular"
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
    letterSpacing: Platform.OS === 'android' ? 0 : 0.3,
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
    opacity: 0.4,
  },
});

/**
 * Variant-specific styles (iOS/Web optimized)
 */
const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: Colors.primary,
    ...(Platform.OS === 'android' ? {
      elevation: 1,
    } : {
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    }),
  },
  secondary: {
    backgroundColor: Colors.secondary,
    ...(Platform.OS === 'android' ? {
      elevation: 1,
    } : {
      shadowColor: Colors.secondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 4,
    }),
  },
  accent: {
    backgroundColor: Colors.accent,
    ...(Platform.OS === 'android' ? {
      elevation: 1,
    } : {
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    }),
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

/**
 * Size-specific styles (Mobile-optimized for comfortable tap targets - min 44px)
 * Heights match Input component for visual consistency (44px on mobile/iOS, 48px on desktop/Android)
 */
const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    paddingHorizontal: isMobileViewport() ? Spacing.md : Spacing.lg,
    paddingVertical: isMobileViewport() ? 6 : Spacing.sm,
    minHeight: isMobileViewport() ? 36 : 40, // Compact for mobile
  },
  md: {
    paddingHorizontal: isMobileViewport() ? Spacing.lg : Spacing.xl,
    paddingVertical: isMobileViewport() ? 8 : Spacing.md,
    minHeight: isMobileViewport() ? 44 : 48, // Matches Input component height
  },
  lg: {
    paddingHorizontal: isMobileViewport() ? Spacing.xl : Spacing['2xl'],
    paddingVertical: isMobileViewport() ? 10 : Spacing.lg,
    minHeight: isMobileViewport() ? 48 : 52, // Comfortable for mobile
  },
};

/**
 * Get text color based on variant
 */
function getTextColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'outline':
      return Colors.text;
    case 'ghost':
      return Colors.textTertiary;
    default:
      return Colors.white;
  }
}

/**
 * Get icon size based on button size (smaller on mobile viewports)
 */
function getIconSize(size: ButtonSize): number {
  const mobile = isMobileViewport();
  switch (size) {
    case 'sm':
      return mobile ? 14 : 16;
    case 'md':
      return mobile ? 18 : 20;
    case 'lg':
      return mobile ? 20 : 24;
    default:
      return mobile ? 18 : 20;
  }
}

/**
 * Get text variant based on button size (smaller text for modern UI)
 */
function getTextVariant(size: ButtonSize): 'caption' | 'label' | 'bodySmall' | 'body' {
  const mobile = isMobileViewport();
  switch (size) {
    case 'sm':
      return 'label';     // 12-14px
    case 'md':
      return 'caption';   // 13-16px - smaller, more consistent
    case 'lg':
      return mobile ? 'caption' : 'bodySmall';  // 13-20px
    default:
      return 'caption';
  }
}

export default Button;
