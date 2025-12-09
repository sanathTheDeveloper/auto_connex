/**
 * Input Molecular Component
 * 
 * Text input with Auto Connex brand styling.
 * Uses Vesper Libre font for clarity in forms.
 * 
 * @example
 * <Input
 *   label="VIN Number"
 *   value={vin}
 *   onChange={setVin}
 *   placeholder="Enter 17-digit VIN"
 * />
 * 
 * <Input
 *   label="Price"
 *   value={price}
 *   onChange={setPrice}
 *   leftIcon="cash"
 *   error="Price must be greater than $0"
 * />
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../primitives';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';

export interface InputProps extends Omit<TextInputProps, 'onChange'> {
  /** Input label */
  label?: string;
  /** Input value */
  value?: string;
  /** Change handler */
  onChange?: (text: string) => void;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Left icon name */
  leftIcon?: string;
  /** Right icon name */
  rightIcon?: string;
  /** Multiline input */
  multiline?: boolean;
  /** Secure text entry (password) */
  secureTextEntry?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
}

/**
 * Input component with brand-compliant styling
 * 
 * - Vesper Libre font for readability
 * - Teal focus border (#0ABAB5)
 * - Pink error states (#FF3864)
 * - Icon support
 */
export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  leftIcon,
  rightIcon,
  multiline = false,
  secureTextEntry = false,
  containerStyle,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const borderColor = hasError
    ? Colors.error
    : isFocused
    ? Colors.primary
    : Platform.OS === 'android' ? Colors.border : Colors.borderLight;

  const backgroundColor = Platform.OS === 'android'
    ? Colors.background
    : (isFocused ? Colors.background : Colors.surface);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" color="text" style={styles.label}>
          {label}
        </Text>
      )}

      <View style={[
        styles.inputContainer,
        {
          borderColor,
          backgroundColor,
          borderWidth: Platform.OS === 'android' ? 1.5 : (isFocused ? 2 : 1),
        }
      ]}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size="sm"
            color={hasError ? 'error' : isFocused ? 'primary' : 'textTertiary'}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            Platform.OS !== 'android' && styles.inputIOS,
            style,
          ]}
          placeholderTextColor={Colors.textTertiary}
          keyboardAppearance={Platform.OS !== 'android' ? 'light' : undefined}
          {...rest}
        />

        {rightIcon && (
          <Icon
            name={rightIcon}
            size="sm"
            color={hasError ? 'error' : isFocused ? 'primary' : 'textTertiary'}
            style={styles.rightIcon}
          />
        )}
      </View>

      {(error || helperText) && (
        <Text
          variant="caption"
          color={error ? 'error' : 'textTertiary'}
          style={styles.helperText}
        >
          {error || helperText}
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
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Platform.OS === 'android' ? BorderRadius.md : BorderRadius.lg,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    minHeight: Platform.OS === 'android' ? 48 : 44,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.vesperLibre,
    fontSize: Platform.OS === 'android' ? Typography.fontSize.lg : Typography.fontSize.base,
    color: Colors.text,
    paddingVertical: Platform.OS === 'android' ? Spacing.sm : 10,
  },
  inputIOS: {
    letterSpacing: -0.2,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.sm,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  helperText: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default Input;
