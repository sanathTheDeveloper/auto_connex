/**
 * WeeklyPurchaseProgress Component
 *
 * Compact weekly tracker with progress bar and spent amount.
 * Uses brand colors for a polished look.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../design-system/atoms/Text';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { formatFullPrice } from '../data/vehicles';

interface WeeklyPurchaseProgressProps {
  amountSpent: number;
  currentDay: number;
}

export const WeeklyPurchaseProgress: React.FC<WeeklyPurchaseProgressProps> = ({
  amountSpent,
  currentDay,
}) => {
  const progressPercent = (currentDay / 7) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>This Week</Text>
          <Text style={styles.dayCount}>Day {currentDay} of 7</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          <View style={styles.progressDots}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <View
                key={day}
                style={[
                  styles.dot,
                  day <= currentDay && styles.dotActive
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Spent Amount */}
      <View style={styles.amountSection}>
        <Text style={styles.spentLabel}>Spent</Text>
        <Text style={styles.amount}>{formatFullPrice(amountSpent)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  progressSection: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dayCount: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    opacity: 0.6,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  progressDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  amountSection: {
    alignItems: 'flex-end',
    marginLeft: Spacing.md,
    paddingLeft: Spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: Colors.backgroundAlt,
  },
  spentLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});

export default WeeklyPurchaseProgress;
