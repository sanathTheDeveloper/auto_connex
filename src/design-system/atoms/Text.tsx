/**
 * Text Atomic Component
 *
 * Typography component with Auto Connex brand variants.
 * Automatically applies correct fonts (Volkhov/Vesper Libre) and sizes from Figma.
 * Now uses dynamic dimension updates for proper responsive behavior across
 * mobile devices and desktop browser inspect mode.
 *
 * @example
 * <Text variant="display">AutoConnex</Text>
 * <Text variant="h1">Dashboard</Text>
 * <Text variant="body">Vehicle listing details...</Text>
 * <Text variant="caption" color="textSecondary">Last updated 5 min ago</Text>
 */

import React, { useState, useEffect } from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, Dimensions, ScaledSize } from 'react-native';
import { Colors, Typography, responsive } from '../primitives';

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
 *
 * Now includes dimension change listener for proper responsive updates
 * when viewport size changes (e.g., desktop browser inspect mode)
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
  // Track viewport width for responsive font sizes
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Listen for dimension changes (resize on web, orientation on mobile)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Get dynamic variant style based on current viewport width
  const variantStyle = getVariantStyle(variant, viewportWidth);
  const colorValue = color ? Colors[color] || '#000000' : '#000000';
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
    color: '#000000', // Pure black for all text
    includeFontPadding: false, // Android: prevents extra padding
    textAlignVertical: 'center', // Android: centers text vertically
    paddingTop: 2, // iOS: prevents top clipping of ascenders
    paddingBottom: 2, // iOS: prevents bottom clipping of descenders
  },
});

/**
 * Get responsive font size based on viewport width
 * Uses mobile font sizes for viewports <= 480px
 */
const getResponsiveFontSize = (size: keyof typeof Typography.fontSize, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return Typography.fontSizeMobile[size];
  }
  return Typography.fontSize[size];
};

/**
 * Get dynamic variant style based on current viewport width
 * Now accepts viewportWidth parameter for proper responsive updates
 */
const getVariantStyle = (variant: TextVariant, viewportWidth: number): TextStyle => {
  const getFontSize = (size: keyof typeof Typography.fontSize) => getResponsiveFontSize(size, viewportWidth);

  const styles: Record<TextVariant, TextStyle> = {
    // Volkhov variants - for data/dashboards
    display: {
      fontFamily: Typography.fontFamily.volkhov,
      fontSize: getFontSize('6xl'),
      fontWeight: Typography.fontWeight.bold,
      lineHeight: getFontSize('6xl') * 1.3,
      letterSpacing: 0,
    },
    h1: {
      fontFamily: Typography.fontFamily.volkhov,
      fontSize: getFontSize('5xl'),
      fontWeight: Typography.fontWeight.bold,
      lineHeight: getFontSize('5xl') * 1.3,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: Typography.fontFamily.volkhov,
      fontSize: getFontSize('4xl'),
      fontWeight: Typography.fontWeight.bold,
      lineHeight: getFontSize('4xl') * 1.3,
      letterSpacing: 0,
    },

    // Vesper Libre variants - for listings/transactions
    h3: {
      fontFamily: Typography.fontFamily.volkhov,
      fontSize: getFontSize('3xl'),
      fontWeight: Typography.fontWeight.regular,
      lineHeight: getFontSize('3xl') * 1.35,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: Typography.fontFamily.volkhov,
      fontSize: getFontSize('2xl'),
      fontWeight: Typography.fontWeight.regular,
      lineHeight: getFontSize('2xl') * 1.35,
      letterSpacing: 0,
    },
    body: {
      fontFamily: Typography.fontFamily.vesperLibre,
      fontSize: getFontSize('xl'),
      fontWeight: Typography.fontWeight.regular,
      lineHeight: getFontSize('xl') * 1.5,
      letterSpacing: 0,
    },
    bodySmall: {
      fontFamily: Typography.fontFamily.vesperLibre,
      fontSize: getFontSize('lg'),
      fontWeight: Typography.fontWeight.regular,
      lineHeight: getFontSize('lg') * 1.5,
      letterSpacing: 0,
    },
    caption: {
      fontFamily: Typography.fontFamily.vesperLibre,
      fontSize: getFontSize('base'),
      fontWeight: Typography.fontWeight.regular,
      lineHeight: getFontSize('base') * 1.5,
      letterSpacing: 0,
    },
    label: {
      fontFamily: Typography.fontFamily.vesperLibre,
      fontSize: getFontSize('sm'),
      fontWeight: Typography.fontWeight.medium,
      lineHeight: getFontSize('sm') * 1.5,
      letterSpacing: 0.3,
    },
  };

  return styles[variant];
};

export default Text;
