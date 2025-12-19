/**
 * WelcomeScreen Component
 *
 * User type selection screen with animated tab switcher.
 * Features Dealer/Wholesaler tabs with smooth content transitions.
 * Brand-compliant design following Auto Connex guidelines.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  Easing,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../design-system/atoms/Text';
import { Spacer } from '../../design-system/atoms/Spacer';
import { Button } from '../../design-system/atoms/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../design-system/primitives';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const getResponsiveWidth = () => Platform.OS === 'web' ? Math.min(480, SCREEN_WIDTH) : SCREEN_WIDTH;

// Navigation types
type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Signup: { userType: 'dealer' | 'wholesaler' };
  Home: undefined;
};

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

type UserType = 'dealer' | 'wholesaler';

// Role data with 5 benefits each - aligned with Auto Connex value proposition
const ROLE_DATA = {
  dealer: {
    icon: 'storefront' as const,
    title: 'Dealer',
    headline: 'Buy Smarter, Sell Faster',
    subtitle: 'Access wholesale inventory from verified sellers across Australia',
    features: [
      { icon: 'search-outline' as const, title: 'Nationwide Discovery', desc: 'Search inventory by make, model, year or location across all states' },
      { icon: 'shield-checkmark-outline' as const, title: 'PPSR Clear Title', desc: 'Every vehicle verified with instant PPSR certificate at purchase' },
      { icon: 'wallet-outline' as const, title: 'Weekly Buy & Pay', desc: 'Track your weekly purchases and settle payments on your terms' },
      { icon: 'notifications-outline' as const, title: 'Auto-Match Alerts', desc: 'Set criteria and get notified when matching stock is listed' },
      { icon: 'chatbubbles-outline' as const, title: 'Direct Negotiation', desc: 'Message wholesalers directly and negotiate deals in-app' },
    ],
    accentColor: Colors.primary,
    gradientColors: [Colors.primary, Colors.secondary] as [string, string],
  },
  wholesaler: {
    icon: 'business' as const,
    title: 'Wholesaler',
    headline: 'Reach More Buyers',
    subtitle: 'List your inventory and connect with verified dealers instantly',
    features: [
      { icon: 'flash-outline' as const, title: 'Instant Listings', desc: 'Enter rego once and auto-populate all vehicle specs instantly' },
      { icon: 'people-outline' as const, title: 'Verified Dealers', desc: 'Connect with license-verified dealers across Australia' },
      { icon: 'analytics-outline' as const, title: 'Stock Analytics', desc: 'Track views, enquiries and market demand for your inventory' },
      { icon: 'time-outline' as const, title: 'Faster Clearance', desc: 'Move stock quicker with broader nationwide reach' },
      { icon: 'lock-closed-outline' as const, title: 'Secure Messaging', desc: 'In-app chat keeps your contact details private until deal closes' },
    ],
    accentColor: Colors.accent,
    gradientColors: [Colors.accent, '#FF6B8A'] as [string, string],
  },
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<UserType>('dealer');
  const [containerWidth, setContainerWidth] = useState(getResponsiveWidth());
  const { height: windowHeight } = useWindowDimensions();

  // Determine if we should use flex layout (no scroll) on web
  const isCompactWeb = Platform.OS === 'web' && windowHeight < 800;

  // Animation values
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentSlideAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;

  // Handle window resize on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => setContainerWidth(getResponsiveWidth());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleTabChange = useCallback((tab: UserType) => {
    if (tab === activeTab) return;

    const isGoingRight = tab === 'wholesaler';

    // Animate out
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue: isGoingRight ? -20 : 20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnim, {
        toValue: 0.97,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tab);
      contentSlideAnim.setValue(isGoingRight ? 20 : -20);

      // Animate in
      Animated.parallel([
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlideAnim, {
          toValue: 0,
          tension: 120,
          friction: 14,
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Animate tab indicator
    Animated.spring(tabIndicatorAnim, {
      toValue: tab === 'dealer' ? 0 : 1,
      tension: 120,
      friction: 14,
      useNativeDriver: false,
    }).start();
  }, [activeTab, contentFadeAnim, contentSlideAnim, cardScaleAnim, tabIndicatorAnim]);

  const handleContinue = () => {
    navigation.navigate('Signup', { userType: activeTab });
  };

  const currentRole = ROLE_DATA[activeTab];

  // Tab indicator position - calculate based on container width
  const tabWidth = (containerWidth - Spacing.xl * 2 - Spacing.xs * 2 - 8) / 2;
  const indicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  const renderContent = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2" weight="bold" align="center">
          How will you use
        </Text>
        <Text variant="h2" weight="bold" align="center" style={styles.brandText}>
          Auto Connex?
        </Text>
      </View>

      <Spacer size={isCompactWeb ? 'sm' : 'md'} />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: tabWidth,
                transform: [{ translateX: indicatorTranslateX }],
                backgroundColor: currentRole.accentColor,
              }
            ]}
          />

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('dealer')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="storefront"
              size={16}
              color={activeTab === 'dealer' ? Colors.white : Colors.text}
              style={styles.tabIcon}
            />
            <Text
              variant="bodySmall"
              weight="semibold"
              style={activeTab === 'dealer' ? styles.tabTextActive : styles.tabText}
            >
              Dealer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('wholesaler')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business"
              size={16}
              color={activeTab === 'wholesaler' ? Colors.white : Colors.text}
              style={styles.tabIcon}
            />
            <Text
              variant="bodySmall"
              weight="semibold"
              style={activeTab === 'wholesaler' ? styles.tabTextActive : styles.tabText}
            >
              Wholesaler
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Spacer size={isCompactWeb ? 'sm' : 'md'} />

      {/* Animated Content Card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          isCompactWeb && styles.cardWrapperCompact,
          {
            opacity: contentFadeAnim,
            transform: [
              { translateX: contentSlideAnim },
              { scale: cardScaleAnim }
            ],
          }
        ]}
      >
        <View style={[styles.mainCard, isCompactWeb && styles.mainCardCompact]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={currentRole.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.iconBadge, isCompactWeb && styles.iconBadgeCompact]}
            >
              <Ionicons name={currentRole.icon} size={isCompactWeb ? 18 : 22} color={Colors.white} />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text variant="h4" weight="bold">
                {currentRole.headline}
              </Text>
              <Spacer size="xs" />
              <Text variant="bodySmall" style={styles.subtitleText}>
                {currentRole.subtitle}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, isCompactWeb && styles.dividerCompact]} />

          {/* Features */}
          <View style={[styles.featuresContainer, isCompactWeb && styles.featuresContainerCompact]}>
            {currentRole.features.map((feature, index) => (
              <FeatureRow
                key={`${activeTab}-${index}`}
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
                accentColor={currentRole.accentColor}
                index={index}
                compact={isCompactWeb}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </>
  );

  // On web, use flex layout without scroll for compact fit
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.innerContainer}>
          <View style={styles.webContentContainer}>
            {renderContent()}
          </View>

          {/* Fixed Footer */}
          <View style={[styles.footer, isCompactWeb && styles.footerCompact]}>
            <Button
              variant={activeTab === 'dealer' ? 'primary' : 'accent'}
              size="md"
              fullWidth
              onPress={handleContinue}
            >
              Continue as {activeTab === 'dealer' ? 'Dealer' : 'Wholesaler'}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // On mobile, use ScrollView
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.innerContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
          <Spacer size="lg" />
        </ScrollView>

        {/* Fixed Footer */}
        <View style={styles.footer}>
          <Button
            variant={activeTab === 'dealer' ? 'primary' : 'accent'}
            size="md"
            fullWidth
            onPress={handleContinue}
          >
            Continue as {activeTab === 'dealer' ? 'Dealer' : 'Wholesaler'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

/**
 * Feature Row with staggered animation
 */
interface FeatureRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accentColor: string;
  index: number;
  compact?: boolean;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ icon, title, description, accentColor, index, compact = false }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    // Reset and animate
    fadeAnim.setValue(0);
    slideAnim.setValue(15);

    const delay = index * 50;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [title, fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.featureRow,
        compact && styles.featureRowCompact,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={[styles.featureIconWrapper, compact && styles.featureIconWrapperCompact, { backgroundColor: accentColor + '12' }]}>
        <Ionicons name={icon} size={compact ? 14 : 16} color={accentColor} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text variant="bodySmall" weight="semibold" style={styles.featureTitle}>
          {title}
        </Text>
        {!compact && (
          <Text variant="caption" style={styles.featureDesc}>
            {description}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEF2',
  },
  innerContainer: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.xs,
  },
  brandText: {
    color: Colors.primary,
  },
  // Tab Styles
  tabContainer: {
    paddingHorizontal: Spacing.xs,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabIndicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    borderRadius: BorderRadius.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs + 2,
    zIndex: 1,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    color: Colors.text,
  },
  tabTextActive: {
    color: Colors.white,
  },
  // Card Styles
  cardWrapper: {
    width: '100%',
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  subtitleText: {
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  featuresContainer: {
    gap: Spacing.xs,
  },
  // Feature Row Styles
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  featureIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    color: Colors.text,
    marginBottom: 1,
  },
  featureDesc: {
    color: Colors.textMuted,
  },
  // Footer - Consistent with OnboardingActions
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  // Web-specific styles
  webContentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    justifyContent: 'center',
  },
  // Compact styles for smaller web viewports
  cardWrapperCompact: {
    flex: 1,
  },
  mainCardCompact: {
    padding: Spacing.md,
  },
  iconBadgeCompact: {
    width: 36,
    height: 36,
  },
  dividerCompact: {
    marginVertical: Spacing.sm,
  },
  featuresContainerCompact: {
    gap: 0,
  },
  featureRowCompact: {
    paddingVertical: Spacing.xs,
  },
  featureIconWrapperCompact: {
    width: 28,
    height: 28,
  },
  footerCompact: {
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
});

export default WelcomeScreen;
