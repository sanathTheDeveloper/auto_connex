/**
 * WelcomeScreen Component
 * 
 * User type selection screen (Dealer vs Wholesaler).
 * Shows two cards with distinct options and scale animation on press.
 * Follows competitor patterns (Cartrade/Cars24).
 * 
 * @example
 * <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../design-system/atoms/Text';
import { Spacer } from '../../design-system/atoms/Spacer';
import { Button } from '../../design-system/atoms/Button';
import { Card } from '../../design-system/molecules/Card';
import { Colors, Spacing, BorderRadius } from '../../design-system/primitives';

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
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" weight="bold" align="center" style={styles.title}>
            What brings you here?
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" color="textTertiary" align="center" style={styles.subtitle}>
            Select your role to get started with your personalized experience
          </Text>
        </View>

        <Spacer size="xl" />

        {/* User Type Cards */}
        <View style={styles.cardsContainer}>
          {/* Dealer Card */}
          <UserTypeCard
            type="dealer"
            icon="storefront"
            title="I am a Dealer"
            description="Buy vehicles from wholesalers for retail sales to consumers. Access exclusive networks and pricing."
            features={[
              'Access nationwide inventory',
              'Verified sellers and history',
              'Instant quotes and financing',
              'Streamlined retail management'
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
            description="Sell vehicles in bulk to verified dealers across Australia. Manage fleet operations efficiently."
            features={[
              'List your inventory instantly',
              'Direct buyer contact',
              'Lower marketplace fees',
              'Bulk transaction tools'
            ]}
            isSelected={selectedType === 'wholesaler'}
            onSelect={() => handleSelectType('wholesaler')}
          />
        </View>

        <Spacer size="xl" />
      </ScrollView>

      {/* Fixed Continue Button */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleContinue}
          disabled={!selectedType}
        >
          Continue
        </Button>
      </View>
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
      toValue: 0.96,
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
          style={StyleSheet.flatten([styles.card, isSelected && styles.cardSelected])}
        >
          {/* Checkmark indicator - Top Right */}
          {isSelected && (
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
            </View>
          )}

          {/* Icon */}
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            <Ionicons name={icon} size={28} color={isSelected ? Colors.primary : Colors.textTertiary} />
          </View>

          <Spacer size="md" />

          {/* Title */}
          <Text variant="h4" weight="bold" color="text">
            {title}
          </Text>

          <Spacer size="xs" />

          {/* Description */}
          <Text variant="caption" color="textTertiary" style={styles.description}>
            {description}
          </Text>

          <Spacer size="md" />

          {/* Features List */}
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark" size={16} color={Colors.text} />
              <Text variant="caption" color="text" style={styles.featureText}>
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
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    opacity: 0.65,
    lineHeight: 22,
  },
  cardsContainer: {
    width: '100%',
  },
  card: {
    padding: Spacing.lg,
    position: 'relative',
    backgroundColor: Colors.white,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  checkmarkCircle: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.greyscale100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: `${Colors.primary}12`,
  },
  description: {
    lineHeight: 20,
    opacity: 0.7,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs + 2,
    paddingRight: Spacing.sm,
  },
  featureText: {
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});

export default WelcomeScreen;
