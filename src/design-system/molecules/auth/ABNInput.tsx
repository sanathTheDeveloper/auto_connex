/**
 * ABNInput Molecule Component
 * 
 * Australian Business Number (ABN) input with checksum validation.
 * Format: XX XXX XXX XXX (11 digits with spaces)
 * 
 * @example
 * <ABNInput
 *   value={abn}
 *   onChange={setAbn}
 *   error={abnError}
 * />
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Input, InputProps } from '../Input';
import { Text } from '../../atoms/Text';
import { Colors, Spacing } from '../../primitives';

export interface ABNInputProps extends Omit<InputProps, 'keyboardType' | 'leftIcon'> {
  /** ABN value (formatted with spaces) */
  value: string;
  /** Change handler */
  onChange: (text: string) => void;
  /** Validation error message */
  error?: string;
  /** Verify button handler */
  onVerify?: () => void;
  /** Show verify button */
  showVerifyButton?: boolean;
  /** Verifying state */
  isVerifying?: boolean;
  /** Is verified */
  isVerified?: boolean;
}

/**
 * ABNInput molecule
 * 
 * Validates Australian Business Number (11 digits).
 * Automatically formats with spaces: XX XXX XXX XXX
 * Uses checksum algorithm for validation.
 */
export const ABNInput: React.FC<ABNInputProps> = ({
  value,
  onChange,
  error,
  onVerify,
  showVerifyButton = false,
  isVerifying = false,
  isVerified = false,
  ...rest
}) => {
  // Format ABN with spaces: 12 345 678 901
  const formatABN = (text: string): string => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, '');
    
    // Limit to 11 digits
    const limited = digits.slice(0, 11);
    
    // Format: XX XXX XXX XXX
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 2)} ${limited.slice(2)}`;
    } else if (limited.length <= 8) {
      return `${limited.slice(0, 2)} ${limited.slice(2, 5)} ${limited.slice(5)}`;
    } else {
      return `${limited.slice(0, 2)} ${limited.slice(2, 5)} ${limited.slice(5, 8)} ${limited.slice(8)}`;
    }
  };

  const handleChange = (text: string) => {
    const formatted = formatABN(text);
    onChange(formatted);
  };

  return (
    <View>
      <View style={styles.inputWrapper}>
        <Input
          {...rest}
          value={value}
          onChange={handleChange}
          keyboardType="number-pad"
          placeholder="12 345 678 901"
          error={error}
          leftIcon="business"
          maxLength={14} // "12 345 678 901" = 14 chars with spaces
          label="Australian Business Number (ABN)"
          containerStyle={styles.inputContainer}
        />
        
        {/* Inline Verify Button */}
        {showVerifyButton && !isVerified && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={onVerify}
            disabled={isVerifying}
            activeOpacity={0.6}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text variant="label" style={styles.verifyText}>
                Verify
              </Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* Verified Indicator */}
        {isVerified && (
          <View style={styles.verifiedIndicator}>
            <Text style={styles.verifiedText}>
              ✓
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Validate ABN using checksum algorithm
 * 
 * Algorithm:
 * 1. Subtract 1 from first digit
 * 2. Multiply each digit by weight: [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
 * 3. Sum all products
 * 4. Result must be divisible by 89
 * 
 * @param abn - ABN string (with or without spaces)
 * @returns Error message or null if valid
 */
export const validateABN = (abn: string): string | null => {
  // Remove spaces and formatting
  const digits = abn.replace(/\D/g, '');
  
  // Must be exactly 11 digits
  if (digits.length !== 11) {
    return 'ABN must be 11 digits';
  }
  
  // Checksum validation
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  
  // Subtract 1 from first digit
  const firstDigit = parseInt(digits[0]) - 1;
  
  // Calculate weighted sum
  let sum = firstDigit * weights[0];
  
  for (let i = 1; i < 11; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  
  // Check if divisible by 89
  if (sum % 89 !== 0) {
    return 'Invalid ABN checksum';
  }
  
  return null;
};

const styles = StyleSheet.create({
  inputWrapper: {
    position: 'relative',
  },
  inputContainer: {
    marginBottom: 0,
  },
  verifyButton: {
    position: 'absolute',
    right: 12,
    bottom: 12, // Position from bottom to align with input field center
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 14,
  },
  verifiedIndicator: {
    position: 'absolute',
    right: 12,
    bottom: 10, // Position from bottom to align with input field center
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 26,
    color: Colors.success,
    lineHeight: 26,
  },
});

/**
 * Format ABN for display (with spaces)
 * 
 * @param abn - ABN string (digits only)
 * @returns Formatted ABN: "XX XXX XXX XXX"
 */
export const formatABNForDisplay = (abn: string): string => {
  const digits = abn.replace(/\D/g, '');
  
  if (digits.length !== 11) {
    return abn;
  }
  
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
};
