/**
 * Divider Atomic Component
 * 
 * Visual separator with brand-consistent styling.
 * 
 * @example
 * <Divider />
 * <Divider orientation="vertical" spacing="lg" />
 * <Divider color="primary" thickness={2} />
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../primitives';

type SpacingSize = keyof typeof Spacing;
type ColorKey = keyof typeof Colors;

export interface DividerProps {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
  /** Spacing around divider (margin) */
  spacing?: SpacingSize;
  /** Color from theme or custom hex */
  color?: ColorKey | string;
  /** Line thickness in pixels */
  thickness?: number;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * Divider component for visual separation
 * 
 * Default: horizontal, 1px thickness, textSecondary color
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 'md',
  color = 'textSecondary',
  thickness = 1,
  style,
}) => {
  const dividerColor = color in Colors ? Colors[color as ColorKey] : color;
  const spacingValue = Spacing[spacing];

  const dividerStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          width: '100%',
          height: thickness,
          backgroundColor: dividerColor,
          marginVertical: spacingValue,
        }
      : {
          height: '100%',
          width: thickness,
          backgroundColor: dividerColor,
          marginHorizontal: spacingValue,
        };

  return <View style={[dividerStyle, style]} />;
};

export default Divider;
