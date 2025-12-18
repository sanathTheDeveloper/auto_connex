/**
 * VehicleDetailsFormScreen
 *
 * Step 2 of the Sell Vehicle flow.
 * Displays auto-filled vehicle details from rego lookup.
 * Allows users to review and edit the information.
 *
 * Design: Follows brand guidelines with gradient background,
 * proper typography, and consistent spacing.
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';

// Design System
import { Text, Spacer, Accordion, Button } from '../../design-system';
import { Colors, Spacing, BorderRadius, Shadows } from '../../design-system/primitives';

// Context
import { useSell, maskVIN, VehicleBasicDetails } from '../../contexts/SellContext';

// Data
import { AUSTRALIAN_STATES } from '../../data/australia';

type VehicleDetailsFormScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VehicleDetailsForm'
>;

type VehicleDetailsFormScreenRouteProp = RouteProp<RootStackParamList, 'VehicleDetailsForm'>;

interface VehicleDetailsFormScreenProps {
  navigation: VehicleDetailsFormScreenNavigationProp;
  route: VehicleDetailsFormScreenRouteProp;
}

const TOTAL_STEPS = 7;
const CURRENT_STEP = 2;

// Dropdown options
const TRANSMISSION_OPTIONS = [
  { label: 'Automatic', value: 'automatic' },
  { label: 'Manual', value: 'manual' },
];

const FUEL_TYPE_OPTIONS = [
  { label: 'Petrol', value: 'petrol' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Electric', value: 'electric' },
];

const BODY_TYPE_OPTIONS = [
  { label: 'Sedan', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Hatchback', value: 'Hatchback' },
  { label: 'Ute', value: 'Ute' },
  { label: 'Wagon', value: 'Wagon' },
  { label: 'Coupe', value: 'Coupe' },
  { label: 'Convertible', value: 'Convertible' },
  { label: 'Van', value: 'Van' },
];

export const VehicleDetailsFormScreen: React.FC<VehicleDetailsFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { listingData, setVehicleDetails } = useSell();
  const fromReview = route.params?.fromReview ?? false;

  // Local form state initialized from context
  const [formData, setFormData] = useState<VehicleBasicDetails>(
    listingData.vehicleDetails || {
      registration: '',
      state: '',
      make: '',
      model: '',
      variant: '',
      year: new Date().getFullYear(),
      color: '',
      bodyType: '',
      transmission: 'automatic',
      fuelType: 'petrol',
      engineSize: '',
      vin: '',
      mileage: 0,
      hasLogbook: false,
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof VehicleBasicDetails, string>>>({});

  // Update field
  const updateField = useCallback(
    <K extends keyof VehicleBasicDetails>(field: K, value: VehicleBasicDetails[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof VehicleBasicDetails, string>> = {};

    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year is required';
    }
    if (!formData.mileage || formData.mileage < 0) {
      newErrors.mileage = 'Valid mileage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle continue
  const handleContinue = useCallback(() => {
    if (validate()) {
      setVehicleDetails(formData);
      if (fromReview) {
        navigation.goBack();
      } else {
        navigation.navigate('PhotoUpload');
      }
    }
  }, [validate, setVehicleDetails, formData, navigation, fromReview]);

  // Handle back
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Masked VIN for display
  const maskedVIN = useMemo(() => maskVIN(formData.vin), [formData.vin]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={styles.headerTitle}>
          Vehicle Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Section - Hidden when editing from review */}
        {!fromReview && (
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
        )}

        {!fromReview && <Spacer size="xs" />}

        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text variant="label" weight="semibold" color="success">
            Vehicle Found
          </Text>
          <Text variant="label" color="textMuted">
            — Verify details below
          </Text>
        </View>

        <Spacer size="md" />

        {/* Vehicle Summary Card */}
        <View style={styles.vehicleSummaryCard}>
          <View style={styles.vehicleIconWrapper}>
            <Ionicons name="car-sport" size={24} color={Colors.primary} />
          </View>
          <View style={styles.vehicleSummaryInfo}>
            <Text variant="body" weight="semibold">
              {formData.year} {formData.make} {formData.model}
            </Text>
            <Text variant="body" color="textMuted">
              {formData.variant || 'Standard'} | {formData.registration}
            </Text>
          </View>
        </View>

        <Spacer size="lg" />

        {/* Basic Information Accordion */}
        <Accordion title="Basic Information" icon="car-outline" defaultExpanded={true}>
          <View style={styles.formSection}>
            {/* Two Column Grid */}
            <View style={styles.twoColumnGrid}>
              {/* Registration (Read-only) */}
              <View style={styles.gridItem}>
                <FormField
                  label="Registration"
                  value={formData.registration}
                  editable={false}
                  icon="document-text-outline"
                />
              </View>

              {/* Make */}
              <View style={styles.gridItem}>
                <FormField
                  label="Make"
                  value={formData.make}
                  onChangeText={(text) => updateField('make', text)}
                  placeholder="e.g., Toyota"
                  error={errors.make}
                  icon="car-sport-outline"
                />
              </View>

              {/* Model */}
              <View style={styles.gridItem}>
                <FormField
                  label="Model"
                  value={formData.model}
                  onChangeText={(text) => updateField('model', text)}
                  placeholder="e.g., Camry"
                  error={errors.model}
                />
              </View>

              {/* Variant */}
              <View style={styles.gridItem}>
                <FormField
                  label="Variant / Trim"
                  value={formData.variant}
                  onChangeText={(text) => updateField('variant', text)}
                  placeholder="e.g., SL, Grande"
                />
              </View>

              {/* Year */}
              <View style={styles.gridItem}>
                <FormField
                  label="Year"
                  value={formData.year.toString()}
                  onChangeText={(text) => updateField('year', parseInt(text) || 0)}
                  placeholder="e.g., 2021"
                  keyboardType="number-pad"
                  error={errors.year}
                  icon="calendar-outline"
                />
              </View>

              {/* Color */}
              <View style={styles.gridItem}>
                <FormField
                  label="Color"
                  value={formData.color}
                  onChangeText={(text) => updateField('color', text)}
                  placeholder="e.g., White"
                  icon="color-palette-outline"
                />
              </View>
            </View>
          </View>
        </Accordion>

        <Spacer size="sm" />

        {/* Technical Specifications Accordion */}
        <Accordion title="Technical Specifications" icon="settings-outline" defaultExpanded={false}>
          <View style={styles.formSection}>
            {/* Two Column Grid */}
            <View style={styles.twoColumnGrid}>
              {/* Body Type */}
              <View style={styles.gridItem}>
                <SelectField
                  label="Body Type"
                  value={formData.bodyType}
                  options={BODY_TYPE_OPTIONS}
                  onSelect={(value) => updateField('bodyType', value)}
                  placeholder="Select type"
                />
              </View>

              {/* Transmission */}
              <View style={styles.gridItem}>
                <SelectField
                  label="Transmission"
                  value={formData.transmission}
                  options={TRANSMISSION_OPTIONS}
                  onSelect={(value) => updateField('transmission', value as 'automatic' | 'manual')}
                  placeholder="Select"
                />
              </View>

              {/* Fuel Type */}
              <View style={styles.gridItem}>
                <SelectField
                  label="Fuel Type"
                  value={formData.fuelType}
                  options={FUEL_TYPE_OPTIONS}
                  onSelect={(value) =>
                    updateField('fuelType', value as 'petrol' | 'diesel' | 'hybrid' | 'electric')
                  }
                  placeholder="Select fuel"
                />
              </View>

              {/* Engine Size */}
              <View style={styles.gridItem}>
                <FormField
                  label="Engine Size"
                  value={formData.engineSize}
                  onChangeText={(text) => updateField('engineSize', text)}
                  placeholder="e.g., 2.5L"
                />
              </View>

              {/* Mileage - Full Width */}
              <View style={styles.gridItemFull}>
                <FormField
                  label="Odometer (km)"
                  value={formData.mileage > 0 ? formData.mileage.toString() : ''}
                  onChangeText={(text) => updateField('mileage', parseInt(text.replace(/,/g, '')) || 0)}
                  placeholder="e.g., 45000"
                  keyboardType="number-pad"
                  error={errors.mileage}
                  icon="speedometer-outline"
                />
              </View>
            </View>
          </View>
        </Accordion>

        <Spacer size="sm" />

        {/* VIN & Registration Accordion */}
        <Accordion title="VIN & Registration" icon="shield-checkmark-outline" defaultExpanded={false}>
          <View style={styles.formSection}>
            {/* Two Column Grid */}
            <View style={styles.twoColumnGrid}>
              {/* VIN (Masked) - Full Width */}
              <View style={styles.gridItemFull}>
                <View style={styles.fieldContainer}>
                  <Text variant="label" weight="semibold" style={styles.inputLabel}>
                    VIN (VEHICLE IDENTIFICATION NUMBER)
                  </Text>
                  <Spacer size="xs" />
                  <View style={styles.maskedFieldContainer}>
                    <View style={styles.lockIconWrapper}>
                      <Ionicons name="lock-closed" size={14} color={Colors.primary} />
                    </View>
                    <Text variant="bodySmall" color="textSecondary" style={styles.maskedFieldText}>
                      {maskedVIN || 'Not available'}
                    </Text>
                  </View>
                  <Text variant="label" color="textMuted" style={styles.fieldHint}>
                    VIN is partially masked for security
                  </Text>
                </View>
              </View>

              {/* State */}
              <View style={styles.gridItemFull}>
                <SelectField
                  label="Registered State"
                  value={formData.state}
                  options={AUSTRALIAN_STATES}
                  onSelect={(value) => updateField('state', value)}
                  placeholder="Select state"
                />
              </View>
            </View>
          </View>
        </Accordion>

        <Spacer size="sm" />

        {/* Service Logbook Card */}
        <View style={styles.logbookCard}>
          <View style={styles.logbookHeader}>
            <View style={styles.logbookIconWrapper}>
              <Ionicons name="book-outline" size={18} color={Colors.success} />
            </View>
            <Text variant="bodySmall" weight="semibold">
              Service History
            </Text>
          </View>
          <Spacer size="md" />
          <TouchableOpacity
            style={[
              styles.checkboxContainer,
              formData.hasLogbook && styles.checkboxContainerActive,
            ]}
            onPress={() => updateField('hasLogbook', !formData.hasLogbook)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                formData.hasLogbook && styles.checkboxActive,
              ]}
            >
              {formData.hasLogbook && (
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              )}
            </View>
            <View style={styles.checkboxContent}>
              <Text variant="bodySmall" weight={formData.hasLogbook ? 'semibold' : 'regular'}>
                Full Service Logbook
              </Text>
              <Text variant="label" color="textMuted">
                Vehicle has documented service history
              </Text>
            </View>
            {formData.hasLogbook && (
              <View style={styles.logbookBadge}>
                <Ionicons name="book" size={14} color={Colors.success} />
              </View>
            )}
          </TouchableOpacity>
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
    </SafeAreaView>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  editable?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'email-address';
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  editable = true,
  keyboardType = 'default',
}) => (
  <View style={styles.fieldContainer}>
    <Text variant="label" weight="semibold" style={styles.inputLabel}>
      {label.toUpperCase()}
    </Text>
    <Spacer size="xs" />
    <View style={[styles.inputContainer, error && styles.inputContainerError, !editable && styles.inputContainerDisabled]}>
      {icon && (
        <View style={styles.fieldIconWrapper}>
          <Ionicons name={icon} size={16} color={editable ? Colors.primary : Colors.textMuted} />
        </View>
      )}
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        editable={editable}
        keyboardType={keyboardType}
      />
    </View>
    {error && (
      <View style={styles.errorRow}>
        <Ionicons name="alert-circle" size={12} color={Colors.accent} />
        <Text variant="label" style={styles.errorText}>
          {error}
        </Text>
      </View>
    )}
  </View>
);

interface SelectFieldProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.fieldContainer}>
      <Text variant="label" weight="semibold" style={styles.inputLabel}>
        {label.toUpperCase()}
      </Text>
      <Spacer size="xs" />
      <TouchableOpacity
        style={[styles.selectContainer, isOpen && styles.selectContainerFocused]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text
          variant="bodySmall"
          style={[styles.selectText, !selectedOption && styles.selectPlaceholder]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textMuted}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.selectDropdown}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectOption,
                  value === option.value && styles.selectOptionActive,
                  index === options.length - 1 && styles.selectOptionLast,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  variant="bodySmall"
                  weight={value === option.value ? 'semibold' : 'regular'}
                  color={value === option.value ? 'primary' : 'text'}
                >
                  {option.label}
                </Text>
                {value === option.value && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

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

  // Success Banner
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '12',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },

  // Vehicle Summary Card
  vehicleSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  vehicleIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  vehicleSummaryInfo: {
    flex: 1,
  },

  // Form Section
  formSection: {
    gap: Spacing.sm,
  },

  // Two Column Grid
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
  },
  gridItemFull: {
    width: '100%',
    paddingHorizontal: Spacing.xs,
  },

  // Field Container
  fieldContainer: {
    marginBottom: Spacing.sm,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  inputContainerError: {
    borderColor: Colors.accent,
  },
  inputContainerDisabled: {
    backgroundColor: Colors.greyscale100,
  },
  fieldIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'VesperLibre',
    color: Colors.text,
    paddingVertical: 0,
  },
  inputDisabled: {
    color: Colors.textMuted,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  errorText: {
    color: Colors.accent,
  },

  // Masked Field
  maskedFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  lockIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  maskedFieldText: {
    flex: 1,
    letterSpacing: 1,
  },
  fieldHint: {
    marginTop: Spacing.xs,
  },

  // Select Field
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  selectContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  selectText: {
    flex: 1,
  },
  selectPlaceholder: {
    color: Colors.textMuted,
  },
  selectDropdown: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxHeight: 200,
    ...Shadows.lg,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectOptionActive: {
    backgroundColor: Colors.primary + '08',
  },
  selectOptionLast: {
    borderBottomWidth: 0,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  checkboxContainerActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '08',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkboxContent: {
    flex: 1,
  },
  logbookBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logbook Card
  logbookCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  logbookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logbookIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VehicleDetailsFormScreen;
