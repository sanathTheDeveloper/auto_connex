/**
 * PhoneInput Molecule Component
 * 
 * Australian phone number input with country code and validation.
 * Format: +61 4XX XXX XXX (10 digits after country code)
 * 
 * @example
 * <PhoneInput
 *   value={phone}
 *   onChange={setPhone}
 *   error={phoneError}
 * />
 */

import React from 'react';
import { Input, InputProps } from '../Input';

export interface PhoneInputProps extends Omit<InputProps, 'keyboardType' | 'leftIcon'> {
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
 * Validates Australian mobile format: 04XX XXX XXX
 * Automatically formats with spaces for readability.
 * Shows phone icon as left indicator.
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  ...rest
}) => {
  // Format phone number with spaces: 0412 345 678
  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, '');
    
    // Limit to 10 digits (Australian mobile)
    const limited = digits.slice(0, 10);
    
    // Format: 04XX XXX XXX
    if (limited.length <= 4) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 4)} ${limited.slice(4)}`;
    } else {
      return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
    }
  };

  const handleChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChange(formatted);
  };

  return (
    <Input
      {...rest}
      value={value}
      onChange={handleChange}
      keyboardType="phone-pad"
      placeholder="0412 345 678"
      error={error}
      leftIcon="call"
      maxLength={12} // "0412 345 678" = 12 chars with spaces
      label="Phone Number"
    />
  );
};

/**
 * Validate Australian phone number
 * Format: 04XX XXX XXX (must start with 04, total 10 digits)
 * 
 * @param phone - Phone number string (without country code)
 * @returns Error message or null if valid
 */
export const validateAustralianPhone = (phone: string): string | null => {
  // Remove spaces and formatting
  const digits = phone.replace(/\D/g, '');
  
  // Must be exactly 10 digits
  if (digits.length !== 10) {
    return 'Phone number must be 10 digits';
  }
  
  // Must start with 04 (Australian mobile)
  if (!digits.startsWith('04')) {
    return 'Phone number must start with 04';
  }
  
  return null;
};
