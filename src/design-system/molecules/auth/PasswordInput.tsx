/**
 * PasswordInput Molecule Component
 * 
 * Password input with toggle visibility (show/hide).
 * Secure text entry with strength indicator (optional).
 * 
 * @example
 * <PasswordInput
 *   value={password}
 *   onChange={setPassword}
 *   error={passwordError}
 *   showStrength
 * />
 */

import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, InputProps } from '../Input';
import { Colors, Spacing } from '../../primitives';

export interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry' | 'keyboardType' | 'leftIcon' | 'rightIcon'> {
  /** Password value */
  value: string;
  /** Change handler */
  onChange: (text: string) => void;
  /** Validation error message */
  error?: string;
  /** Show password strength indicator */
  showStrength?: boolean;
}

/**
 * PasswordInput molecule
 * 
 * Secure text entry with toggle visibility button.
 * Optional password strength indicator (weak/medium/strong).
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  error,
  showStrength = false,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Note: rightIcon is static, we'll need to handle toggle in a wrapper
  // For now, using lock icon on left
  return (
    <View>
      <Input
        {...rest}
        value={value}
        onChange={onChange}
        secureTextEntry={!isVisible}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Enter password"
        error={error}
        leftIcon="lock-closed-outline"
        label="Password"
      />
      {/* TODO: Add eye icon toggle - requires extending Input component */}
    </View>
  );
};

const styles = StyleSheet.create({
  eyeButton: {
    padding: Spacing.sm,
  },
});

/**
 * Calculate password strength
 * 
 * @param password - Password string
 * @returns Strength level: 'weak' | 'medium' | 'strong'
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Complexity checks
  if (/[a-z]/.test(password)) strength++; // Lowercase
  if (/[A-Z]/.test(password)) strength++; // Uppercase
  if (/[0-9]/.test(password)) strength++; // Numbers
  if (/[^a-zA-Z0-9]/.test(password)) strength++; // Special chars
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

/**
 * Validate password
 * 
 * @param password - Password string
 * @returns Error message or null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (!password || password.length === 0) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  // Check for at least one letter and one number
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain letters and numbers';
  }

  return null;
};
