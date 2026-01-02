/**
 * Button Atomic Component
 *
 * Touchable button with Auto Connex brand variants.
 * Supports icons, loading states, and multiple sizes.
 *
 * Now uses dynamic dimension detection for proper responsive behavior
 * across mobile devices and desktop browser inspect mode.
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

import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
  Platform,
  Dimensions,
  ScaledSize,
} from 'react-native';
import { Colors, Spacing, SpacingMobile, BorderRadius } from '../primitives';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

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
 *
 * Now includes dimension change listener for proper responsive updates
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
  // Track viewport width for responsive sizing
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const isMobile = viewportWidth <= 480;
  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant];
  const sizeStyle = getSizeStyle(size, isMobile);
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
                size={getIconSize(size, isMobile)}
                color={textColor}
                style={styles.iconLeft}
              />
            )}
            <Text
              variant={getTextVariant(size, isMobile)}
              color={textColorKey as any}
              weight="medium"
              style={styles.text}
            >
              {children}
            </Text>
            {iconRight && (
              <Ionicons
                name={iconRight}
                size={getIconSize(size, isMobile)}
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
 * Get size-specific styles dynamically based on viewport
 * (Mobile-optimized for comfortable tap targets - min 44px)
 */
function getSizeStyle(size: ButtonSize, isMobile: boolean): ViewStyle {
  const styles: Record<ButtonSize, ViewStyle> = {
    sm: {
      paddingHorizontal: isMobile ? SpacingMobile.md : Spacing.lg,
      paddingVertical: isMobile ? 6 : Spacing.sm,
      minHeight: isMobile ? 36 : 40,
    },
    md: {
      paddingHorizontal: isMobile ? SpacingMobile.lg : Spacing.xl,
      paddingVertical: isMobile ? 10 : Spacing.md,
      minHeight: isMobile ? 48 : 52,
    },
    lg: {
      paddingHorizontal: isMobile ? SpacingMobile.xl : Spacing['2xl'],
      paddingVertical: isMobile ? 12 : Spacing.lg,
      minHeight: isMobile ? 52 : 56,
    },
  };
  return styles[size];
}

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
      return 'text';
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
      return Colors.text;
  }
}

/**
 * Get icon size based on button size (smaller on mobile viewports)
 */
function getIconSize(size: ButtonSize, isMobile: boolean): number {
  switch (size) {
    case 'sm':
      return isMobile ? 14 : 16;
    case 'md':
      return isMobile ? 18 : 20;
    case 'lg':
      return isMobile ? 20 : 24;
    default:
      return isMobile ? 18 : 20;
  }
}

/**
 * Get text variant based on button size
 */
function getTextVariant(size: ButtonSize, isMobile: boolean): 'caption' | 'label' | 'bodySmall' | 'body' {
  switch (size) {
    case 'sm':
      return 'label';
    case 'md':
      return 'bodySmall';
    case 'lg':
      return isMobile ? 'bodySmall' : 'body';
    default:
      return 'bodySmall';
  }
}

export default Button;
