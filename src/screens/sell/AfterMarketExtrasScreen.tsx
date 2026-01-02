/**
 * AfterMarketExtrasScreen
 *
 * Step 5 of the Sell Vehicle flow.
 * Allows users to add after-market extras as a simple list.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  ScaledSize,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';

// Design System
import { Text, Spacer, Button, ProgressBar } from '../../design-system';
import { Colors, Spacing, SpacingMobile, BorderRadius, Shadows } from '../../design-system/primitives';

/**
 * Get responsive spacing based on viewport width
 */
const getResponsiveSpacing = (size: keyof typeof Spacing, viewportWidth: number): number => {
  if (viewportWidth <= 480) {
    return SpacingMobile[size];
  }
  return Spacing[size];
};

// Context
import { useSell, AfterMarketExtra, generateId } from '../../contexts/SellContext';

type AfterMarketExtrasScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AfterMarketExtras'
>;

type AfterMarketExtrasScreenRouteProp = RouteProp<RootStackParamList, 'AfterMarketExtras'>;

interface AfterMarketExtrasScreenProps {
  navigation: AfterMarketExtrasScreenNavigationProp;
  route: AfterMarketExtrasScreenRouteProp;
}

// Common after-market extras suggestions
const SUGGESTIONS = [
  'Aftermarket Wheels',
  'Tinted Windows',
  'Roof Racks',
  'Bull Bar',
  'Tow Bar',
  'Dash Camera',
  'Sound System',
  'LED Headlights',
  'Sports Exhaust',
  'Suspension Upgrade',
];

export const AfterMarketExtrasScreen: React.FC<AfterMarketExtrasScreenProps> = ({ navigation, route }) => {
  const { listingData, setAfterMarketExtras } = useSell();
  const fromReview = route.params?.fromReview ?? false;

  // Viewport state for responsive design
  const [viewportWidth, setViewportWidth] = useState(() => Dimensions.get('window').width);

  // Listen for viewport changes (for web browser resize/inspect mode)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setViewportWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Responsive values
  const responsivePadding = getResponsiveSpacing('lg', viewportWidth);

  // Local state
  const [extras, setExtras] = useState<AfterMarketExtra[]>(listingData.afterMarketExtras);
  const [newExtraName, setNewExtraName] = useState('');

  // Add extra
  const addExtra = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      // Check if already added
      const exists = extras.some((e) => e.name.toLowerCase() === trimmedName.toLowerCase());
      if (!exists) {
        const extra: AfterMarketExtra = {
          id: generateId(),
          name: trimmedName,
          cost: 0,
        };
        setExtras((prev) => [...prev, extra]);
      }
    }
  }, [extras]);

  // Add custom extra
  const addCustomExtra = useCallback(() => {
    if (newExtraName.trim()) {
      addExtra(newExtraName);
      setNewExtraName('');
    }
  }, [newExtraName, addExtra]);

  // Remove extra
  const removeExtra = useCallback((id: string) => {
    setExtras((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Handle continue
  const handleContinue = useCallback(() => {
    setAfterMarketExtras(extras);
    if (fromReview) {
      navigation.goBack();
    } else {
      navigation.navigate('Pricing');
    }
  }, [extras, setAfterMarketExtras, navigation, fromReview]);

  // Handle back
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Check if suggestion is already added
  const isSuggestionAdded = (name: string): boolean => {
    return extras.some((e) => e.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={styles.headerTitle}>
          After-Market Extras
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator - Hidden when editing from review */}
          {!fromReview && (
            <>
              <ProgressBar 
                currentStep={5} 
                totalSteps={7} 
                stepLabel="Aftermarket Extras"
                variant="minimal"
              />
              <Spacer size="sm" />
            </>
          )}

          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Ionicons name="construct-outline" size={36} color={Colors.primary} />
          </View>

          <Spacer size="md" />

          {/* Title */}
          <Text variant="bodySmall" weight="bold" align="center">
            Extras & Modifications
          </Text>
          <Spacer size="xs" />
          <Text variant="label" color="textSecondary" align="center">
            List any after-market additions or upgrades
          </Text>

          <Spacer size="lg" />

          {/* Added Extras List */}
          {extras.length > 0 && (
            <>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrapper, { backgroundColor: Colors.success + '15' }]}>
                    <Ionicons name="list" size={16} color={Colors.success} />
                  </View>
                  <Text variant="bodySmall" weight="semibold">
                    Added Extras
                  </Text>
                  <View style={styles.countBadge}>
                    <Text variant="caption" weight="bold" style={styles.countText}>
                      {extras.length}
                    </Text>
                  </View>
                </View>

                <Spacer size="md" />

                {extras.map((extra) => (
                  <View key={extra.id} style={styles.extraItem}>
                    <View style={styles.extraIconWrapper}>
                      <Ionicons name="build" size={18} color={Colors.primary} />
                    </View>
                    <Text variant="bodySmall" weight="medium" style={styles.extraName}>
                      {extra.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeExtra(extra.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={22} color={Colors.accent} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Spacer size="lg" />
            </>
          )}

          {/* Quick Add Suggestions Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <Ionicons name="flash" size={16} color={Colors.primary} />
              </View>
              <Text variant="bodySmall" weight="semibold">
                Quick Add
              </Text>
            </View>

            <Spacer size="md" />

            <View style={styles.suggestionsGrid}>
              {SUGGESTIONS.map((suggestion) => {
                const isAdded = isSuggestionAdded(suggestion);
                return (
                  <TouchableOpacity
                    key={suggestion}
                    style={[styles.suggestionChip, isAdded && styles.suggestionChipAdded]}
                    onPress={() => !isAdded && addExtra(suggestion)}
                    disabled={isAdded}
                    activeOpacity={0.7}
                  >
                    <Text
                      variant="caption"
                      color={isAdded ? 'primary' : 'textSecondary'}
                      weight={isAdded ? 'semibold' : 'regular'}
                    >
                      {suggestion}
                    </Text>
                    {isAdded && (
                      <Ionicons name="checkmark" size={14} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Spacer size="lg" />

            {/* Custom Extra Input */}
            <View style={styles.customInputRow}>
              <View style={styles.nameInputWrapper}>
                <View style={styles.inputIconWrapper}>
                  <Ionicons name="add-outline" size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Add custom extra..."
                  placeholderTextColor={Colors.textMuted}
                  value={newExtraName}
                  onChangeText={setNewExtraName}
                  onSubmitEditing={addCustomExtra}
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity
                style={[styles.addButton, !newExtraName.trim() && styles.addButtonDisabled]}
                onPress={addCustomExtra}
                disabled={!newExtraName.trim()}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <Spacer size="xl" />

          {/* Continue/Done Button */}
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={handleContinue}
            iconRight={fromReview ? 'checkmark' : 'arrow-forward'}
          >
            {fromReview ? 'Done' : 'Continue'}
          </Button>

          <Spacer size="2xl" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerSpacer: {
    width: 44,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },

  // Icon
  iconWrapper: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary + '20',
    ...Shadows.md,
  },

  // Section Card
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 'auto',
  },
  countText: {
    color: Colors.white,
    fontSize: 12,
  },

  // Extras List
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  extraIconWrapper: {
    marginRight: Spacing.sm,
  },
  extraName: {
    flex: 1,
  },
  removeButton: {
    padding: Spacing.xs,
  },

  // Suggestions
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  suggestionChipAdded: {
    backgroundColor: Colors.primary + '12',
    borderColor: Colors.primary,
  },

  // Custom Input
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  inputIconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '12',
  },
  nameInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  addButtonDisabled: {
    backgroundColor: Colors.greyscale300,
    elevation: 0,
    shadowOpacity: 0,
  },

});

export default AfterMarketExtrasScreen;
