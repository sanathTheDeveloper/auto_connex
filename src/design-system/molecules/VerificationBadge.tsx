/**
 * VerificationBadge Component
 * 
 * Shows verification status for business information (ABN, License, etc.).
 * Displays checkmark icon with label for verified items.
 * Used in profile screens, business cards, and verification flows.
 * 
 * @example
 * <VerificationBadge label="ABN Verified" verified={true} />
 * <VerificationBadge label="License Pending" verified={false} />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Colors, Spacing, BorderRadius } from '../primitives';

export interface VerificationBadgeProps {
  /** Badge label text */
  label: string;
  
  /** Whether the item is verified */
  verified: boolean;
  
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show full style (with background) or minimal style (icon + text only) */
  variant?: 'full' | 'minimal';
  
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * VerificationBadge
 * 
 * Shows verification status with icon and label.
 * Green checkmark for verified, grey clock for pending/unverified.
 */
export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  label,
  verified,
  size = 'md',
  variant = 'full',
  style,
}) => {
  /**
   * Get size values
   */
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 14,
          fontSize: 'bodySmall' as const,
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          gap: Spacing.xs,
        };
      case 'lg':
        return {
          iconSize: 20,
          fontSize: 'body' as const,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          gap: Spacing.sm,
        };
      case 'md':
      default:
        return {
          iconSize: 16,
          fontSize: 'bodySmall' as const,
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          gap: Spacing.xs,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        variant === 'full' && {
          backgroundColor: verified ? `${Colors.success}15` : `${Colors.greyscale300}15`,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        variant === 'minimal' && styles.minimal,
        { gap: sizeStyles.gap },
        style,
      ]}
    >
      <Icon
        name={verified ? 'check-circle' : 'schedule'}
        size={sizeStyles.iconSize}
        color={verified ? Colors.success : Colors.greyscale500}
      />
      
      <Text
        variant={sizeStyles.fontSize}
        color={verified ? 'success' : 'textTertiary'}
        weight="medium"
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
  },
  minimal: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

export default VerificationBadge;
