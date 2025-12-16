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
import { Colors, Spacing, BorderRadius } from '../primitives';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

// Helper to detect mobile viewport (including mobile web)
const isMobileViewport = () => {
  const width = Dimensions.get('window').width;
  return width < 768; // True for both native mobile and mobile web
};

type ButtonVariant =
  | 'primary'    // Teal solid (main actions)
  | 'secondary'  // Dark teal solid (secondary actions)
  | 'accent'     // Pink/coral solid (CTAs)
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
 * Primary: Teal solid for main actions
 * Secondary: Dark teal solid for secondary actions
 * Accent: Pink/coral solid for CTAs
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
  const textColorKey = getTextColorKey(variant);

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
      activeOpacity={0.8}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
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
              color={textColorKey as any}
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
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
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
 * Variant-specific styles
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
 */
const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    paddingHorizontal: isMobileViewport() ? Spacing.md : Spacing.lg,
    paddingVertical: isMobileViewport() ? 6 : Spacing.sm,
    minHeight: isMobileViewport() ? 36 : 40,
  },
  md: {
    paddingHorizontal: isMobileViewport() ? Spacing.lg : Spacing.xl,
    paddingVertical: isMobileViewport() ? 10 : Spacing.md,
    minHeight: isMobileViewport() ? 48 : 52,
  },
  lg: {
    paddingHorizontal: isMobileViewport() ? Spacing.xl : Spacing['2xl'],
    paddingVertical: isMobileViewport() ? 12 : Spacing.lg,
    minHeight: isMobileViewport() ? 52 : 56,
  },
};

/**
 * Get text color key based on variant (returns key for Text component)
 */
function getTextColorKey(variant: ButtonVariant): string {
  switch (variant) {
    case 'outline':
      return 'text';
    case 'ghost':
      return 'textTertiary';
    default:
      return 'white';
  }
}

/**
 * Get text color value based on variant (returns hex value for icons)
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
 * Get text variant based on button size
 */
function getTextVariant(size: ButtonSize): 'caption' | 'label' | 'bodySmall' | 'body' {
  const mobile = isMobileViewport();
  switch (size) {
    case 'sm':
      return 'label';
    case 'md':
      return 'bodySmall';
    case 'lg':
      return mobile ? 'bodySmall' : 'body';
    default:
      return 'bodySmall';
  }
}

export default Button;
