/**
 * Text Atomic Component
 * 
 * Typography component with Auto Connex brand variants.
 * Automatically applies correct fonts (Volkhov/Vesper Libre) and sizes from Figma.
 * 
 * @example
 * <Text variant="display">AutoConnex</Text>
 * <Text variant="h1">Dashboard</Text>
 * <Text variant="body">Vehicle listing details...</Text>
 * <Text variant="caption" color="textSecondary">Last updated 5 min ago</Text>
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography } from '../primitives';

type TextVariant = 
  | 'display'    // 73px Volkhov Bold - Logo, hero text
  | 'h1'         // 48px Volkhov Bold - Page titles
  | 'h2'         // 40px Volkhov Bold - Section headers (data heavy)
  | 'h3'         // 35px Vesper Libre Regular - Subsection headers
  | 'h4'         // 29px Vesper Libre Regular - Small headers
  | 'body'       // 24px Vesper Libre Regular - Default body text (listings)
  | 'bodySmall'  // 20px Vesper Libre Regular - Secondary body text
  | 'caption'    // 16px Vesper Libre Regular - Captions, metadata
  | 'label';     // 14px Vesper Libre Medium - Form labels, buttons

type ColorKey = keyof typeof Colors;

export interface TextComponentProps extends RNTextProps {
  /** Typography variant (controls font, size, weight) */
  variant?: TextVariant;
  /** Color from theme Colors */
  color?: ColorKey;
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Font weight override */
  weight?: keyof typeof Typography.fontWeight;
  /** Number of lines before truncation */
  numberOfLines?: number;
  /** Children text content */
  children?: React.ReactNode;
}

/**
 * Text component with brand-compliant typography
 * 
 * Uses Volkhov for data-heavy/dashboard content (display, h1, h2)
 * Uses Vesper Libre for listings/transactions (h3, h4, body, caption, label)
 */
export const Text: React.FC<TextComponentProps> = ({
  variant = 'body',
  color = 'text',
  align = 'left',
  weight,
  numberOfLines,
  style,
  children,
  ...rest
}) => {
  const variantStyle = variantStyles[variant];
  const colorValue = Colors[color] || Colors.text;
  const fontWeight = weight ? Typography.fontWeight[weight] : undefined;

  return (
    <RNText
      style={[
        styles.base,
        variantStyle,
        { color: colorValue, textAlign: align },
        fontWeight && { fontWeight },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
    includeFontPadding: false, // Android: prevents extra padding
    textAlignVertical: 'center', // Android: centers text vertically
    paddingTop: 2, // iOS: prevents top clipping of ascenders
    paddingBottom: 2, // iOS: prevents bottom clipping of descenders
  },
});

/**
 * Variant styles mapping
 * Defines font family, size, weight, line height for each variant
 */
const variantStyles: Record<TextVariant, TextStyle> = {
  // Volkhov variants - for data/dashboards
  display: {
    fontFamily: Typography.fontFamily.volkhov,
    fontSize: Typography.fontSize['6xl'], // 73px
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.fontSize['6xl'] * 1.4, // Increased more to prevent clipping
    letterSpacing: 0.12 * Typography.fontSize['6xl'], // 12% from Figma
  },
  h1: {
    fontFamily: Typography.fontFamily.volkhov,
    fontSize: Typography.fontSize['5xl'], // 48px
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.fontSize['5xl'] * 1.4, // Increased more to prevent clipping
    letterSpacing: 0.12 * Typography.fontSize['5xl'],
  },
  h2: {
    fontFamily: Typography.fontFamily.volkhov,
    fontSize: Typography.fontSize['4xl'], // 40px
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.fontSize['4xl'] * 1.4, // Increased more to prevent clipping
    letterSpacing: 0.12 * Typography.fontSize['4xl'],
  },
  
  // Vesper Libre variants - for listings/transactions
  h3: {
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: Typography.fontSize['3xl'], // 35px
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize['3xl'] * 1.45, // Increased more to prevent clipping
    letterSpacing: 0.12 * Typography.fontSize['3xl'],
  },
  h4: {
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: Typography.fontSize['2xl'], // 29px
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize['2xl'] * 1.45, // Increased for better spacing
    letterSpacing: 0.12 * Typography.fontSize['2xl'],
  },
  body: {
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: Typography.fontSize.xl, // 24px
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize.xl * Typography.lineHeight.normal,
    letterSpacing: 0.12 * Typography.fontSize.xl,
  },
  bodySmall: {
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: Typography.fontSize.lg, // 20px
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.normal,
  },
  caption: {
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: Typography.fontSize.base, // 16px
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  label: {
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: Typography.fontSize.sm, // 14px
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    letterSpacing: 0.5,
  },
};

export default Text;
