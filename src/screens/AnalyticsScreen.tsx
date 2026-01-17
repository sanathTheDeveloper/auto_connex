/**
 * AnalyticsScreen Component - iOS-Native Style
 *
 * Clean, card-based analytics dashboard following iOS Human Interface Guidelines
 * Features:
 * - Interactive, scrollable charts with touch points
 * - Card-based layout with subtle shadows
 * - iOS-style navigation and typography
 * - Mobile-first responsive design
 * - Tap on chart points to view detailed data
 *
 * Uses react-native-chart-kit for cross-platform data visualization
 * Design pattern matches NotificationScreen for brand consistency
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScaledSize,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LineChart } from 'react-native-chart-kit';
import { RootStackParamList } from '../navigation';

// Design System
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Button } from '../design-system/atoms/Button';
import { Colors, Spacing, SpacingMobile, BorderRadius } from '../design-system/primitives';

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

// ============================================================================
// TYPES
// ============================================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analytics'>;

interface AnalyticsScreenProps {
  navigation: NavigationProp;
}

// Trading-style period selector
type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

// Period display labels for better UX - short and consistent
const PERIOD_LABELS: Record<TimePeriod, string> = {
  '1D': 'Today',
  '1W': 'Week',
  '1M': 'Month',
  '3M': '3 Months',
  '1Y': 'Year',
  'ALL': 'All Time',
};

interface RevenueDataPoint {
  time: string;
  value: number;
}

interface PeriodData {
  total: number;
  change: number;
  data: number[];
  labels: string[];
  detailedData: RevenueDataPoint[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DATA = {
  revenue: {
    '1D': {
      total: 48500,
      change: 2.5,
      data: [45200, 46100, 47300, 48500],
      labels: ['9AM', '12PM', '3PM', '6PM'],
      detailedData: [
        { time: '9:00 AM', value: 45200 },
        { time: '12:00 PM', value: 46100 },
        { time: '3:00 PM', value: 47300 },
        { time: '6:00 PM', value: 48500 },
      ],
    },
    '1W': {
      total: 185000,
      change: 8.3,
      data: [140000, 155000, 162000, 170000, 175000, 180000, 185000],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      detailedData: [
        { time: 'Monday', value: 140000 },
        { time: 'Tuesday', value: 155000 },
        { time: 'Wednesday', value: 162000 },
        { time: 'Thursday', value: 170000 },
        { time: 'Friday', value: 175000 },
        { time: 'Saturday', value: 180000 },
        { time: 'Sunday', value: 185000 },
      ],
    },
    '1M': {
      total: 742000,
      change: 12.4,
      data: [680000, 690000, 705000, 720000, 735000, 742000],
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
      detailedData: [
        { time: 'Week 1', value: 680000 },
        { time: 'Week 2', value: 690000 },
        { time: 'Week 3', value: 705000 },
        { time: 'Week 4', value: 720000 },
        { time: 'Week 5', value: 735000 },
        { time: 'Week 6', value: 742000 },
      ],
    },
    '3M': {
      total: 2150000,
      change: 15.2,
      data: [1800000, 1900000, 2000000, 2100000, 2150000],
      labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      detailedData: [
        { time: 'November', value: 1800000 },
        { time: 'December', value: 1900000 },
        { time: 'January', value: 2000000 },
        { time: 'February', value: 2100000 },
        { time: 'March', value: 2150000 },
      ],
    },
    '1Y': {
      total: 8500000,
      change: 22.8,
      data: [6500000, 7000000, 7500000, 7800000, 8000000, 8200000, 8350000, 8500000],
      labels: ['Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Feb', 'Mar', 'Now'],
      detailedData: [
        { time: 'April 2024', value: 6500000 },
        { time: 'June 2024', value: 7000000 },
        { time: 'August 2024', value: 7500000 },
        { time: 'October 2024', value: 7800000 },
        { time: 'December 2024', value: 8000000 },
        { time: 'February 2025', value: 8200000 },
        { time: 'March 2025', value: 8350000 },
        { time: 'Now', value: 8500000 },
      ],
    },
    'ALL': {
      total: 18500000,
      change: 145.3,
      data: [5000000, 8000000, 11000000, 14000000, 16500000, 18500000],
      labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
      detailedData: [
        { time: '2020', value: 5000000 },
        { time: '2021', value: 8000000 },
        { time: '2022', value: 11000000 },
        { time: '2023', value: 14000000 },
        { time: '2024', value: 16500000 },
        { time: '2025', value: 18500000 },
      ],
    },
  } as Record<TimePeriod, PeriodData>,
  metrics: {
    vehiclesSold: 127,
    avgPrice: 24500,
    conversionRate: 68,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  // State
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1W');
  const [selectedDataPoint, setSelectedDataPoint] = useState<RevenueDataPoint | null>(null);
  const [viewport, setViewport] = useState<ScaledSize>(Dimensions.get('window'));

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sliderPosition = useRef(new Animated.Value(1)).current; // 0-5 for 6 periods

  // Period mapping
  const periods: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  const periodIndex = periods.indexOf(selectedPeriod);

  // Get current data
  const revenueData = MOCK_DATA.revenue[selectedPeriod];
  const isPositive = revenueData.change >= 0;
  const responsiveSpacing = getResponsiveSpacing('lg', viewport.width);

  // Calculate chart width - responsive to viewport
  const maxWidth = Platform.OS === 'web' ? Math.min(480, viewport.width) : viewport.width;
  // Account for: container margins (Spacing.md * 2) + card padding (Spacing.sm * 2 for mobile)
  const containerMargins = Spacing.md * 2;
  const cardPadding = Platform.OS === 'web' ? Spacing.md * 2 : Spacing.sm * 2;
  const chartWidth = Math.max(maxWidth - containerMargins - cardPadding - 40, 260); // Min 260px width

  // Handle viewport changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setViewport(window);
    });
    return () => subscription?.remove();
  }, []);

  // Animate on period change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedDataPoint(null);
  }, [selectedPeriod, fadeAnim]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  const handleChartPress = (data: any) => {
    if (data && data.index !== undefined) {
      const dataPoint = revenueData.detailedData[data.index];
      setSelectedDataPoint(dataPoint);

      // Animate scale
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatCurrency = (value: number): string => {
    // Format with commas and 2 decimal places
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    // Format numbers with commas
    return new Intl.NumberFormat('en-AU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderPeriodSlider = () => {
    const containerPadding = Spacing.md * 2;
    const sliderWidth = viewport.width > 480 
      ? 480 - containerPadding - (Spacing.md * 2) 
      : viewport.width - containerPadding - (Spacing.md * 2);
    const segmentWidth = sliderWidth / (periods.length - 1);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        // Calculate which period based on touch position
        const touchX = gestureState.x0;
        const containerOffset = Spacing.md + Spacing.xs;
        const adjustedX = touchX - containerOffset;
        const index = Math.round(adjustedX / segmentWidth);
        const clampedIndex = Math.max(0, Math.min(periods.length - 1, index));
        setSelectedPeriod(periods[clampedIndex]);
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate position based on drag
        const containerOffset = Spacing.md + Spacing.xs;
        const adjustedX = gestureState.moveX - containerOffset;
        const newIndex = Math.round(adjustedX / segmentWidth);
        const clampedIndex = Math.max(0, Math.min(periods.length - 1, newIndex));
        setSelectedPeriod(periods[clampedIndex]);
      },
    });

    return (
      <View style={styles.sliderContainer}>
        {/* Period Labels */}
        <View style={styles.periodLabelsContainer}>
          {periods.map((period, index) => {
            const isFirst = index === 0;
            const isLast = index === periods.length - 1;
            
            return (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[
                  styles.periodLabelWrapper,
                  isFirst && styles.periodLabelFirst,
                  isLast && styles.periodLabelLast,
                  !isFirst && !isLast && { width: segmentWidth },
                ]}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
              >
                <Text
                  variant="caption"
                  weight={selectedPeriod === period ? 'bold' : 'medium'}
                  style={[
                    styles.periodLabel,
                    selectedPeriod === period && styles.periodLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {PERIOD_LABELS[period]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Slider Track */}
        <View style={styles.sliderTrack} {...panResponder.panHandlers}>
          {/* Background Line */}
          <View style={styles.sliderLine} />
          
          {/* Active Line (from start to current position) */}
          <View
            style={[
              styles.sliderLineActive,
              { width: `${(periodIndex / (periods.length - 1)) * 100}%` },
            ]}
          />

          {/* Tick Marks */}
          <View style={styles.tickMarksContainer}>
            {periods.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.tickMark,
                  index <= periodIndex && styles.tickMarkActive,
                  { left: `${(index / (periods.length - 1)) * 100}%` },
                ]}
              />
            ))}
          </View>

          {/* Draggable Thumb */}
          <Animated.View
            style={[
              styles.sliderThumb,
              {
                left: `${(periodIndex / (periods.length - 1)) * 100}%`,
              },
            ]}
          >
            <View style={styles.sliderThumbInner} />
          </Animated.View>
        </View>
      </View>
    );
  };

  const renderPeriodPills = () => {
    const periods: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodScrollContainer}
        style={styles.periodScroll}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => handlePeriodChange(period)}
            style={[
              styles.periodPill,
              selectedPeriod === period && styles.periodPillActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              variant="label"
              weight="medium"
              style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* iOS-style Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text variant="h3" weight="bold" style={styles.headerTitle}>
              Analytics
            </Text>
          </View>

          <View style={styles.headerActions} />
        </View>

        <Spacer size="md" />

        {/* Period Selector Slider - Draggable Line */}
        {renderPeriodSlider()}

        <Spacer size="md" />

        {/* Hero Revenue Display - Card Style */}
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim }]}>
          <Text variant="caption" style={styles.heroLabel}>
            TOTAL REVENUE
          </Text>
          <Spacer size="xs" />
          <Text variant="h1" weight="bold" style={styles.heroValue}>
            {formatCurrency(revenueData.total)}
          </Text>
          <Spacer size="xs" />
          <View style={styles.changeRow}>
            <Text
              variant="body"
              weight="semibold"
              style={[styles.changeValue, { color: isPositive ? Colors.success : Colors.accent }]}
            >
              {isPositive ? '+' : ''}
              {revenueData.change}%
            </Text>
            <Text variant="bodySmall" style={styles.changeLabel}>
              {selectedPeriod === '1D' ? 'vs Yesterday' : `vs Previous ${PERIOD_LABELS[selectedPeriod]}`}
            </Text>
          </View>
        </Animated.View>

        <Spacer size="md" />

        {/* Interactive Chart Section */}
        <Animated.View style={[styles.chartContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.chartWrapper}>
            {selectedDataPoint && (
              <View style={styles.dataPointTooltip}>
                <Text variant="caption" style={styles.tooltipTime}>
                  {selectedDataPoint.time}
                </Text>
                <Text variant="h4" weight="bold" style={styles.tooltipValue}>
                  {formatCurrency(selectedDataPoint.value)}
                </Text>
              </View>
            )}

            <LineChart
              data={{
                labels: revenueData.labels,
                datasets: [
                  {
                    data: revenueData.data,
                    color: (opacity = 1) => Colors.primary,
                    strokeWidth: 3,
                  },
                ],
              }}
              width={chartWidth}
              height={viewport.width <= 375 ? 180 : 200}
              chartConfig={{
                backgroundColor: Colors.white,
                backgroundGradientFrom: Colors.white,
                backgroundGradientTo: Colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(10, 186, 181, ${opacity})`,
                labelColor: (opacity = 1) => Colors.textSecondary,
                style: {
                  borderRadius: BorderRadius.lg,
                },
                propsForDots: {
                  r: viewport.width <= 375 ? '4' : '5',
                  strokeWidth: '3',
                  stroke: Colors.primary,
                  fill: Colors.white,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#E5E5EA',
                  strokeWidth: 1,
                },
                propsForLabels: {
                  fontSize: viewport.width <= 375 ? 10 : 11,
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines
              withVerticalLabels
              withHorizontalLabels
              fromZero={false}
              onDataPointClick={handleChartPress}
              formatYLabel={(value) => {
                const numValue = parseFloat(value);
                // Show full numbers with abbreviations for axis labels only
                if (numValue >= 1000000) return `$${(numValue / 1000000).toFixed(1)}M`;
                if (numValue >= 1000) return `$${(numValue / 1000).toFixed(0)}K`;
                return `$${value}`;
              }}
            />

            <View style={styles.chartHint}>
              <Text variant="caption" style={styles.hintText}>
                💡 Tap any point on the chart to view details
              </Text>
            </View>
          </View>
        </Animated.View>

        <Spacer size="lg" />

        {/* Key Metrics Grid - Trading Style */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text variant="caption" style={styles.metricLabel}>
              VEHICLES SOLD
            </Text>
            <Text variant="h3" weight="bold" style={styles.metricValue}>
              {formatNumber(MOCK_DATA.metrics.vehiclesSold)}
            </Text>
            <Text variant="caption" style={styles.metricSubtext}>
              in selected period
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text variant="caption" style={styles.metricLabel}>
              AVERAGE PRICE
            </Text>
            <Text variant="h3" weight="bold" style={styles.metricValue}>
              {formatCurrency(MOCK_DATA.metrics.avgPrice)}
            </Text>
            <Text variant="caption" style={styles.metricSubtext}>
              per vehicle sold
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text variant="caption" style={styles.metricLabel}>
              SUCCESS RATE
            </Text>
            <Text variant="h3" weight="bold" style={styles.metricValue}>
              {formatNumber(MOCK_DATA.metrics.conversionRate)}%
            </Text>
            <Text variant="caption" style={styles.metricSubtext}>
              of inquiries converted
            </Text>
          </View>
        </View>

        <Spacer size="lg" />

        {/* Performance Summary */}
        <View style={styles.summaryCard}>
          <Text variant="h4" weight="bold" style={styles.summaryTitle}>
            Performance Summary
          </Text>
          <Spacer size="sm" />

          <View style={styles.summaryRow}>
            <Text variant="bodySmall" style={styles.summaryLabel}>
              Best Performing Period
            </Text>
            <Text variant="bodySmall" weight="semibold" style={styles.summaryValue}>
              {revenueData.detailedData[revenueData.detailedData.length - 1]?.time || 'Current'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text variant="bodySmall" style={styles.summaryLabel}>
              Highest Revenue
            </Text>
            <Text variant="bodySmall" weight="semibold" style={styles.summaryValue}>
              {formatCurrency(Math.max(...revenueData.data))}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text variant="bodySmall" style={styles.summaryLabel}>
              Lowest Revenue
            </Text>
            <Text variant="bodySmall" weight="semibold" style={styles.summaryValue}>
              {formatCurrency(Math.min(...revenueData.data))}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text variant="bodySmall" style={styles.summaryLabel}>
              Average per Period
            </Text>
            <Text variant="bodySmall" weight="semibold" style={styles.summaryValue}>
              {formatCurrency(revenueData.total / revenueData.data.length)}
            </Text>
          </View>
        </View>

        <Spacer size="lg" />

        {/* Call to Action */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            fullWidth
            onPress={() => {
              // TODO: Implement analytics export functionality
              alert('Export functionality coming soon');
            }}
          >
            Export Full Report
          </Button>
        </View>

        <Spacer size="xl" />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS system background
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },

  // Header - iOS style (matching NotificationScreen)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'white',
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 17,
  },
  headerActions: {
    width: 44,
    alignItems: 'flex-end',
  },

  // Subtitle
  subtitleContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.white,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: Platform.select({
      web: 14,
      default: 12,
    }),
    letterSpacing: 0.1,
  },

  // Period Slider - Draggable line interface
  sliderContainer: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  periodLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    minHeight: 24,
  },
  periodLabelFirst: {
    alignItems: 'flex-start',
    paddingLeft: 0,
  },
  periodLabelLast: {
    alignItems: 'flex-end',
    paddingRight: 0,
  },
  periodLabel: {
    color: Colors.textMuted,
    fontSize: Platform.select({
      web: 11,
      default: 10,
    }),
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  periodLabelActive: {
    color: Colors.primary,
    fontSize: Platform.select({
      web: 12,
      default: 11,
    }),
  },
  sliderTrack: {
    height: 44,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginTop: Spacing.xs,
  },
  sliderLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#E5E5EA',
    borderRadius: 1.5,
  },
  sliderLineActive: {
    position: 'absolute',
    left: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },
  tickMarksContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
    justifyContent: 'center',
  },
  tickMark: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E5EA',
    borderWidth: 2,
    borderColor: Colors.white,
    marginLeft: -5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  tickMarkActive: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumbInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Hero Card - iOS card style
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Platform.select({
      web: Spacing.lg,
      default: Spacing.md,
    }),
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  heroLabel: {
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: Platform.select({
      web: 11,
      default: 10,
    }),
  },
  heroValue: {
    color: Colors.text,
    fontSize: Platform.select({
      web: 40,
      default: 32,
    }),
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  changeValue: {},
  changeLabel: {
    color: Colors.textSecondary,
  },

  // Period Selector - Horizontal scrollable tabs
  periodScroll: {
    maxHeight: 50,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodScrollContainer: {
    flexDirection: 'row',
    gap: 0,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  periodPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    backgroundColor: 'transparent',
    minWidth: 60,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  periodPillActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  periodTextActive: {
    color: Colors.white,
  },

  // Chart Card - iOS card style
  chartContainer: {
    marginHorizontal: Spacing.md,
    width: Platform.OS === 'web' ? undefined : '100%',
    alignSelf: 'stretch',
  },
  chartWrapper: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Platform.select({
      web: Spacing.md,
      default: Spacing.sm,
    }),
    paddingHorizontal: Platform.select({
      web: Spacing.md,
      default: Spacing.xs,
    }),
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  dataPointTooltip: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipTime: {
    color: Colors.white,
    fontSize: 11,
    marginBottom: 2,
  },
  tooltipValue: {
    color: Colors.white,
  },
  chart: {
    marginVertical: Spacing.xs,
    marginLeft: Platform.select({
      web: 0,
      default: -8,
    }),
    borderRadius: BorderRadius.md,
  },
  chartHint: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: 12,
  },

  // Metrics Grid - iOS card style
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: 95,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Platform.select({
      web: Spacing.md,
      default: Spacing.xs,
    }),
    paddingVertical: Platform.select({
      web: Spacing.md,
      default: Spacing.sm,
    }),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricLabel: {
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: Platform.select({
      web: 10,
      default: 9,
    }),
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  metricValue: {
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  metricSubtext: {
    color: Colors.textMuted,
    fontSize: Platform.select({
      web: 11,
      default: 10,
    }),
    textAlign: 'center',
    lineHeight: 14,
  },

  // Summary Card - iOS card style
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Platform.select({
      web: Spacing.md,
      default: Spacing.sm,
    }),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTitle: {
    color: Colors.text,
    fontSize: Platform.select({
      web: 18,
      default: 17,
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: Platform.select({
      web: 15,
      default: 14,
    }),
  },
  summaryValue: {
    color: Colors.text,
    fontSize: Platform.select({
      web: 15,
      default: 14,
    }),
  },

  // Button Container
  buttonContainer: {
    marginHorizontal: Spacing.md,
  },
});
