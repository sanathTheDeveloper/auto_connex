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
      {/* Image Area - Top portion */}
      <View style={styles.illustrationContainer}>
        {illustration}
      </View>

      {/* Text Area - Bottom portion */}
      <View style={styles.textContainer}>
        {/* Heading */}
        <Text variant="h3" align="center" weight="bold" style={styles.heading}>
          {heading}
        </Text>

        <Spacer size="sm" />

        {/* Body */}
        <Text variant="body" align="center" color="textTertiary" style={styles.body}>
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
    height: '55%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  textContainer: {
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
  },
  heading: {
    maxWidth: 360,
    lineHeight: 38,
    color: Colors.text,
    fontSize: 28,
  },
  body: {
    maxWidth: 340,
    lineHeight: 26,
    opacity: 0.75,
    color: Colors.textTertiary,
    fontSize: 17,
  },
});
