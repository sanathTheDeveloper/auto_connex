/**
 * RegoLookupScreen
 *
 * Step 1 of the Sell Vehicle flow.
 * Allows users to enter their vehicle registration plate
 * and automatically fetch vehicle details.
 *
 * Design: Follows brand guidelines with gradient background,
 * proper typography, and consistent spacing.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

// Design System
import { Text, Spacer, Button } from '../../design-system';
import { Colors, Spacing, BorderRadius, Shadows } from '../../design-system/primitives';

// Context
import { useSell } from '../../contexts/SellContext';

// Services
import { lookupRego } from '../../services/mockAPI';

// Data
import { AUSTRALIAN_STATES } from '../../data/australia';

type RegoLookupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegoLookup'>;

interface RegoLookupScreenProps {
  navigation: RegoLookupScreenNavigationProp;
}

const TOTAL_STEPS = 7;
const CURRENT_STEP = 1;

export const RegoLookupScreen: React.FC<RegoLookupScreenProps> = ({ navigation }) => {
  const { setVehicleDetails, resetFlow } = useSell();

  // Form state
  const [registration, setRegistration] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  // Format registration (uppercase, remove special chars)
  const formatRego = (text: string): string => {
    return text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  };

  // Handle registration lookup
  const handleLookup = useCallback(async () => {
    if (!registration.trim()) {
      setError('Please enter a registration number');
      return;
    }
    if (!selectedState) {
      setError('Please select a state');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await lookupRego(registration, selectedState);

      if (result) {
        setVehicleDetails(result);
        navigation.navigate('VehicleDetailsForm');
      } else {
        setError('Vehicle not found. Please check the registration number and try again.');
      }
    } catch (err) {
      setError('Failed to lookup vehicle. Please try again.');
      console.error('Rego lookup error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [registration, selectedState, setVehicleDetails, navigation]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    resetFlow();
    navigation.goBack();
  }, [resetFlow, navigation]);

  const isFormValid = registration.trim().length >= 5 && selectedState;

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={styles.headerTitle}>
          Sell Vehicle
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(CURRENT_STEP / TOTAL_STEPS) * 100}%` },
                ]}
              />
            </View>
          </View>
          <Text variant="caption" color="textMuted" style={styles.stepText}>
            Step {CURRENT_STEP} of {TOTAL_STEPS}
          </Text>
        </View>

        <Spacer size="xl" />

        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Ionicons name="car-sport" size={36} color={Colors.primary} />
        </View>

        <Spacer size="lg" />

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text variant="h3" weight="semibold" align="center" style={styles.title}>
            Enter Registration
          </Text>
          <Spacer size="xs" />
          <Text variant="body" color="textSecondary" align="center">
            We'll automatically fetch your vehicle details
          </Text>
        </View>

        <Spacer size="xl" />

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Registration Input */}
          <View style={styles.inputGroup}>
            <Text variant="label" weight="semibold" style={styles.inputLabel}>
              REGISTRATION NUMBER
            </Text>
            <Spacer size="xs" />
            <View style={[styles.inputContainer, error && styles.inputError]}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ABC123"
                placeholderTextColor={Colors.textMuted}
                value={registration}
                onChangeText={(text) => {
                  setRegistration(formatRego(text));
                  setError(null);
                }}
                autoCapitalize="characters"
                maxLength={7}
              />
            </View>
          </View>

          <Spacer size="lg" />

          {/* State Selector */}
          <View style={styles.inputGroup}>
            <Text variant="label" weight="semibold" style={styles.inputLabel}>
              STATE / TERRITORY
            </Text>
            <Spacer size="xs" />
            <TouchableOpacity
              style={[styles.inputContainer, showStateDropdown && styles.inputFocused]}
              onPress={() => setShowStateDropdown(!showStateDropdown)}
              activeOpacity={0.7}
            >
              <View style={styles.inputIconWrapper}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
              </View>
              <Text
                variant="bodySmall"
                style={[styles.selectorText, !selectedState && styles.placeholderText]}
              >
                {selectedState ? AUSTRALIAN_STATES.find(s => s.value === selectedState)?.label : 'Select state'}
              </Text>
              <Ionicons
                name={showStateDropdown ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.textMuted}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>

            {/* State Dropdown */}
            {showStateDropdown && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {AUSTRALIAN_STATES.map((state, index) => (
                    <TouchableOpacity
                      key={state.value}
                      style={[
                        styles.dropdownItem,
                        selectedState === state.value && styles.dropdownItemActive,
                        index === AUSTRALIAN_STATES.length - 1 && styles.dropdownItemLast,
                      ]}
                      onPress={() => {
                        setSelectedState(state.value);
                        setShowStateDropdown(false);
                        setError(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        variant="bodySmall"
                        weight={selectedState === state.value ? 'semibold' : 'regular'}
                        color={selectedState === state.value ? 'primary' : 'text'}
                      >
                        {state.label}
                      </Text>
                      {selectedState === state.value && (
                        <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <>
              <Spacer size="md" />
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={14} color={Colors.accent} />
                <Text variant="label" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            </>
          )}
        </View>

        <Spacer size="xl" />

        {/* Lookup Button */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={handleLookup}
          disabled={!isFormValid || isLoading}
          loading={isLoading}
          iconLeft="search"
        >
          Look Up Vehicle
        </Button>

        <Spacer size="2xl" />
      </ScrollView>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },

  // Progress
  progressSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  stepText: {
    letterSpacing: 0.5,
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

  // Title
  titleSection: {
    alignItems: 'center',
  },
  title: {
    color: Colors.text,
  },

  // Form Card
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    color: Colors.textTertiary,
    letterSpacing: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.accent,
  },
  inputIconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    letterSpacing: 0.5,
  },
  selectorText: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  chevronIcon: {
    marginRight: Spacing.md,
  },

  // Dropdown
  dropdown: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxHeight: 200,
    ...Shadows.md,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: Colors.primary + '10',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent + '12',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent + '25',
  },
  errorText: {
    flex: 1,
    color: Colors.accent,
  },

});

export default RegoLookupScreen;
