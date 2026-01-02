/**
 * ProgressBar Component
 *
 * Modern, consistent progress indicator for multi-step flows.
 * Shows current step, progress percentage, and step labels.
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../atoms/Text';
import { Colors, Spacing, BorderRadius } from '../primitives';

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string; // e.g., "Upload Photos", "Set Pricing"
  showPercentage?: boolean;
  variant?: 'default' | 'minimal';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepLabel,
  showPercentage = false,
  variant = 'default',
}) => {
  const progress = (currentStep / totalSteps) * 100;
  const progressWidth = `${Math.min(progress, 100)}%` as const;

  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        <View style={styles.minimalBar}>
          <View style={[styles.minimalFillWrapper, { width: progressWidth as any }]}>
            <LinearGradient
              colors={[Colors.primary, Colors.tealLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.minimalFill}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <View style={[styles.barFillWrapper, { width: progressWidth as any }]}>
            <LinearGradient
              colors={[Colors.primary, Colors.tealLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.barFill}
            />
          </View>
        </View>
      </View>

      {/* Step Info */}
      <View style={styles.infoContainer}>
        <View style={styles.stepBadge}>
          <Text variant="caption" weight="bold" style={styles.stepBadgeText}>
            {currentStep}/{totalSteps}
          </Text>
        </View>

        {stepLabel && (
          <Text variant="caption" color="textMuted" style={styles.stepLabel}>
            {stepLabel}
          </Text>
        )}

        {showPercentage && (
          <Text variant="caption" weight="semibold" style={styles.percentage}>
            {Math.round(progress)}%
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Default Variant
  container: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  barContainer: {
    marginBottom: Spacing.sm,
  },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.greyscale100,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  barFillWrapper: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  stepBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  stepLabel: {
    flex: 1,
    fontSize: 12,
  },
  percentage: {
    color: Colors.primary,
    fontSize: 12,
  },

  // Minimal Variant
  minimalContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  minimalBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.greyscale100,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  minimalFillWrapper: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  minimalFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
