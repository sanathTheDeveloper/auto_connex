/**
 * SubscriptionCard Component
 *
 * Modern payment modal following Auto Connex brand guidelines.
 * Implements tiered transaction fee structure based on vehicle value.
 *
 * Fee Structure:
 * - <$10,000: $150 per side
 * - $10,000-$20,000: $250 per side
 * - $20,000+: $350 per side
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../design-system/atoms/Text';
import { Button } from '../design-system/atoms/Button';
import { Spacer } from '../design-system/atoms/Spacer';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../design-system/primitives';

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  saveCard: boolean;
  cardType: string;
  transactionFee: number;
  vehiclePrice: number;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  variant?: string;
  licensePlate?: string;
  dealerName?: string;
  buyerName?: string;
}

export interface SubscriptionCardProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentData: PaymentData) => void;
  amount: number;
  vehicleInfo?: VehicleInfo;
  title?: string;
  actionType: 'purchase' | 'offer';
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Tiered transaction fee structure
 * Protects dealer margins on lower-value vehicles
 */
const calculateTransactionFee = (vehiclePrice: number): number => {
  if (vehiclePrice < 10000) return 150;
  if (vehiclePrice < 20000) return 250;
  return 350;
};

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
};

const detectCardType = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return 'generic';
};

const formatPrice = (price: number): string => {
  return `$${price.toLocaleString()}`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  amount,
  vehicleInfo,
  actionType,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const transactionFee = useMemo(() => calculateTransactionFee(amount), [amount]);
  const totalPayable = transactionFee;
  const cardType = detectCardType(cardNumber);

  // Animation values
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;
  const successFadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;
  const cardCheckmarkAnim = useRef(new Animated.Value(0)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;

  // Animate modal entrance
  useEffect(() => {
    if (visible && !showSuccess) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible) {
      slideAnim.setValue(600);
      fadeAnim.setValue(0);
    }
  }, [visible, showSuccess]);

  // Animate success state
  useEffect(() => {
    if (showSuccess) {
      // Reset animation values
      successFadeAnim.setValue(0);
      successScaleAnim.setValue(0);
      checkmarkScaleAnim.setValue(0);

      // Run all animations in parallel for immediate visual feedback
      Animated.parallel([
        Animated.timing(successFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(successScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        // Checkmark bounces in slightly delayed but in parallel
        Animated.sequence([
          Animated.delay(150),
          Animated.spring(checkmarkScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
        ]),
      ]).start();
    } else {
      successFadeAnim.setValue(0);
      successScaleAnim.setValue(0);
      checkmarkScaleAnim.setValue(0);
    }
  }, [showSuccess]);

  // Animate card validation checkmark
  useEffect(() => {
    if (cardNumber.length > 14) {
      Animated.spring(cardCheckmarkAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }).start();
    } else {
      cardCheckmarkAnim.setValue(0);
    }
  }, [cardNumber]);

  // Animate error shake
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const validateAndPay = async () => {
    const cleanedCard = cardNumber.replace(/\s/g, '');
    const cleanedExpiry = expiryDate.replace('/', '');

    if (cleanedCard.length < 15) {
      setError('Please enter a valid card number');
      return;
    }
    if (cleanedExpiry.length < 4) {
      setError('Please enter a valid expiry date');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV');
      return;
    }

    setError('');
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setShowSuccess(true);

    setTimeout(() => {
      const paymentData: PaymentData = {
        cardNumber: cleanedCard,
        expiryDate,
        cvv,
        cardholderName: '',
        saveCard,
        cardType,
        transactionFee,
        vehiclePrice: amount,
      };
      onPaymentSuccess(paymentData);
      resetForm();
    }, 2500);
  };

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setSaveCard(false);
    setShowSuccess(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Success State
  if (showSuccess) {
    return (
      <Modal visible={visible} transparent animationType="none">
        <Animated.View style={[styles.successOverlay, { opacity: successFadeAnim }]}>
          <Animated.View
            style={[
              styles.successCard,
              {
                transform: [
                  { scale: successScaleAnim },
                  {
                    translateY: successScaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: successFadeAnim,
              },
            ]}
          >
            {/* Decorative circles */}
            <View style={styles.successDecoCircle1} />
            <View style={styles.successDecoCircle2} />
            <View style={styles.successDecoCircle3} />

            {/* Success Icon with rings */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconOuterRing} />
              <View style={styles.successIconMiddleRing} />
              <View style={styles.successIconCircle}>
                <Animated.View
                  style={{
                    transform: [{ scale: checkmarkScaleAnim }],
                  }}
                >
                  <Ionicons name="checkmark" size={36} color={Colors.white} />
                </Animated.View>
              </View>
            </View>

            <Spacer size="lg" />

            {/* Success Badge */}
            <View style={styles.successBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
              <Text variant="caption" weight="semibold" style={styles.successBadgeText}>
                VERIFIED
              </Text>
            </View>

            <Spacer size="md" />

            <Text variant="h3" weight="bold" align="center" style={styles.successTitle}>
              Payment Successful!
            </Text>

            <Spacer size="sm" />

            {/* Amount Display */}
            <View style={styles.successAmountContainer}>
              <Text variant="caption" color="textMuted" align="center">
                Transaction Fee Paid
              </Text>
              <Text variant="h2" weight="bold" style={styles.successAmount}>
                {formatPrice(transactionFee)}
              </Text>
            </View>

            <Spacer size="md" />

            {/* Info Card */}
            <View style={styles.successInfoCard}>
              <View style={styles.successInfoRow}>
                <View style={styles.successInfoIconCircle}>
                  <Ionicons name="car-sport" size={16} color={Colors.primary} />
                </View>
                <Text variant="bodySmall" color="textSecondary" style={styles.successInfoText}>
                  You can now proceed with the vehicle transaction
                </Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalCard,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Handle Bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.headerIconCircle}>
                    <Ionicons name="card-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text variant="h4" weight="bold">
                      {actionType === 'purchase' ? 'Complete Purchase' : 'Submit Offer'}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      Secure payment processing
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Vehicle Info Card */}
                {vehicleInfo && (
                  <View style={styles.vehicleCard}>
                    {/* Vehicle Header */}
                    <View style={styles.vehicleHeader}>
                      <View style={styles.vehicleIconWrapper}>
                        <Ionicons name="car-sport" size={22} color={Colors.secondary} />
                      </View>
                      <View style={styles.vehicleHeaderText}>
                        <Text variant="bodySmall" weight="bold" numberOfLines={1}>
                          {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                        </Text>
                        {vehicleInfo.variant && (
                          <Text variant="caption" color="textSecondary" numberOfLines={1}>
                            {vehicleInfo.variant}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Vehicle Details Grid */}
                    <View style={styles.vehicleDetailsGrid}>
                      {vehicleInfo.licensePlate && (
                        <View style={styles.vehicleDetailItem}>
                          <Text variant="caption" color="textMuted" style={styles.vehicleDetailLabel}>
                            Rego
                          </Text>
                          <View style={styles.vehicleDetailValueRow}>
                            <Ionicons name="card-outline" size={12} color={Colors.textSecondary} />
                            <Text variant="caption" weight="semibold" color="text">
                              {vehicleInfo.licensePlate}
                            </Text>
                          </View>
                        </View>
                      )}
                      {vehicleInfo.dealerName && (
                        <View style={styles.vehicleDetailItem}>
                          <Text variant="caption" color="textMuted" style={styles.vehicleDetailLabel}>
                            Seller
                          </Text>
                          <View style={styles.vehicleDetailValueRow}>
                            <Ionicons name="storefront-outline" size={12} color={Colors.textSecondary} />
                            <Text variant="caption" weight="semibold" color="text" numberOfLines={1}>
                              {vehicleInfo.dealerName}
                            </Text>
                          </View>
                        </View>
                      )}
                      {vehicleInfo.buyerName && (
                        <View style={styles.vehicleDetailItem}>
                          <Text variant="caption" color="textMuted" style={styles.vehicleDetailLabel}>
                            Buyer
                          </Text>
                          <View style={styles.vehicleDetailValueRow}>
                            <Ionicons name="person-outline" size={12} color={Colors.textSecondary} />
                            <Text variant="caption" weight="semibold" color="text" numberOfLines={1}>
                              {vehicleInfo.buyerName}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Transaction Fee Display */}
                <View style={styles.feeDisplayCard}>
                  <View style={styles.feeRow}>
                    <Text variant="body" color="textSecondary">Transaction Fee</Text>
                    <Text variant="h3" weight="bold" style={styles.feeAmount}>
                      {formatPrice(totalPayable)}
                    </Text>
                  </View>

                  <View style={styles.escrowBanner}>
                    <View style={styles.escrowIconCircle}>
                      <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                    </View>
                    <View style={styles.escrowTextContainer}>
                      <Text variant="bodySmall" weight="semibold" color="text">
                        7-Day Escrow Protection
                      </Text>
                      <Text variant="caption" color="textSecondary" style={styles.escrowDescription}>
                        Payment held securely until transaction complete
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payment Form */}
                <View style={styles.paymentForm}>
                  <Text variant="bodySmall" weight="bold" style={styles.formSectionLabel}>
                    PAYMENT DETAILS
                  </Text>

                  <Spacer size="md" />

                  {/* Card Number */}
                  <View style={styles.inputGroup}>
                    <Text variant="caption" color="textSecondary" style={styles.inputLabel}>
                      Card Number
                    </Text>
                    <View style={[styles.inputWrapper, cardNumber && styles.inputWrapperFocused]}>
                      <Ionicons
                        name="card"
                        size={18}
                        color={cardType !== 'generic' ? Colors.primary : Colors.greyscale500}
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="1234 5678 9012 3456"
                        placeholderTextColor={Colors.greyscale500}
                        value={cardNumber}
                        onChangeText={(t) => { setCardNumber(formatCardNumber(t)); setError(''); }}
                        keyboardType="numeric"
                        maxLength={19}
                      />
                      {cardNumber.length > 14 && (
                        <Animated.View
                          style={{
                            transform: [
                              { scale: cardCheckmarkAnim },
                              {
                                rotate: cardCheckmarkAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '360deg'],
                                }),
                              },
                            ],
                          }}
                        >
                          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                        </Animated.View>
                      )}
                    </View>
                  </View>

                  {/* Expiry and CVV Row */}
                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, styles.halfInput]}>
                      <Text variant="caption" color="textSecondary" style={styles.inputLabel}>
                        Expiry
                      </Text>
                      <View style={[styles.inputWrapper, expiryDate && styles.inputWrapperFocused]}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="MM/YY"
                          placeholderTextColor={Colors.greyscale500}
                          value={expiryDate}
                          onChangeText={(t) => { setExpiryDate(formatExpiry(t)); setError(''); }}
                          keyboardType="numeric"
                          maxLength={5}
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, styles.halfInput]}>
                      <Text variant="caption" color="textSecondary" style={styles.inputLabel}>
                        CVV
                      </Text>
                      <View style={[styles.inputWrapper, cvv && styles.inputWrapperFocused]}>
                        <Ionicons name="lock-closed" size={14} color={Colors.greyscale500} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="123"
                          placeholderTextColor={Colors.greyscale500}
                          value={cvv}
                          onChangeText={(t) => { setCvv(t.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                          keyboardType="numeric"
                          secureTextEntry
                          maxLength={4}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Error Message */}
                  {error && (
                    <Animated.View
                      style={[
                        styles.errorBanner,
                        { transform: [{ translateX: errorShakeAnim }] },
                      ]}
                    >
                      <Ionicons name="alert-circle" size={16} color={Colors.accent} />
                      <Text variant="caption" style={styles.errorText}>{error}</Text>
                    </Animated.View>
                  )}

                  {/* Save Card Toggle */}
                  <TouchableOpacity
                    style={styles.saveCardRow}
                    onPress={() => setSaveCard(!saveCard)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkboxCircle, saveCard && styles.checkboxCircleChecked]}>
                      {saveCard && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                    </View>
                    <Text variant="bodySmall" color="textSecondary">
                      Save card for future transactions
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Security Footer */}
                <View style={styles.securityFooter}>
                  <Ionicons name="lock-closed" size={14} color={Colors.success} />
                  <Text variant="caption" color="textSecondary">
                    256-bit SSL encrypted
                  </Text>
                </View>
              </ScrollView>

              {/* Pay Button Footer */}
              <View style={styles.buttonFooter}>
                <Button
                  variant="primary"
                  fullWidth
                  onPress={validateAndPay}
                  loading={isProcessing}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalPayable)}`}
                </Button>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '90%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.greyscale300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyscale100,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.greyscale100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  // Vehicle Card
  vehicleCard: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  vehicleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleHeaderText: {
    flex: 1,
  },
  vehicleDetailsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.secondary + '15',
  },
  vehicleDetailItem: {
    flex: 1,
  },
  vehicleDetailLabel: {
    marginBottom: 2,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  vehicleDetailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Fee Display Card
  feeDisplayCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.greyscale300,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  feeAmount: {
    color: Colors.text,
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '08',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  escrowIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  escrowTextContainer: {
    flex: 1,
  },
  escrowDescription: {
    marginTop: 2,
    lineHeight: 16,
  },

  // Payment Form
  paymentForm: {
    marginBottom: Spacing.md,
  },
  formSectionLabel: {
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greyscale100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontFamily: Typography.fontFamily.vesperLibre,
    padding: 0,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent + '10',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.accent,
    flex: 1,
  },

  // Save Card Row
  saveCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.greyscale300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  checkboxCircleChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  // Security Footer
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },

  // Button Footer
  buttonFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.greyscale100,
  },

  // Success Modal Styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? 340 : undefined,
    width: Platform.OS === 'web' ? undefined : '88%',
    overflow: 'hidden',
    ...Shadows.xl,
  },
  successDecoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '08',
  },
  successDecoCircle2: {
    position: 'absolute',
    top: 20,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success + '06',
  },
  successDecoCircle3: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.tealLight + '10',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconOuterRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.success + '15',
  },
  successIconMiddleRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: Colors.success + '25',
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '12',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  successBadgeText: {
    color: Colors.success,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  successTitle: {
    color: Colors.text,
  },
  successAmountContainer: {
    alignItems: 'center',
  },
  successAmount: {
    color: Colors.success,
    marginTop: 4,
  },
  successInfoCard: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: '100%',
  },
  successInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  successInfoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successInfoText: {
    flex: 1,
    lineHeight: 18,
  },
});

export default SubscriptionCard;
