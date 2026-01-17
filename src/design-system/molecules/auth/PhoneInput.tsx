/**
 * PhoneInput Molecule Component
 *
 * Australian phone number input with country code prefix and validation.
 * Format: +61 4XX XXX XXX (9 digits after country code)
 *
 * @example
 * <PhoneInput
 *   value={phone}
 *   onChange={setPhone}
 *   error={phoneError}
 * />
 */

import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Text } from '../../atoms/Text';
import { Colors, Spacing, BorderRadius, Typography } from '../../primitives';

export interface PhoneInputProps {
  /** Phone number value (without country code, formatted with spaces) */
  value: string;
  /** Change handler */
  onChange: (text: string) => void;
  /** Validation error message */
  error?: string;
}

/**
 * PhoneInput molecule
 *
 * Displays +61 prefix and validates Australian mobile format: 4XX XXX XXX
 * Automatically formats with spaces for readability.
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  // Format phone number with spaces: 412 345 678
  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, '');

    // Remove leading 0 if user types it (since we show +61)
    const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits;

    // Limit to 9 digits (Australian mobile without leading 0)
    const limited = withoutLeadingZero.slice(0, 9);

    // Format: 4XX XXX XXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    }
  };

  const handleChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChange(formatted);
  };

  const hasError = !!error;
  const borderColor = hasError
    ? Colors.error
    : isFocused
    ? Colors.primary
    : Colors.border;

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.label}>
        Phone Number
      </Text>

      <View style={[
        styles.inputContainer,
        {
          borderColor,
          borderWidth: isFocused ? 2 : 1.5,
        }
      ]}>
        {/* Country Code Prefix */}
        <View style={styles.prefixContainer}>
          <Text variant="body" style={styles.prefixText}>+61</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        <TextInput
          value={value}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="phone-pad"
          placeholder="412 345 678"
          placeholderTextColor={Colors.textTertiary}
          style={styles.input}
          maxLength={11} // "412 345 678" = 11 chars with spaces
        />
      </View>

      {error && (
        <Text variant="caption" color="error" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: Colors.white,
    minHeight: 48,
    overflow: 'hidden',
  },
  prefixContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.greyscale100,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  prefixText: {
    color: Colors.text,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.border,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: Platform.OS === 'android' ? Typography.fontSize.lg : Typography.fontSize.base,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'android' ? Spacing.sm : 10,
  },
  errorText: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

/**
 * Validate Australian phone number
 * Format: 4XX XXX XXX (must start with 4, total 9 digits - without country code)
 *
 * @param phone - Phone number string (without country code, may have spaces)
 * @returns Error message or null if valid
 */
export const validateAustralianPhone = (phone: string): string | null => {
  // Remove spaces and formatting
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) {
    return 'Phone number is required';
  }

  // Must be exactly 9 digits (without leading 0 or country code)
  if (digits.length !== 9) {
    return 'Phone number must be 9 digits';
  }

  // Must start with 4 (Australian mobile)
  if (!digits.startsWith('4')) {
    return 'Mobile number must start with 4';
  }

  return null;
};
