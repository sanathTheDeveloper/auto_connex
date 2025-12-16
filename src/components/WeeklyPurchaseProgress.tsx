/**
 * WeeklyPurchaseProgress Component
 *
 * Shows 7-day purchase progress bar with budget tracking.
 * Displays spending against set budget with visual progress indicator.
 * Uses brand-compliant Primary color (#0ABAB5) for progress bar.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../design-system/atoms/Text';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { formatFullPrice } from '../data/vehicles';

interface WeeklyPurchaseProgressProps {
  /** Total amount spent in the current 7-day period */
  amountSpent: number;
  /** Number of vehicles purchased this week */
  vehicleCount: number;
  /** Days remaining in the current week */
  daysRemaining: number;
  /** Weekly budget limit */
  budget: number;
  /** Callback when settings button is pressed */
  onSettingsPress: () => void;
}

export const WeeklyPurchaseProgress: React.FC<WeeklyPurchaseProgressProps> = ({
  amountSpent,
  vehicleCount,
  daysRemaining,
  budget,
  onSettingsPress,
}) => {
  const budgetPercentage = budget > 0 ? (amountSpent / budget) * 100 : 0;
  const remainingBudget = budget - amountSpent;
  const isOverBudget = amountSpent > budget;
  const isNearBudget = budgetPercentage >= 80 && !isOverBudget;

  const getProgressColor = () => {
    if (isOverBudget) return Colors.accent;
    if (isNearBudget) return Colors.warning;
    return Colors.primary;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
          <Text variant="bodySmall" weight="semibold" style={styles.title}>
            7-Day Purchase Activity
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text variant="caption" style={styles.daysRemaining}>
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text variant="h4" weight="bold" style={styles.statValue}>
            {formatFullPrice(amountSpent)}
          </Text>
          <Text variant="caption" style={styles.statLabel}>
            Total Spent
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text variant="h4" weight="bold" style={styles.statValue}>
            {vehicleCount}
          </Text>
          <Text variant="caption" style={styles.statLabel}>
            Vehicles Purchased
          </Text>
        </View>
      </View>

      {/* Budget Progress */}
      <View style={styles.budgetSection}>
        <View style={styles.budgetHeader}>
          <Text variant="caption" style={styles.budgetLabel}>
            Budget Progress
          </Text>
          <Text variant="caption" weight="semibold" style={[
            styles.budgetPercentage,
            isOverBudget && styles.budgetOverText,
            isNearBudget && styles.budgetNearText,
          ]}>
            {Math.round(budgetPercentage)}% used
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(budgetPercentage, 100)}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>

        <View style={styles.budgetFooter}>
          <Text variant="caption" style={styles.budgetText}>
            {formatFullPrice(amountSpent)} of {formatFullPrice(budget)}
          </Text>
          {!isOverBudget ? (
            <Text variant="caption" style={styles.remainingText}>
              {formatFullPrice(remainingBudget)} remaining
            </Text>
          ) : (
            <Text variant="caption" style={styles.overBudgetText}>
              {formatFullPrice(Math.abs(remainingBudget))} over budget
            </Text>
          )}
        </View>
      </View>

      {/* Budget Alert Banner */}
      {(isNearBudget || isOverBudget) && (
        <View style={[
          styles.alertBanner,
          isOverBudget ? styles.alertBannerDanger : styles.alertBannerWarning,
        ]}>
          <Ionicons
            name={isOverBudget ? 'alert-circle' : 'warning'}
            size={16}
            color={isOverBudget ? Colors.accent : Colors.warning}
          />
          <Text variant="caption" style={[
            styles.alertText,
            isOverBudget ? styles.alertTextDanger : styles.alertTextWarning,
          ]}>
            {isOverBudget
              ? 'You have exceeded your weekly budget'
              : 'You are approaching your weekly budget limit'}
          </Text>
        </View>
      )}

      {/* Set Budget Hint (shown when no budget or very low) */}
      {budget === 0 && (
        <TouchableOpacity style={styles.setBudgetHint} onPress={onSettingsPress}>
          <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
          <Text variant="caption" style={styles.setBudgetText}>
            Tap settings to set your weekly budget
          </Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    color: Colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  daysRemaining: {
    color: Colors.primary,
  },
  settingsButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.text,
  },
  statLabel: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  budgetSection: {
    marginTop: Spacing.xs,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  budgetLabel: {
    color: Colors.textMuted,
  },
  budgetPercentage: {
    color: Colors.primary,
  },
  budgetOverText: {
    color: Colors.accent,
  },
  budgetNearText: {
    color: Colors.warning,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  budgetText: {
    color: Colors.textMuted,
  },
  remainingText: {
    color: Colors.success,
  },
  overBudgetText: {
    color: Colors.accent,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  alertBannerWarning: {
    backgroundColor: Colors.warning + '15',
  },
  alertBannerDanger: {
    backgroundColor: Colors.accent + '15',
  },
  alertText: {
    flex: 1,
  },
  alertTextWarning: {
    color: Colors.warning,
  },
  alertTextDanger: {
    color: Colors.accent,
  },
  setBudgetHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
  },
  setBudgetText: {
    color: Colors.primary,
  },
});

export default WeeklyPurchaseProgress;
