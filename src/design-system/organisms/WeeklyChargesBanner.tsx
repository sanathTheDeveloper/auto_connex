/**
 * WeeklyChargesBanner Component
 *
 * Simple banner showing upcoming weekly charges for pending purchases.
 * Highlights the amount to be charged at end of week.
 *
 * @example
 * <WeeklyChargesBanner
 *   totalAmount={45000}
 *   purchaseCount={3}
 *   daysRemaining={4}
 *   onViewDetails={() => navigate('PurchasesOffers')}
 * />
 */

import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Text } from '../atoms/Text';
import { Spacer } from '../atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../primitives';

export interface WeeklyChargesBannerProps {
  totalAmount: number;
  purchaseCount: number;
  daysRemaining: number;
  onViewDetails?: () => void;
}

export const WeeklyChargesBanner: React.FC<WeeklyChargesBannerProps> = ({
  totalAmount,
  purchaseCount,
  daysRemaining,
}) => {
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // If no pending charges
  if (purchaseCount === 0 || totalAmount === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="h4" style={styles.titleEmpty}>
            No Pending Charges
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" style={styles.descriptionEmpty}>
            You have no pending purchases this week
          </Text>
        </View>
      </View>
    );
  }

  const currentDay = 7 - daysRemaining;
  const progressPercentage = (currentDay / 7) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text variant="label" style={styles.headerLabel}>
          THIS WEEK
        </Text>

        <Spacer size="md" />

        {/* Day and Amount Row */}
        <View style={styles.mainRow}>
          <Text variant="bodySmall" style={styles.dayText}>
            Day {currentDay} of 7
          </Text>
          <Text variant="h2" style={styles.amount}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>

        <Spacer size="md" />

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  content: {
    padding: Spacing.lg,
  },
  headerLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mainRow: {
    alignItems: 'center',
  },
  dayText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  amount: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  titleEmpty: {
    color: Colors.text,
    textAlign: 'center',
  },
  descriptionEmpty: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
