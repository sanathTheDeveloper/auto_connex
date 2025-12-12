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
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Text } from '../atoms/Text';
import { Spacer } from '../atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../primitives';

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
  /** Show skip button (only for non-last slides) */
  showSkip?: boolean;
  /** Skip button handler */
  onSkip?: () => void;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * OnboardingSlide organism
 *
 * Clean, centered design with large illustration as primary focus.
 * Text content is secondary, positioned below the image.
 * Optional skip button in top-right corner of image.
 */
export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  illustration,
  heading,
  body,
  showSkip = false,
  onSkip,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Image Area - Top portion with Skip button overlay */}
      <View style={styles.illustrationContainer}>
        {illustration}
        
        {/* Skip Button - Top Right Corner */}
        {showSkip && onSkip && (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <Text variant="caption" style={styles.skipText}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Text Area - Bottom portion */}
      <View style={styles.textContainer}>
        {/* Heading - Volkhov font for titles/headings */}
        <Text variant="h3" align="center" weight="bold" style={styles.heading}>
          {heading}
        </Text>

        <Spacer size="sm" />

        {/* Body - Vesper Libre font for body/subtitles with darker grey */}
        <Text variant="bodySmall" align="center" style={styles.body}>
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
    overflow: 'visible', // Allow skip button to be visible
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.greyscale500,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for depth
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skipText: {
    color: Colors.greyscale700,
    fontSize: 14,
    fontWeight: '600',
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
    maxWidth: 320,
    color: Colors.text,
  },
  body: {
    maxWidth: 340,
    color: Colors.greyscale700, // Darker grey for better visibility on white background
  },
});
