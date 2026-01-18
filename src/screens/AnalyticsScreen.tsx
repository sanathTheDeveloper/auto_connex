/**
 * AnalyticsScreen Component - Modern Dashboard Design
 *
 * Comprehensive analytics dashboard for wholesalers following modern mobile-first design.
 * Features:
 * - Interactive area charts with touch feedback
 * - Animated period selector with sliding indicator
 * - Card-based layout with subtle shadows
 * - Wholesaler-specific KPIs: purchases, offers, inventory
 * - Performance summary with dealer insights
 * - Real-time data from PurchasesOffersContext
 *
 * Design inspired by modern trading/finance apps
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { RootStackParamList } from '../navigation';

// Design System
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Button } from '../design-system/atoms/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../design-system/primitives';

// Context for real data
import { usePurchasesOffers } from '../contexts/PurchasesOffersContext';
import { useMyListings } from '../contexts/MyListingsContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// TYPES
// ============================================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analytics'>;

interface AnalyticsScreenProps {
  navigation: NavigationProp;
}

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

const PERIODS: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

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
// MOCK DATA - Enhanced for wholesaler analytics
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
};

// Performance metrics data
const PERFORMANCE_METRICS = [
  { label: 'Direct Inquiries', source: 'Online Leads', count: 245, change: 12 },
  { label: 'Dealer Referrals', source: 'Partner Network', count: 89, change: 8 },
  { label: 'Repeat Customers', source: 'Existing Dealers', count: 156, change: 23 },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  // Context data
  const {
    purchases,
    soldVehicles,
    offersSent,
    offersReceived,
    getSpendingAnalytics,
    getPendingOffersReceivedCount,
    getPendingOffersSentCount,
  } = usePurchasesOffers();
  const { listings, getListingsByStatus } = useMyListings();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1W');
  const [selectedDataPoint, setSelectedDataPoint] = useState<RevenueDataPoint | null>(null);
  const [viewport, setViewport] = useState<ScaledSize>(Dimensions.get('window'));

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const indicatorAnim = useRef(new Animated.Value(PERIODS.indexOf('1W'))).current;

  // Get current data
  const revenueData = MOCK_DATA.revenue[selectedPeriod];
  const isPositive = revenueData.change >= 0;

  // Calculate real metrics from context
  const realMetrics = useMemo(() => {
    const spendingAnalytics = getSpendingAnalytics();
    const activeListings = getListingsByStatus('available').length;
    const pendingListings = getListingsByStatus('pending').length;
    const soldCount = soldVehicles.length;
    const purchaseCount = purchases.length;

    // Calculate average purchase price
    const avgPurchasePrice = purchases.length > 0
      ? purchases.reduce((sum, p) => sum + p.purchaseAmount, 0) / purchases.length
      : 0;

    // Calculate average sale price
    const avgSalePrice = soldVehicles.length > 0
      ? soldVehicles.reduce((sum, s) => sum + s.saleAmount, 0) / soldVehicles.length
      : 0;

    // Calculate offer acceptance rate
    const approvedOffersSent = offersSent.filter(o => o.status === 'approved').length;
    const offerSuccessRate = offersSent.length > 0
      ? Math.round((approvedOffersSent / offersSent.length) * 100)
      : 0;

    return {
      weeklySpending: spendingAnalytics.weeklySpending,
      monthlySpending: spendingAnalytics.monthlySpending,
      yearlySpending: spendingAnalytics.yearlySpending,
      activeListings,
      pendingListings,
      soldCount,
      purchaseCount,
      avgPurchasePrice,
      avgSalePrice,
      offerSuccessRate,
      pendingOffersReceived: getPendingOffersReceivedCount(),
      pendingOffersSent: getPendingOffersSentCount(),
      totalOffersSent: offersSent.length,
      totalOffersReceived: offersReceived.length,
    };
  }, [purchases, soldVehicles, offersSent, offersReceived, listings, getSpendingAnalytics, getListingsByStatus, getPendingOffersReceivedCount, getPendingOffersSentCount]);

  // Calculate chart dimensions
  const maxWidth = Platform.OS === 'web' ? Math.min(480, viewport.width) : viewport.width;
  const chartWidth = Math.max(maxWidth - (Spacing.md * 2) - 32, 260);

  // Handle viewport changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setViewport(window);
    });
    return () => subscription?.remove();
  }, []);

  // Animate on period change
  useEffect(() => {
    const newIndex = PERIODS.indexOf(selectedPeriod);

    Animated.parallel([
      Animated.timing(indicatorAnim, {
        toValue: newIndex,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setSelectedDataPoint(null);
  }, [selectedPeriod, fadeAnim, indicatorAnim]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePeriodChange = (period: TimePeriod) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPeriod(period);
  };

  const handleChartPress = (index: number) => {
    const dataPoint = revenueData.detailedData[index];
    setSelectedDataPoint(dataPoint);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompactCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value}`;
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-AU').format(value);
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderCustomChart = () => {
    const chartHeight = 280;
    const chartPadding = { top: 20, right: 10, bottom: 40, left: 50 };
    const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right;
    const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

    const dataValues = revenueData.data;
    const maxValue = Math.max(...dataValues);
    const minValue = Math.min(...dataValues);
    const valueRange = maxValue - minValue;

    // Calculate points for the area chart
    const points = dataValues.map((value, index) => {
      const x = chartPadding.left + (index / (dataValues.length - 1)) * chartInnerWidth;
      const y = chartPadding.top + chartInnerHeight - ((value - minValue) / valueRange) * chartInnerHeight;
      return { x, y, value, label: revenueData.labels[index] };
    });

    // Create smooth curve path (using quadratic bezier curves)
    const createSmoothPath = (pts: typeof points) => {
      if (pts.length === 0) return '';
      
      let path = `M ${pts[0].x} ${pts[0].y}`;
      
      for (let i = 0; i < pts.length - 1; i++) {
        const current = pts[i];
        const next = pts[i + 1];
        const controlX = (current.x + next.x) / 2;
        
        path += ` Q ${controlX} ${current.y}, ${controlX} ${(current.y + next.y) / 2}`;
        path += ` Q ${controlX} ${next.y}, ${next.x} ${next.y}`;
      }
      
      return path;
    };

    const linePath = createSmoothPath(points);
    
    // Create area path (same as line but closed to bottom)
    const areaPath = linePath + 
      ` L ${points[points.length - 1].x} ${chartHeight - chartPadding.bottom}` +
      ` L ${chartPadding.left} ${chartHeight - chartPadding.bottom} Z`;

    // Y-axis labels
    const yAxisSteps = 5;
    const yAxisLabels = Array.from({ length: yAxisSteps }, (_, i) => {
      const value = minValue + (valueRange / (yAxisSteps - 1)) * i;
      const y = chartHeight - chartPadding.bottom - (i / (yAxisSteps - 1)) * chartInnerHeight;
      return { value, y };
    });

    return (
      <View style={styles.customChartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <SvgLinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>

          {/* Horizontal grid lines */}
          {yAxisLabels.map((label, i) => (
            <Line
              key={`grid-${i}`}
              x1={chartPadding.left}
              y1={label.y}
              x2={chartWidth - chartPadding.right}
              y2={label.y}
              stroke="#F0F0F0"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {yAxisLabels.map((label, i) => (
            <SvgText
              key={`y-label-${i}`}
              x={chartPadding.left - 10}
              y={label.y + 4}
              fill={Colors.textMuted}
              fontSize="11"
              textAnchor="end"
              fontWeight="500"
            >
              {formatCompactCurrency(label.value)}
            </SvgText>
          ))}

          {/* Area fill */}
          <Path
            d={areaPath}
            fill="url(#areaGradient)"
          />

          {/* Line stroke */}
          <Path
            d={linePath}
            stroke={Colors.secondary}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => {
            const isSelected = selectedDataPoint &&
              revenueData.detailedData[index]?.value === selectedDataPoint.value;

            return (
              <React.Fragment key={`point-${index}`}>
                {isSelected && (
                  <>
                    {/* Vertical dashed line */}
                    <Line
                      x1={point.x}
                      y1={point.y}
                      x2={point.x}
                      y2={chartHeight - chartPadding.bottom}
                      stroke={Colors.secondary}
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    {/* Active dot with border */}
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill={Colors.secondary}
                      stroke={Colors.white}
                      strokeWidth="3"
                    />
                  </>
                )}
                {/* Invisible touch target */}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r="15"
                  fill="transparent"
                  onPress={() => handleChartPress(index)}
                />
              </React.Fragment>
            );
          })}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <SvgText
              key={`x-label-${index}`}
              x={point.x}
              y={chartHeight - chartPadding.bottom + 20}
              fill={Colors.textMuted}
              fontSize="11"
              textAnchor="middle"
              fontWeight="500"
            >
              {point.label}
            </SvgText>
          ))}
        </Svg>

        {/* Floating Tooltip */}
        {selectedDataPoint && (
          <Animated.View 
            style={[
              styles.floatingTooltip,
              {
                right: Spacing.lg,
                top: 20,
                opacity: fadeAnim,
              }
            ]}
          >
            <Text variant="bodySmall" weight="bold" style={styles.floatingTooltipValue}>
              {formatCurrency(selectedDataPoint.value)}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderPeriodSelector = () => {
    const segmentWidth = (maxWidth - (Spacing.md * 2) - 8) / PERIODS.length;

    return (
      <View style={styles.periodSelectorCard}>
        <View style={styles.periodSelectorRow}>
          {PERIODS.map((period, index) => (
            <TouchableOpacity
              key={period}
              onPress={() => handlePeriodChange(period)}
              style={styles.periodButton}
              activeOpacity={0.7}
            >
              <Text
                variant="caption"
                weight={selectedPeriod === period ? 'bold' : 'medium'}
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {PERIOD_LABELS[period]}
              </Text>
              {selectedPeriod === period && (
                <Animated.View style={styles.periodIndicatorDot} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Decorative track line */}
        <View style={styles.periodTrackLine} />

        {/* Animated active segment indicator */}
        <Animated.View
          style={[
            styles.periodActiveSegment,
            {
              width: segmentWidth,
              left: indicatorAnim.interpolate({
                inputRange: PERIODS.map((_, i) => i),
                outputRange: PERIODS.map((_, i) => 4 + (i * segmentWidth)),
              }),
            },
          ]}
        />
      </View>
    );
  };

  const renderMetricCard = (
    label: string,
    value: string,
    subtext: string,
    icon?: string,
    highlight?: boolean
  ) => (
    <View style={[styles.metricCard, highlight && styles.metricCardHighlight]}>
      {icon && (
        <View style={[styles.metricIcon, highlight && styles.metricIconHighlight]}>
          <Ionicons
            name={icon as any}
            size={18}
            color={highlight ? Colors.white : Colors.primary}
          />
        </View>
      )}
      <Text variant="caption" style={styles.metricLabel}>
        {label}
      </Text>
      <Text variant="h3" weight="bold" style={[styles.metricValue, highlight && styles.metricValueHighlight]}>
        {value}
      </Text>
      <Text variant="caption" style={styles.metricSubtext}>
        {subtext}
      </Text>
    </View>
  );

  const renderPerformanceRow = (
    label: string,
    source: string,
    count: number,
    change: number,
    index: number
  ) => (
    <TouchableOpacity
      key={index}
      style={styles.performanceRow}
      activeOpacity={0.7}
    >
      <View style={styles.performanceIconContainer}>
        <Ionicons name="trending-up" size={20} color={Colors.primary} />
      </View>
      <View style={styles.performanceInfo}>
        <Text variant="body" weight="medium">{label}</Text>
        <Text variant="caption" color="textMuted">{source}</Text>
      </View>
      <View style={styles.performanceStats}>
        <Text variant="body" weight="bold">{formatNumber(count)}</Text>
        <Text
          variant="caption"
          style={{ color: change >= 0 ? Colors.success : Colors.error }}
          weight="semibold"
        >
          {change >= 0 ? '+' : ''}{change}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </TouchableOpacity>

        <Text variant="h4" weight="bold" style={styles.headerTitle}>
          Analytics
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        {renderPeriodSelector()}

        <Spacer size="md" />

        {/* Main Revenue Card */}
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim }]}>
          <Text variant="caption" style={styles.heroLabel}>
            TOTAL REVENUE
          </Text>
          <Text variant="h1" weight="bold" style={styles.heroValue}>
            {formatCurrency(revenueData.total)}
          </Text>
          <View style={styles.changeContainer}>
            <View style={[styles.changeBadge, !isPositive && styles.changeBadgeNegative]}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositive ? Colors.success : Colors.error}
              />
              <Text
                variant="bodySmall"
                weight="semibold"
                style={{ color: isPositive ? Colors.success : Colors.error }}
              >
                {isPositive ? '+' : ''}{revenueData.change}%
              </Text>
            </View>
            <Text variant="caption" color="textMuted">
              vs Previous {PERIOD_LABELS[selectedPeriod]}
            </Text>
          </View>
        </Animated.View>

        <Spacer size="md" />

        {/* Chart Card */}
        <Animated.View style={[styles.chartCard, { transform: [{ scale: scaleAnim }] }]}>
          {renderCustomChart()}

          <View style={styles.chartHint}>
            <View style={styles.hintDot} />
            <Text variant="caption" color="textMuted">
              Tap any point on the chart to view details
            </Text>
          </View>
        </Animated.View>

        <Spacer size="lg" />

        {/* Quick Stats Grid */}
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'VEHICLES SOLD',
            formatNumber(realMetrics.soldCount > 0 ? realMetrics.soldCount : 127),
            'in selected period'
          )}
          {renderMetricCard(
            'AVG PRICE',
            formatCompactCurrency(realMetrics.avgSalePrice > 0 ? realMetrics.avgSalePrice : 24500),
            'per vehicle'
          )}
          {renderMetricCard(
            'SUCCESS RATE',
            `${realMetrics.offerSuccessRate > 0 ? realMetrics.offerSuccessRate : 68}%`,
            'offer conversion'
          )}
        </View>

        <Spacer size="lg" />

        {/* Wholesaler-Specific Metrics */}
        <Text variant="h4" weight="bold" style={styles.sectionTitle}>
          Buying Activity
        </Text>
        <Spacer size="sm" />

        <View style={styles.activityGrid}>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name="cart-outline" size={20} color={Colors.primary} />
              </View>
              <Text variant="caption" color="textMuted">PURCHASES</Text>
            </View>
            <Text variant="h2" weight="bold" color="primary">
              {realMetrics.purchaseCount}
            </Text>
            <Text variant="caption" color="textMuted">
              {formatCompactCurrency(realMetrics.weeklySpending)} this week
            </Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.secondary + '15' }]}>
                <Ionicons name="pricetag-outline" size={20} color={Colors.secondary} />
              </View>
              <Text variant="caption" color="textMuted">OFFERS SENT</Text>
            </View>
            <Text variant="h2" weight="bold" color="secondary">
              {realMetrics.totalOffersSent}
            </Text>
            <Text variant="caption" color="textMuted">
              {realMetrics.pendingOffersSent} pending
            </Text>
          </View>
        </View>

        <Spacer size="md" />

        {/* Selling Activity */}
        <Text variant="h4" weight="bold" style={styles.sectionTitle}>
          Selling Activity
        </Text>
        <Spacer size="sm" />

        <View style={styles.activityGrid}>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.success + '15' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
              </View>
              <Text variant="caption" color="textMuted">ACTIVE LISTINGS</Text>
            </View>
            <Text variant="h2" weight="bold" style={{ color: Colors.success }}>
              {realMetrics.activeListings}
            </Text>
            <Text variant="caption" color="textMuted">
              {realMetrics.pendingListings} pending
            </Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.warning + '15' }]}>
                <Ionicons name="mail-outline" size={20} color={Colors.warning} />
              </View>
              <Text variant="caption" color="textMuted">OFFERS RECEIVED</Text>
            </View>
            <Text variant="h2" weight="bold" style={{ color: Colors.warning }}>
              {realMetrics.totalOffersReceived}
            </Text>
            <Text variant="caption" color="textMuted">
              {realMetrics.pendingOffersReceived} pending review
            </Text>
          </View>
        </View>

        <Spacer size="lg" />

        {/* Performance Summary */}
        <View style={styles.summaryCard}>
          <Text variant="h4" weight="bold" style={styles.summaryTitle}>
            Performance Summary
          </Text>
          <Spacer size="md" />

          {PERFORMANCE_METRICS.map((metric, index) =>
            renderPerformanceRow(
              metric.label,
              metric.source,
              metric.count,
              metric.change,
              index
            )
          )}
        </View>

        <Spacer size="lg" />

        {/* Period Stats Card */}
        <View style={styles.statsCard}>
          <Text variant="body" weight="semibold" style={styles.statsCardTitle}>
            {PERIOD_LABELS[selectedPeriod]} Statistics
          </Text>
          <Spacer size="sm" />

          <View style={styles.statsRow}>
            <Text variant="bodySmall" color="textMuted">Highest Revenue</Text>
            <Text variant="bodySmall" weight="semibold">
              {formatCurrency(Math.max(...revenueData.data))}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text variant="bodySmall" color="textMuted">Lowest Revenue</Text>
            <Text variant="bodySmall" weight="semibold">
              {formatCurrency(Math.min(...revenueData.data))}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text variant="bodySmall" color="textMuted">Average per Period</Text>
            <Text variant="bodySmall" weight="semibold">
              {formatCurrency(revenueData.total / revenueData.data.length)}
            </Text>
          </View>
          <View style={[styles.statsRow, { borderBottomWidth: 0 }]}>
            <Text variant="bodySmall" color="textMuted">Best Period</Text>
            <Text variant="bodySmall" weight="semibold">
              {revenueData.detailedData[revenueData.detailedData.length - 1]?.time || 'Current'}
            </Text>
          </View>
        </View>

        <Spacer size="lg" />

        {/* Export Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            fullWidth
            onPress={() => {
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
    backgroundColor: '#F5F5F7',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F5F5F7',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    color: Colors.text,
  },

  // Period Selector
  periodSelectorCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xs,
    paddingHorizontal: 4,
    marginTop: Spacing.sm,
    ...Shadows.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  periodSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  periodButtonTextActive: {
    color: Colors.primary,
  },
  periodIndicatorDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  periodTrackLine: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.md,
    right: Spacing.md,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  periodActiveSegment: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: Colors.primary + '30',
    borderRadius: 1,
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  heroLabel: {
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: 4,
  },
  heroValue: {
    color: Colors.text,
    fontSize: 42,
    letterSpacing: -1,
    marginVertical: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '10',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  changeBadgeNegative: {
    backgroundColor: Colors.error + '10',
  },

  // Chart Card
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    ...Shadows.sm,
    overflow: 'visible',
  },
  customChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  chartContainer: {
    position: 'relative',
  },
  chart: {
    marginLeft: -16,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  floatingTooltip: {
    position: 'absolute',
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
    zIndex: 100,
  },
  floatingTooltipValue: {
    color: Colors.white,
    fontSize: 13,
  },
  chartHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F0',
    marginTop: Spacing.xs,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.warning,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  metricCardHighlight: {
    backgroundColor: Colors.primary,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricIconHighlight: {
    backgroundColor: Colors.white + '20',
  },
  metricLabel: {
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 9,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    color: Colors.primary,
    fontSize: 22,
    marginBottom: 2,
  },
  metricValueHighlight: {
    color: Colors.white,
  },
  metricSubtext: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },

  // Section Title
  sectionTitle: {
    color: Colors.text,
    paddingLeft: 4,
  },

  // Activity Grid
  activityGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  activityCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  summaryTitle: {
    color: Colors.text,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: 4,
  },
  performanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceStats: {
    alignItems: 'flex-end',
  },

  // Stats Card
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  statsCardTitle: {
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },

  // Button Container
  buttonContainer: {
    marginTop: Spacing.sm,
  },
});
