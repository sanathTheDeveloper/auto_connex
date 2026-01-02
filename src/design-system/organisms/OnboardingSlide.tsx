/**
 * OnboardingSlide Organism Component
 *
 * Full-screen slide layout for onboarding carousel.
 * Modern clean design with:
 * - Large centered illustration (primary focus)
 * - Heading + body text below image
 * - Maximum whitespace and breathing room
 *
 * Uses flex-based layout instead of percentage heights to avoid overflow
 * and properly adapt to different viewport sizes including safe areas.
 *
 * @example
 * <OnboardingSlide
 *   illustration={<Image source={...} />}
 *   heading="Browse Nationwide Inventory"
 *   body="Access thousands of verified vehicles from dealers and wholesalers across Australia."
 * />
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions, ScaledSize } from 'react-native';
import { Text } from '../atoms/Text';
import { Spacer } from '../atoms/Spacer';
import { Colors, Spacing, SpacingMobile } from '../primitives';

export interface OnboardingSlideProps {
  /** Category label - DEPRECATED */
  label?: string;
  /** Custom illustration component (image) */
  illustration?: React.ReactNode;
  /** Gradient colors - DEPRECATED */
  gradientColors?: [string, string];
  /** Slide heading */
  heading: string;
  /** Slide body text */
  body: string;
  /** Show skip button (only for non-last slides) - DEPRECATED, now handled by OnboardingActions */
  showSkip?: boolean;
  /** Skip button handler - DEPRECATED, now handled by OnboardingActions */
  onSkip?: () => void;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

/**
 * OnboardingSlide organism
 *
 * Clean, centered design with large illustration as primary focus.
 * Text content is secondary, positioned below the image.
 * Navigation buttons handled separately by OnboardingActions component.
 *
 * Uses flex-based layout (flex: 6 for image, flex: 3 for text) instead of
 * percentage heights to avoid overflow issues and adapt to safe areas.
 */
export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  illustration,
  heading,
  body,
  style,
}) => {
  // Track viewport for responsive spacing
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Calculate responsive spacing
  const paddingHorizontal = getResponsiveSpacing('xl', viewportWidth);
  const paddingTop = getResponsiveSpacing('xl', viewportWidth);
  const paddingBottom = getResponsiveSpacing('lg', viewportWidth);

  return (
    <View style={[styles.container, style]}>
      {/* Image Area - Uses flex instead of fixed percentage */}
      <View style={styles.illustrationContainer}>
        {illustration}
      </View>

      {/* Text Area - Uses flex instead of fixed percentage */}
      <View style={[styles.textContainer, { paddingHorizontal, paddingTop, paddingBottom }]}>
        {/* Heading - Volkhov font for titles/headings */}
        <Text variant="h2" align="center" weight="bold" style={styles.heading}>
          {heading}
        </Text>

        <Spacer size="md" />

        {/* Body - Vesper Libre font for body/subtitles with darker grey */}
        <Text variant="body" align="center" style={styles.body}>
          {body}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  illustrationContainer: {
    flex: 1, // Take remaining space after text content
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  textContainer: {
    // No flex - sizes to content naturally
    alignItems: 'center',
    backgroundColor: Colors.white,
    // paddingHorizontal, paddingTop, paddingBottom applied dynamically
  },
  heading: {
    maxWidth: 380,
    color: Colors.text,
  },
  body: {
    maxWidth: 380,
    color: Colors.greyscale700,
    opacity: 0.9,
  },
});
