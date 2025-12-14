/**
 * WelcomeScreen Component
 * 
 * User type selection screen (Dealer vs Wholesaler).
 * Modern design with gradient backgrounds, animated cards, and brand-compliant typography.
 * Follows competitor patterns (Cartrade/Cars24) with Auto Connex brand identity.
 * 
 * @example
 * <Stack.Screen name="Welcome" component={WelcomeScreen} opt  description  checkmarkIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },olor: Colors.greyscale700,
    lineHeight: 17,
  },={{ heade  featureText: {
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
    color: Colors.greyscale700,
  },: false }} />
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../design-system/atoms/Text';
import { Spacer } from '../../design-system/atoms/Spacer';
import { PillButton } from '../../design-system/atoms/PillButton';
import { Card } from '../../design-system/molecules/Card';
import { Colors, Spacing, BorderRadius, Shadows, responsive } from '../../design-system/primitives';

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

type UserType = 'dealer' | 'wholesaler' | null;

/**
 * WelcomeScreen
 * 
 * Allows users to select their role:
 * - Dealer: Retail focus (buying vehicles for resale to consumers)
 * - Wholesaler: Inventory focus (selling bulk vehicles to dealers)
 * 
 * Selection is stored and passed to signup flow.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState<UserType>(null);

  /**
   * Handle user type selection with scale animation
   */
  const handleSelectType = (type: UserType) => {
    setSelectedType(type);
  };

  /**
   * Continue to signup with selected user type
   */
  const handleContinue = () => {
    if (selectedType) {
      navigation.navigate('Signup', { userType: selectedType });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[
          Colors.backgroundAlt,
          Colors.tealLight + '15',
          Colors.primary + '20',
          Colors.backgroundAlt
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradientBackground}
      >
        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="h2" weight="bold" align="center">
              What brings you here?
            </Text>
            <Spacer size="sm" />
            <Text variant="body" align="center" style={styles.subtitle}>
              Select your role to get started
            </Text>
          </View>

          <Spacer size="2xl" />

          {/* User Type Cards */}
          <View style={styles.cardsContainer}>
            {/* Dealer Card */}
            <UserTypeCard
              type="dealer"
              icon="storefront"
              title="I am a Dealer"
              description="Buy vehicles from wholesalers for retail sales"
              features={[
                'Access nationwide inventory',
                'PPSR verified vehicles',
                'Instant quotes & financing'
              ]}
              isSelected={selectedType === 'dealer'}
              onSelect={() => handleSelectType('dealer')}
            />

            <Spacer size="lg" />

            {/* Wholesaler Card */}
            <UserTypeCard
              type="wholesaler"
              icon="business"
              title="I am a Wholesaler"
              description="Sell vehicles in bulk to verified dealers"
              features={[
                'List inventory instantly',
                'Direct buyer contact',
                'Lower marketplace fees'
              ]}
              isSelected={selectedType === 'wholesaler'}
              onSelect={() => handleSelectType('wholesaler')}
            />
          </View>

          <Spacer size="3xl" />
        </ScrollView>

        {/* Fixed Continue Button */}
        <View style={styles.footer}>
          <PillButton
            variant="next"
            onPress={handleContinue}
            disabled={!selectedType}
            style={styles.continueButton}
          >
            Continue
          </PillButton>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

/**
 * UserTypeCard Component
 * Selectable card with radio-style selection and scale animation
 */
interface UserTypeCardProps {
  type: 'dealer' | 'wholesaler';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const UserTypeCard: React.FC<UserTypeCardProps> = ({
  type,
  icon,
  title,
  description,
  features,
  isSelected,
  onSelect,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  // Gradient colors based on type
  const gradientColors: [string, string] = type === 'dealer' 
    ? [Colors.primary, Colors.secondary]
    : [Colors.accent, '#FF6B8A'];

  return (
    <TouchableOpacity
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Card
          variant="outlined"
          style={StyleSheet.flatten([
            styles.card, 
            isSelected && styles.cardSelected,
            isSelected && { shadowColor: Colors.primary }
          ])}
        >
          {/* Checkmark indicator - Top Right */}
          {isSelected && (
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            </View>
          )}

          {/* Icon and Title Row */}
          <View style={styles.headerRow}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Ionicons name={icon} size={24} color={Colors.white} />
            </LinearGradient>

            {/* Title - Volkhov Font */}
            <Text variant="h4" weight="semibold" style={styles.cardTitle}>
              {title}
            </Text>
          </View>

          <Spacer size="md" />

          {/* Description - Vesper Libre Font */}
          <Text variant="body" style={styles.description}>
            {description}
          </Text>

          <Spacer size="md" />

          {/* Features List - Vesper Libre Font */}
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkmarkIcon}>
                <Ionicons name="checkmark" size={12} color={Colors.primary} />
              </View>
              <Text variant="bodySmall" style={styles.featureText}>
                {feature}
              </Text>
            </View>
          ))}
        </Card>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: responsive.getSpacing('lg'),
    paddingTop: responsive.getSpacing('xl'),
    paddingBottom: responsive.getSpacing('md'),
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  header: {
    paddingHorizontal: responsive.getSpacing('sm'),
    marginBottom: responsive.getSpacing('md'),
  },
  subtitle: {
    color: Colors.greyscale700,
    opacity: 0.9,
  },
  cardsContainer: {
    width: '100%',
  },
  card: {
    padding: responsive.getSpacing('xl'),
    position: 'relative',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    ...Shadows.md,
  },
  checkmarkCircle: {
    position: 'absolute',
    top: responsive.getSpacing('md'),
    right: responsive.getSpacing('md'),
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  cardTitle: {
    marginLeft: responsive.getSpacing('md'),
    flex: 1,
  },
  description: {
    color: Colors.greyscale700,
    lineHeight: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsive.getSpacing('sm'),
    paddingRight: responsive.getSpacing('xs'),
  },
  checkmarkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureText: {
    marginLeft: responsive.getSpacing('sm'),
    flex: 1,
    color: Colors.greyscale700,
  },
  footer: {
    paddingHorizontal: responsive.getSpacing('lg'),
    paddingVertical: responsive.getSpacing('md'),
    paddingBottom: responsive.getSpacing('lg'),
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  continueButton: {
    minWidth: 200,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
});

export default WelcomeScreen;
