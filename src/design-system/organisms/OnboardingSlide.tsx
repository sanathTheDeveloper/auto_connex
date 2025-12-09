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
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * OnboardingSlide organism
 *
 * Clean, centered design with large illustration as primary focus.
 * Text content is secondary, positioned below the image.
 */
export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  illustration,
  heading,
  body,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Image Area - 50% of screen */}
      <View style={styles.illustrationContainer}>
        {illustration}
      </View>

      {/* Text Area - 50% of screen */}
      <View style={styles.textContainer}>
        {/* Heading */}
        <Text variant="h2" align="center" weight="bold" style={styles.heading}>
          {heading}
        </Text>

        <Spacer size="md" />

        {/* Body */}
        <Text variant="bodySmall" align="center" color="textTertiary" style={styles.body}>
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
    height: '58%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  textContainer: {
    height: '42%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.white,
  },
  heading: {
    maxWidth: 340,
    lineHeight: 42,
    color: Colors.text,
  },
  body: {
    maxWidth: 320,
    lineHeight: 28,
    opacity: 0.8,
    color: Colors.textTertiary,
  },
});
