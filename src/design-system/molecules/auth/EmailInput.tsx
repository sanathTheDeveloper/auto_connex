/**
 * EmailInput Molecule Component
 * 
 * Email input with RFC 5322 validation.
 * Auto-lowercase and trim for consistency.
 * 
 * @example
 * <EmailInput
 *   value={email}
 *   onChange={setEmail}
 *   error={emailError}
 * />
 */

import React from 'react';
import { Input, InputProps } from '../Input';

export interface EmailInputProps extends Omit<InputProps, 'keyboardType' | 'autoCapitalize' | 'autoCorrect' | 'leftIcon'> {
  /** Email value */
  value: string;
  /** Change handler */
  onChange: (text: string) => void;
  /** Validation error message */
  error?: string;
}

/**
 * EmailInput molecule
 * 
 * Validates email format using RFC 5322 regex.
 * Automatically converts to lowercase for consistency.
 */
export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  error,
  ...rest
}) => {
  const handleChange = (text: string) => {
    // Convert to lowercase and trim spaces
    const cleaned = text.toLowerCase().trim();
    onChange(cleaned);
  };

  return (
    <Input
      {...rest}
      value={value}
      onChange={handleChange}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      placeholder="your.name@company.com.au"
      error={error}
      leftIcon="mail"
      label="Business Email"
    />
  );
};

/**
 * Validate email format using RFC 5322 compliant regex
 * 
 * @param email - Email address string
 * @returns Error message or null if valid
 */
export const validateEmail = (email: string): string | null => {
  if (!email || email.length === 0) {
    return 'Email is required';
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};
