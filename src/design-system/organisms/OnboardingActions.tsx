/**
 * OnboardingActions Organism Component
 *
 * Action buttons for onboarding carousel navigation.
 * Shows Skip (ghost button, left) and Next (primary button, right).
 * Shows Get Started (full-width primary button) on last slide.
 *
 * @example
 * <OnboardingActions
 *   isLastSlide={false}
 *   onSkip={handleSkip}
 *   onNext={handleNext}
 *   onGetStarted={handleGetStarted}
 * />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Button } from '../atoms/Button';
import { Spacing } from '../primitives';

export interface OnboardingActionsProps {
  /** Whether this is the last slide */
  isLastSlide: boolean;
  /** Skip button handler */
  onSkip?: () => void;
  /** Next button handler */
  onNext?: () => void;
  /** Get Started button handler (only shown on last slide) */
  onGetStarted?: () => void;
  /** Loading state for Get Started button */
  loading?: boolean;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * OnboardingActions organism
 *
 * Renders contextual action buttons based on slide position:
 * - Slides 1-2: Skip (left) + Next (right) in a row
 * - Slide 3: Get Started (centered, full width)
 */
export const OnboardingActions: React.FC<OnboardingActionsProps> = ({
  isLastSlide,
  onSkip,
  onNext,
  onGetStarted,
  loading = false,
  style,
}) => {
  if (isLastSlide) {
    // Last slide: Show centered "Get Started" button
    return (
      <View style={[styles.container, styles.lastSlideContainer, style]}>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={onGetStarted}
          loading={loading}
        >
          Get Started
        </Button>
      </View>
    );
  }

  // Slides 1-2: Show Skip (left) + Next (right) buttons
  return (
    <View style={[styles.container, styles.navigationContainer, style]}>
      {/* Skip Button - Left */}
      <Button
        variant="ghost"
        size="md"
        onPress={onSkip}
        style={styles.skipButton}
      >
        Skip
      </Button>

      {/* Next Button - Right */}
      <Button
        variant="primary"
        size="md"
        onPress={onNext}
        style={styles.nextButton}
      >
        Next
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },

  // Last slide layout (centered full-width CTA)
  lastSlideContainer: {
    alignItems: 'center',
  },

  // Slides 1-2 layout (Skip left, Next right)
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },

  skipButton: {
    flex: 1,
  },

  nextButton: {
    flex: 1,
  },
});
