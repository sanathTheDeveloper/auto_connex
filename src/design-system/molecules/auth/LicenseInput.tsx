/**
 * LicenseInput Molecule Component
 * 
 * Dealer License input with state selection.
 * Supports LMCT (NSW/VIC) and QLD Dealer License formats.
 * 
 * @example
 * <LicenseInput
 *   value={license}
 *   onChange={setLicense}
 *   error={licenseError}
 * />
 */

import React from 'react';
import { Input, InputProps } from '../Input';

export interface LicenseInputProps extends Omit<InputProps, 'keyboardType' | 'leftIcon'> {
  /** License number value */
  value: string;
  /** Change handler */
  onChange: (text: string) => void;
  /** Validation error message */
  error?: string;
  /** Selected Australian state (for validation rules) */
  state?: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';
}

/**
 * LicenseInput molecule
 * 
 * Input for dealer/motor trader licenses.
 * Different states have different format requirements:
 * - NSW: LMCT license (Motor Dealer License)
 * - VIC: LMCT license (Motor Car Trader License)  
 * - QLD: Motor Dealer License
 * 
 * Format depends on state regulations.
 */
export const LicenseInput: React.FC<LicenseInputProps> = ({
  value,
  onChange,
  error,
  state,
  ...rest
}) => {
  const handleChange = (text: string) => {
    // Convert to uppercase for license numbers
    const uppercase = text.toUpperCase().trim();
    onChange(uppercase);
  };

  // Generate placeholder based on state
  const getPlaceholder = (): string => {
    switch (state) {
      case 'NSW':
      case 'VIC':
        return 'LMCT123456';
      case 'QLD':
        return 'MD123456';
      default:
        return 'License number';
    }
  };

  // Generate label based on state
  const getLabel = (): string => {
    switch (state) {
      case 'NSW':
        return 'NSW Motor Dealer License (LMCT)';
      case 'VIC':
        return 'VIC Motor Car Trader License (LMCT)';
      case 'QLD':
        return 'QLD Motor Dealer License';
      case 'SA':
        return 'SA Motor Trade License';
      case 'WA':
        return 'WA Motor Vehicle Dealer License';
      default:
        return 'Dealer License Number';
    }
  };

  return (
    <Input
      {...rest}
      value={value}
      onChange={handleChange}
      autoCapitalize="characters"
      autoCorrect={false}
      placeholder={getPlaceholder()}
      error={error}
      leftIcon="shield-checkmark"
      label={getLabel()}
      helperText={state ? `Enter your ${state} dealer license number` : undefined}
    />
  );
};

/**
 * Validate dealer license number
 * 
 * Basic validation - checks for minimum length and alphanumeric characters.
 * Real validation would require state-specific APIs.
 * 
 * @param license - License number string
 * @param state - Australian state
 * @returns Error message or null if valid
 */
export const validateLicense = (license: string, state?: string): string | null => {
  if (!license || license.length === 0) {
    return 'License number is required';
  }

  // Remove spaces
  const cleaned = license.replace(/\s/g, '');

  // Must be at least 6 characters
  if (cleaned.length < 6) {
    return 'License number must be at least 6 characters';
  }

  // Must contain alphanumeric characters only
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return 'License number must contain only letters and numbers';
  }

  // State-specific validation
  if (state === 'NSW' || state === 'VIC') {
    // NSW/VIC LMCT licenses typically start with "LMCT" or "MD"
    if (!cleaned.startsWith('LMCT') && !cleaned.startsWith('MD')) {
      return `${state} license should start with LMCT or MD`;
    }
  }

  if (state === 'QLD') {
    // QLD licenses typically start with "MD"
    if (!cleaned.startsWith('MD')) {
      return 'QLD license should start with MD';
    }
  }

  return null;
};
