/**
 * OnboardingSlide Organism Component
 *
 * Full-screen slide layout for onboarding carousel.
 * Modern clean design with:
 * - Large centered illustration (primary focus)
 * - Heading + body text below image
 * - Maximum whitespace and breathing room
 *
 * @example
 * <OnboardingSlide
 *   illustration={<Image source={...} />}
 *   heading="Browse Nationwide Inventory"
 *   body="Access thousands of verified vehicles from dealers and wholesalers across Australia."
 * />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../atoms/Text';
import { Spacer } from '../atoms/Spacer';
import { Colors, Spacing } from '../primitives';

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
 * OnboardingSlide organism
 *
 * Clean, centered design with large illustration as primary focus.
 * Text content is secondary, positioned below the image.
 * Navigation buttons handled separately by OnboardingActions component.
 */
export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  illustration,
  heading,
  body,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Image Area - Top portion */}
      <View style={styles.illustrationContainer}>
        {illustration}
      </View>

      {/* Text Area - Bottom portion */}
      <View style={styles.textContainer}>
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
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    height: '40%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'], // Minimal spacing between image and heading
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  heading: {
    maxWidth: 380,
    color: Colors.text,
    lineHeight: 32,
  },
  body: {
    maxWidth: 380,
    color: Colors.greyscale700, // Darker grey for better visibility on white background
    lineHeight: 24,
    opacity: 0.9,
  },
});
