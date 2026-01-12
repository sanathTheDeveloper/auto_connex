/**
 * SpendingAnalyticsCard Component
 * 
 * Displays spending analytics with tab switcher (Week | Month | Year).
 * Shows total spending, purchase count, and average per vehicle.
 * 
 * @example
 * <SpendingAnalyticsCard
 *   weeklySpending={45000}
 *   monthlySpending={180000}
 *   yearlySpending={2160000}
 *   weeklyCount={3}
 *   monthlyCount={12}
 *   yearlyCount={144}
 * />
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from '../atoms/Text';
import { Spacer } from '../atoms/Spacer';
import { Colors, Spacing, BorderRadius } from '../primitives';

type TimePeriod = 'week' | 'month' | 'year';

export interface SpendingAnalyticsCardProps {
  weeklySpending: number;
  monthlySpending: number;
  yearlySpending: number;
  weeklyCount: number;
  monthlyCount: number;
  yearlyCount: number;
}

export const SpendingAnalyticsCard: React.FC<SpendingAnalyticsCardProps> = ({
  weeklySpending,
  monthlySpending,
  yearlySpending,
  weeklyCount,
  monthlyCount,
  yearlyCount,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getDataForPeriod = () => {
    switch (selectedPeriod) {
      case 'week':
        return {
          spending: weeklySpending,
          count: weeklyCount,
          average: weeklyCount > 0 ? weeklySpending / weeklyCount : 0,
          label: 'This Week',
        };
      case 'month':
        return {
          spending: monthlySpending,
          count: monthlyCount,
          average: monthlyCount > 0 ? monthlySpending / monthlyCount : 0,
          label: 'This Month',
        };
      case 'year':
        return {
          spending: yearlySpending,
          count: yearlyCount,
          average: yearlyCount > 0 ? yearlySpending / yearlyCount : 0,
          label: 'This Year',
        };
    }
  };

  const data = getDataForPeriod();

  return (
    <View style={styles.container}>
      <Text variant="h4" style={styles.title}>
        Spending Analytics
      </Text>
      
      <Spacer size="sm" />
      
      <View style={styles.card}>
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedPeriod === 'week' && styles.tabActive]}
            onPress={() => setSelectedPeriod('week')}
            activeOpacity={0.7}
          >
            <Text
              variant="label"
              style={[
                styles.tabText,
                selectedPeriod === 'week' && styles.tabTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedPeriod === 'month' && styles.tabActive]}
            onPress={() => setSelectedPeriod('month')}
            activeOpacity={0.7}
          >
            <Text
              variant="label"
              style={[
                styles.tabText,
                selectedPeriod === 'month' && styles.tabTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedPeriod === 'year' && styles.tabActive]}
            onPress={() => setSelectedPeriod('year')}
            activeOpacity={0.7}
          >
            <Text
              variant="label"
              style={[
                styles.tabText,
                selectedPeriod === 'year' && styles.tabTextActive,
              ]}
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>
        
        <Spacer size="lg" />
        
        {/* Stats Display */}
        <View style={styles.statsContainer}>
          {/* Total Spending */}
          <View style={styles.statItem}>
            <Text variant="bodySmall" style={styles.statLabel}>
              Total Spent
            </Text>
            <Spacer size="xs" />
            <Text variant="h2" style={styles.statValue}>
              {formatCurrency(data.spending)}
            </Text>
          </View>
          
          <Spacer size="lg" />
          
          {/* Purchase Count and Average */}
          <View style={styles.statsRow}>
            <View style={styles.statItemSmall}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Purchases
              </Text>
              <Spacer size="xs" />
              <Text variant="h3" style={styles.statValueSecondary}>
                {data.count}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statItemSmall}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Average
              </Text>
              <Spacer size="xs" />
              <Text variant="h3" style={styles.statValueSecondary}>
                {formatCurrency(data.average)}
              </Text>
            </View>
          </View>
        </View>
        
        <Spacer size="sm" />
        
        <Text variant="caption" style={styles.periodLabel}>
          {data.label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    // Shadow for iOS
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.surface,
    // Shadow for iOS
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 2,
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: Colors.primary,
  },
  statValueSecondary: {
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItemSmall: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.border,
  },
  periodLabel: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
