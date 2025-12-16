/**
 * PaymentModal Component
 *
 * Reusable Stripe-style payment modal with card input and save card option.
 * Used for both offer acceptance payments and purchase payments.
 *
 * @example
 * <PaymentModal
 *   visible={showPayment}
 *   onClose={() => setShowPayment(false)}
 *   onPaymentSuccess={(paymentData) => handleSuccess(paymentData)}
 *   amount={25000}
 *   vehicleInfo={{ make: 'Toyota', model: 'Camry', year: 2021 }}
 * />
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../design-system/atoms/Text';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  saveCard: boolean;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  variant?: string;
}

export interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentData: PaymentData) => void;
  amount: number;
  vehicleInfo?: VehicleInfo;
  title?: string;
  subtitle?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
};

const getCardType = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'unknown' => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return 'unknown';
};

const getCardIcon = (cardType: string): keyof typeof Ionicons.glyphMap => {
  switch (cardType) {
    case 'visa':
    case 'mastercard':
    case 'amex':
      return 'card';
    default:
      return 'card-outline';
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  amount,
  vehicleInfo,
  title = 'Complete Payment',
  subtitle,
}) => {
  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardType = getCardType(cardNumber);

  // Reset form when modal opens
  const handleModalShow = useCallback(() => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setSaveCard(false);
    setErrors({});
    setIsProcessing(false);
  }, []);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanedCardNumber = cardNumber.replace(/\D/g, '');
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      newErrors.cardNumber = 'Enter a valid card number';
    }

    const cleanedExpiry = expiryDate.replace(/\D/g, '');
    if (cleanedExpiry.length !== 4) {
      newErrors.expiryDate = 'Enter valid expiry (MM/YY)';
    } else {
      const month = parseInt(cleanedExpiry.slice(0, 2), 10);
      const year = parseInt('20' + cleanedExpiry.slice(2), 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    const cvvLength = cardType === 'amex' ? 4 : 3;
    if (cvv.length !== cvvLength) {
      newErrors.cvv = `Enter ${cvvLength}-digit CVV`;
    }

    if (cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Enter cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardNumber, expiryDate, cvv, cardholderName, cardType]);

  // Handle payment submission
  const handlePayment = useCallback(async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing (1.5s delay for demo)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessing(false);

    onPaymentSuccess({
      cardNumber: cardNumber.replace(/\D/g, ''),
      expiryDate: expiryDate.replace(/\D/g, ''),
      cvv,
      cardholderName,
      saveCard,
    });
  }, [validateForm, cardNumber, expiryDate, cvv, cardholderName, saveCard, onPaymentSuccess]);

  // Handle card number input
  const handleCardNumberChange = useCallback((text: string) => {
    setCardNumber(formatCardNumber(text));
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  }, [errors.cardNumber]);

  // Handle expiry date input
  const handleExpiryDateChange = useCallback((text: string) => {
    setExpiryDate(formatExpiryDate(text));
    if (errors.expiryDate) {
      setErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  }, [errors.expiryDate]);

  // Handle CVV input
  const handleCvvChange = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3);
    setCvv(cleaned);
    if (errors.cvv) {
      setErrors(prev => ({ ...prev, cvv: '' }));
    }
  }, [cardType, errors.cvv]);

  // Handle cardholder name input
  const handleCardholderNameChange = useCallback((text: string) => {
    setCardholderName(text);
    if (errors.cardholderName) {
      setErrors(prev => ({ ...prev, cardholderName: '' }));
    }
  }, [errors.cardholderName]);

  const formattedAmount = `$${amount.toLocaleString()}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleModalShow}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardView}
            >
              <View style={styles.modalContainer}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Header */}
                  <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                      <Ionicons name="shield-checkmark" size={24} color={Colors.white} />
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text variant="h4" weight="bold" align="center">{title}</Text>

                  {subtitle && (
                    <>
                      <Spacer size="xs" />
                      <Text variant="bodySmall" color="textMuted" align="center">
                        {subtitle}
                      </Text>
                    </>
                  )}

                  <Spacer size="md" />

                  {/* Vehicle Info (if provided) */}
                  {vehicleInfo && (
                    <>
                      <View style={styles.vehicleInfoCard}>
                        <Ionicons name="car-sport" size={20} color={Colors.primary} />
                        <Text variant="bodySmall" weight="medium" style={styles.vehicleInfoText}>
                          {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                          {vehicleInfo.variant && ` ${vehicleInfo.variant}`}
                        </Text>
                      </View>
                      <Spacer size="md" />
                    </>
                  )}

                  {/* Amount Display */}
                  <View style={styles.amountContainer}>
                    <Text variant="caption" color="textMuted">Total Amount</Text>
                    <Text variant="h2" weight="bold" color="primary">
                      {formattedAmount}
                    </Text>
                  </View>

                  <Spacer size="lg" />

                  {/* Card Input Form */}
                  <View style={styles.formSection}>
                    {/* Card Number */}
                    <View style={styles.inputGroup}>
                      <Text variant="caption" weight="medium" style={styles.inputLabel}>
                        Card Number
                      </Text>
                      <View style={[styles.inputContainer, errors.cardNumber && styles.inputError]}>
                        <Ionicons
                          name={getCardIcon(cardType)}
                          size={20}
                          color={cardType !== 'unknown' ? Colors.primary : Colors.textMuted}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="1234 5678 9012 3456"
                          placeholderTextColor={Colors.textMuted}
                          value={cardNumber}
                          onChangeText={handleCardNumberChange}
                          keyboardType="numeric"
                          maxLength={19}
                          autoComplete="cc-number"
                        />
                      </View>
                      {errors.cardNumber && (
                        <Text variant="caption" style={styles.errorText}>{errors.cardNumber}</Text>
                      )}
                    </View>

                    {/* Expiry and CVV Row */}
                    <View style={styles.rowInputs}>
                      {/* Expiry Date */}
                      <View style={[styles.inputGroup, styles.halfInput]}>
                        <Text variant="caption" weight="medium" style={styles.inputLabel}>
                          Expiry
                        </Text>
                        <View style={[styles.inputContainer, errors.expiryDate && styles.inputError]}>
                          <TextInput
                            style={styles.input}
                            placeholder="MM/YY"
                            placeholderTextColor={Colors.textMuted}
                            value={expiryDate}
                            onChangeText={handleExpiryDateChange}
                            keyboardType="numeric"
                            maxLength={5}
                            autoComplete="cc-exp"
                          />
                        </View>
                        {errors.expiryDate && (
                          <Text variant="caption" style={styles.errorText}>{errors.expiryDate}</Text>
                        )}
                      </View>

                      {/* CVV */}
                      <View style={[styles.inputGroup, styles.halfInput]}>
                        <Text variant="caption" weight="medium" style={styles.inputLabel}>
                          CVV
                        </Text>
                        <View style={[styles.inputContainer, errors.cvv && styles.inputError]}>
                          <TextInput
                            style={styles.input}
                            placeholder={cardType === 'amex' ? '1234' : '123'}
                            placeholderTextColor={Colors.textMuted}
                            value={cvv}
                            onChangeText={handleCvvChange}
                            keyboardType="numeric"
                            maxLength={cardType === 'amex' ? 4 : 3}
                            secureTextEntry
                            autoComplete="cc-csc"
                          />
                          <Ionicons name="lock-closed" size={16} color={Colors.textMuted} />
                        </View>
                        {errors.cvv && (
                          <Text variant="caption" style={styles.errorText}>{errors.cvv}</Text>
                        )}
                      </View>
                    </View>

                    {/* Cardholder Name */}
                    <View style={styles.inputGroup}>
                      <Text variant="caption" weight="medium" style={styles.inputLabel}>
                        Cardholder Name
                      </Text>
                      <View style={[styles.inputContainer, errors.cardholderName && styles.inputError]}>
                        <Ionicons name="person-outline" size={20} color={Colors.textMuted} />
                        <TextInput
                          style={styles.input}
                          placeholder="John Smith"
                          placeholderTextColor={Colors.textMuted}
                          value={cardholderName}
                          onChangeText={handleCardholderNameChange}
                          autoCapitalize="words"
                          autoComplete="name"
                        />
                      </View>
                      {errors.cardholderName && (
                        <Text variant="caption" style={styles.errorText}>{errors.cardholderName}</Text>
                      )}
                    </View>
                  </View>

                  <Spacer size="md" />

                  {/* Save Card Option */}
                  <TouchableOpacity
                    style={styles.saveCardRow}
                    onPress={() => setSaveCard(!saveCard)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
                      {saveCard && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                    </View>
                    <View style={styles.saveCardTextContainer}>
                      <Text variant="bodySmall" weight="medium">
                        Save card for future payments
                      </Text>
                      <Text variant="caption" color="textMuted">
                        Your card details are encrypted and secure
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <Spacer size="lg" />

                  {/* Pay Button */}
                  <TouchableOpacity
                    style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                    onPress={handlePayment}
                    activeOpacity={0.8}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <View style={styles.processingContainer}>
                        <View style={styles.spinner} />
                        <Text variant="bodySmall" weight="semibold" style={styles.payButtonText}>
                          Processing...
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Ionicons name="lock-closed" size={18} color={Colors.white} />
                        <Text variant="bodySmall" weight="semibold" style={styles.payButtonText}>
                          Pay {formattedAmount}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text variant="bodySmall" weight="medium" color="textMuted">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  {/* Security Badge */}
                  <View style={styles.securityBadge}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={Colors.success} />
                    <Text variant="caption" color="textMuted">
                      Secured with 256-bit SSL encryption
                    </Text>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.black + 'AA',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    maxHeight: '90%',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg,
    maxHeight: '100%',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  vehicleInfoText: {
    color: Colors.text,
    flex: 1,
  },
  amountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
  },
  formSection: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  inputLabel: {
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: Platform.OS === 'ios' ? Spacing.xs : 0,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: Colors.error,
    marginTop: 2,
  },
  saveCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  saveCardTextContainer: {
    flex: 1,
    gap: 2,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  payButtonDisabled: {
    backgroundColor: Colors.primary + '80',
  },
  payButtonText: {
    color: Colors.white,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.white + '40',
    borderTopColor: Colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
});

export default PaymentModal;
