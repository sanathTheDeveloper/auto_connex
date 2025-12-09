/**
 * Spacer Atomic Component
 * 
 * Consistent spacing using design system tokens.
 * Eliminates hardcoded margins/paddings.
 * 
 * @example
 * <Spacer size="md" />
 * <Spacer size="lg" horizontal />
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Spacing } from '../primitives';

type SpacingSize = keyof typeof Spacing | number;

export interface SpacerProps {
  /** Size from Spacing tokens or custom number */
  size?: SpacingSize;
  /** Horizontal spacing (default: vertical) */
  horizontal?: boolean;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * Spacer component for consistent spacing
 * 
 * Sizes:
 * - xs: 4px
 * - sm: 8px
 * - md: 16px (default)
 * - lg: 24px
 * - xl: 32px
 * - 2xl: 48px
 * - 3xl: 64px
 */
export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  horizontal = false,
  style,
}) => {
  const spacingValue = typeof size === 'number' ? size : Spacing[size];

  const spacerStyle: ViewStyle = horizontal
    ? { width: spacingValue }
    : { height: spacingValue };

  return <View style={[spacerStyle, style]} />;
};

export default Spacer;
