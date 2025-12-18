/**
 * PricingScreen
 *
 * Step 6 of the Sell Vehicle flow.
 * Handles repairable write-off question, asking price, and pickup location.
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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';

// Design System
import { Text, Spacer, Button } from '../../design-system';
import { Colors, Spacing, BorderRadius, Shadows } from '../../design-system/primitives';

// Context
import { useSell, WriteOffDetails, PricingDetails, PickupLocation } from '../../contexts/SellContext';

// Data
import { AUSTRALIAN_STATES } from '../../data/australia';

type PricingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pricing'>;

type PricingScreenRouteProp = RouteProp<RootStackParamList, 'Pricing'>;

interface PricingScreenProps {
  navigation: PricingScreenNavigationProp;
  route: PricingScreenRouteProp;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({ navigation, route }) => {
  const { listingData, setWriteOff, setPricing, setPickupLocation } = useSell();
  const fromReview = route.params?.fromReview ?? false;

  // Local state
  const [isWriteOff, setIsWriteOff] = useState(listingData.writeOff.isWriteOff);
  const [writeOffExplanation, setWriteOffExplanation] = useState(
    listingData.writeOff.explanation || ''
  );
  const [askingPrice, setAskingPrice] = useState(
    listingData.pricing.askingPrice > 0
      ? formatCurrency(listingData.pricing.askingPrice.toString())
      : ''
  );
  const [location, setLocation] = useState<PickupLocation>(listingData.pickupLocation);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  // Format currency
  function formatCurrency(value: string): string {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString('en-AU');
  }

  // Parse currency to number
  function parseCurrency(value: string): number {
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  }

  // Update location field
  const updateLocationField = useCallback(
    (field: keyof PickupLocation, value: string) => {
      setLocation((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Validate form
  const isFormValid = (): boolean => {
    if (parseCurrency(askingPrice) <= 0) return false;
    if (isWriteOff && !writeOffExplanation.trim()) return false;
    if (!location.suburb.trim() || !location.state || !location.postcode.trim()) return false;
    return true;
  };

  // Handle continue
  const handleContinue = useCallback(() => {
    const writeOffData: WriteOffDetails = {
      isWriteOff,
      explanation: isWriteOff ? writeOffExplanation.trim() : undefined,
    };

    const pricingData: PricingDetails = {
      askingPrice: parseCurrency(askingPrice),
      negotiable: true, // Price is always negotiable
    };

    setWriteOff(writeOffData);
    setPricing(pricingData);
    setPickupLocation(location);

    if (fromReview) {
      navigation.goBack();
    } else {
      navigation.navigate('ReviewPublish');
    }
  }, [
    isWriteOff,
    writeOffExplanation,
    askingPrice,
    location,
    setWriteOff,
    setPricing,
    setPickupLocation,
    navigation,
    fromReview,
  ]);

  // Handle back
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={styles.headerTitle}>
          Pricing & Location
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
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '86%' }]} />
              </View>
              <Text variant="caption" color="textMuted" style={styles.stepText}>
                Step 6 of 7
              </Text>
            </View>
          )}

          {!fromReview && <Spacer size="xs" />}

          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Ionicons name="pricetag-outline" size={36} color={Colors.primary} />
          </View>

          <Spacer size="md" />

          {/* Title */}
          <Text variant="bodySmall" weight="bold" align="center">
            Set Your Price
          </Text>
          <Spacer size="xs" />
          <Text variant="label" color="textSecondary" align="center">
            Price your vehicle and set pickup location
          </Text>

          <Spacer size="lg" />

          {/* Repairable Write-Off Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrapper, { backgroundColor: Colors.warning + '15' }]}>
                <Ionicons name="alert-circle" size={16} color={Colors.warning} />
              </View>
              <Text variant="bodySmall" weight="semibold">
                Repairable Write-Off
              </Text>
            </View>

            <Spacer size="sm" />

            <Text variant="label" color="textSecondary">
              Has this vehicle ever been declared a repairable write-off (WOVR)?
            </Text>

            <Spacer size="md" />

            {/* Yes/No Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleOption, !isWriteOff && styles.toggleOptionActive]}
                onPress={() => setIsWriteOff(false)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={!isWriteOff ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={!isWriteOff ? Colors.success : Colors.textMuted}
                />
                <Text
                  variant="bodySmall"
                  weight={!isWriteOff ? 'semibold' : 'regular'}
                  color={!isWriteOff ? 'success' : 'textMuted'}
                >
                  No
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleOption, isWriteOff && styles.toggleOptionActiveWarning]}
                onPress={() => setIsWriteOff(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isWriteOff ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={isWriteOff ? Colors.warning : Colors.textMuted}
                />
                <Text
                  variant="bodySmall"
                  weight={isWriteOff ? 'semibold' : 'regular'}
                  style={{ color: isWriteOff ? Colors.warning : Colors.textMuted }}
                >
                  Yes
                </Text>
              </TouchableOpacity>
            </View>

            {/* Write-Off Warning & Explanation */}
            {isWriteOff && (
              <>
                <Spacer size="md" />
                <View style={styles.warningCard}>
                  <Ionicons name="warning" size={18} color={Colors.warning} />
                  <Text variant="label" color="textSecondary" style={styles.warningText}>
                    Vehicles with write-off history typically sell for less than market value.
                    Please provide details about the write-off to help buyers make informed
                    decisions.
                  </Text>
                </View>

                <Spacer size="md" />

                <Text variant="caption" weight="semibold" color="textTertiary" style={styles.labelText}>
                  WRITE-OFF EXPLANATION
                </Text>
                <Spacer size="xs" />
                <View style={styles.explanationWrapper}>
                  <TextInput
                    style={styles.explanationInput}
                    placeholder="Explain the circumstances of the write-off and repairs made..."
                    placeholderTextColor={Colors.textMuted}
                    value={writeOffExplanation}
                    onChangeText={setWriteOffExplanation}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
          </View>

          <Spacer size="lg" />

          {/* Asking Price Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <Ionicons name="cash-outline" size={16} color={Colors.primary} />
              </View>
              <Text variant="bodySmall" weight="semibold">
                Asking Price
              </Text>
            </View>

            <Spacer size="md" />

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconWrapper}>
                <Text variant="caption" weight="bold" color="primary">
                  $
                </Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter asking price"
                placeholderTextColor={Colors.textMuted}
                value={askingPrice}
                onChangeText={(text) => setAskingPrice(formatCurrency(text))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Spacer size="lg" />

          {/* Pickup Location Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrapper, { backgroundColor: Colors.secondary + '15' }]}>
                <Ionicons name="location-outline" size={16} color={Colors.secondary} />
              </View>
              <Text variant="bodySmall" weight="semibold">
                Pickup Location
              </Text>
            </View>

            <Spacer size="md" />

            {/* Street Address (Optional) */}
            <Text variant="label" weight="semibold" color="textTertiary" style={styles.labelText}>
              STREET ADDRESS (OPTIONAL)
            </Text>
            <Spacer size="xs" />
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="home-outline" size={16} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="123 Example Street"
                placeholderTextColor={Colors.textMuted}
                value={location.streetAddress}
                onChangeText={(text) => updateLocationField('streetAddress', text)}
              />
            </View>

            <Spacer size="md" />

            {/* Suburb */}
            <Text variant="label" weight="semibold" color="textTertiary" style={styles.labelText}>
              SUBURB *
            </Text>
            <Spacer size="xs" />
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="business-outline" size={16} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter suburb"
                placeholderTextColor={Colors.textMuted}
                value={location.suburb}
                onChangeText={(text) => updateLocationField('suburb', text)}
              />
            </View>

            <Spacer size="md" />

            {/* State & Postcode Row */}
            <View style={styles.row}>
              {/* State */}
              <View style={styles.halfColumn}>
                <Text variant="label" weight="semibold" color="textTertiary" style={styles.labelText}>
                  STATE *
                </Text>
                <Spacer size="xs" />
                <TouchableOpacity
                  style={styles.stateSelector}
                  onPress={() => setShowStateDropdown(!showStateDropdown)}
                  activeOpacity={0.7}
                >
                  <View style={styles.stateSelectorIcon}>
                    <Ionicons name="map-outline" size={16} color={Colors.primary} />
                  </View>
                  <Text
                    variant="bodySmall"
                    style={!location.state ? styles.placeholderText : undefined}
                  >
                    {location.state || 'Select'}
                  </Text>
                  <Ionicons
                    name={showStateDropdown ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.textMuted}
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
                            location.state === state.value && styles.dropdownItemActive,
                            index === AUSTRALIAN_STATES.length - 1 && styles.dropdownItemLast,
                          ]}
                          onPress={() => {
                            updateLocationField('state', state.value);
                            setShowStateDropdown(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            variant="bodySmall"
                            weight={location.state === state.value ? 'semibold' : 'regular'}
                            color={location.state === state.value ? 'primary' : 'text'}
                          >
                            {state.label}
                          </Text>
                          {location.state === state.value && (
                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Postcode */}
              <View style={styles.halfColumn}>
                <Text variant="label" weight="semibold" color="textTertiary" style={styles.labelText}>
                  POSTCODE *
                </Text>
                <Spacer size="xs" />
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconWrapper}>
                    <Ionicons name="mail-outline" size={16} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0000"
                    placeholderTextColor={Colors.textMuted}
                    value={location.postcode}
                    onChangeText={(text) =>
                      updateLocationField('postcode', text.replace(/[^0-9]/g, '').slice(0, 4))
                    }
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          </View>

          <Spacer size="xl" />

          {/* Continue/Done Button */}
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={handleContinue}
            disabled={!isFormValid()}
            iconRight={fromReview ? 'checkmark' : 'arrow-forward'}
          >
            {fromReview ? 'Done' : 'Review Listing'}
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
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
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

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  toggleOptionActive: {
    backgroundColor: Colors.success + '12',
    borderColor: Colors.success,
  },
  toggleOptionActiveWarning: {
    backgroundColor: Colors.warning + '12',
    borderColor: Colors.warning,
  },

  // Warning
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  warningText: {
    flex: 1,
    lineHeight: 20,
  },

  // Labels
  labelText: {
    letterSpacing: 0.8,
  },

  // Explanation Input
  explanationWrapper: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  explanationInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
  },

  // Input Wrapper
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  inputIconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '12',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text,
  },

  // Row
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfColumn: {
    flex: 1,
  },

  // State Selector
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  stateSelectorIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '12',
  },
  placeholderText: {
    flex: 1,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.md,
  },

  // Dropdown
  dropdown: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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

});

export default PricingScreen;
